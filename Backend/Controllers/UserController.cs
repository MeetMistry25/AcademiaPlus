using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Backend.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;

        public UserController(UserDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Backend.Models.User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Backend.Models.User>> GetUser(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<Backend.Models.User>> PostUser(UserRegisterDto request)
        {
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            
            var user = new Backend.Models.User
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                UniEmail = request.UniEmail,
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber,
                StudentId = request.StudentId,
                Branch = request.Branch,
                Bio = request.Bio,
                enrolledCourses = request.enrolledCourses
            };

            if (await _context.Users.AnyAsync(u => u.UniEmail == request.UniEmail))
            {
                return Conflict("Email already exists.");
            }

            _context.Users.Add(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserExists(user.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UniEmail == request.Email);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Wrong password.");
            }

            string token = CreateToken(user);

            return Ok(token);
        }

        private string CreateToken(Backend.Models.User user)
        {
            List<System.Security.Claims.Claim> claims = new List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.UniEmail),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role ?? "User")
            };

            var key = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration.GetSection("Jwt:Key").Value!));

            var creds = new Microsoft.IdentityModel.Tokens.SigningCredentials(key, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha512Signature);

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds,
                    issuer: _configuration.GetSection("Jwt:Issuer").Value,
                    audience: _configuration.GetSection("Jwt:Audience").Value
                );

            var jwt = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }


        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(string id, Backend.Models.User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        // POST: api/User/enroll
        [HttpPost("enroll")]
        public async Task<IActionResult> Enroll(EnrollmentDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UniEmail == request.UserEmail);
            if (user == null) return NotFound("User not found");

            var course = await _context.Subjects.FindAsync(request.CourseId);
            if (course == null) return NotFound("Course not found");

            var existing = await _context.Enrollments.FirstOrDefaultAsync(e => e.UserEmail == request.UserEmail && e.CourseId == request.CourseId);
            if (existing != null) return BadRequest("Already enrolled");

            var enrollment = new Enrollment
            {
                UserEmail = request.UserEmail,
                CourseId = request.CourseId,
                Course = course
            };

            _context.Enrollments.Add(enrollment);

            if (string.IsNullOrEmpty(user.enrolledCourses))
            {
                user.enrolledCourses = request.CourseId.ToString();
            }
            else
            {
                user.enrolledCourses += $",{request.CourseId}";
            }

            await _context.SaveChangesAsync();

            return Ok(enrollment);
        }

        // DELETE: api/User/enroll?email={email}&courseId={courseId}
        [HttpDelete("enroll")]
        public async Task<IActionResult> Unenroll([FromQuery] string email, [FromQuery] int courseId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UniEmail == email);
            if (user == null) return NotFound("User not found");

            var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.UserEmail == email && e.CourseId == courseId);
            if (enrollment == null) return NotFound("Enrollment not found");

            _context.Enrollments.Remove(enrollment);

            // Update CSV string
            if (!string.IsNullOrEmpty(user.enrolledCourses))
            {
                var courses = user.enrolledCourses.Split(',').ToList();
                courses.Remove(courseId.ToString());
                user.enrolledCourses = string.Join(",", courses);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/User/{email}/enrollments
        [HttpGet("{email}/enrollments")]
        public async Task<ActionResult<IEnumerable<object>>> GetEnrollments(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UniEmail == email);
            if (user == null) return NotFound("User not found");

            var enrollments = await _context.Enrollments
                .Where(e => e.UserEmail == email)
                .Include(e => e.Course)
                .Select(e => new {
                    CourseId = e.CourseId,
                    Title = e.Course!.Name,
                    Faculty = e.Course!.FacultyName,
                    Progress = e.Progress,
                    Status = e.Status,
                    NextClass = "Monday 10 AM"
                })
                .ToListAsync();

            return enrollments;
        }

        // GET: api/User/email/{email}
        [HttpGet("email/{email}")]
        public async Task<ActionResult<Backend.Models.User>> GetUserByEmail(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UniEmail == email);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }
        // GET: api/User/admin/stats
        [HttpGet("admin/stats")]
        public async Task<ActionResult<object>> GetAdminStats()
        {
            var totalStudents = await _context.Users.CountAsync(); // Counting all users for now
            var totalCourses = await _context.Subjects.CountAsync();
            var totalFaculty = await _context.Faculties.CountAsync();
            
            // Calculate pseudo-revenue (e.g. $100 per active enrollment)
            var totalEnrollments = await _context.Enrollments.CountAsync();
            var revenue = totalEnrollments * 100;

            var recentEnrollments = await (from e in _context.Enrollments
                                           join u in _context.Users on e.UserEmail equals u.UniEmail
                                           orderby e.EnrollmentDate descending
                                           select new
                                           {
                                               id = e.Id,
                                               student = u.Name,
                                               course = e.Course!.Name,
                                               date = e.EnrollmentDate.ToString("yyyy-MM-dd"),
                                               status = e.Status
                                           }).Take(5).ToListAsync();

            return new
            {
                TotalStudents = totalStudents,
                TotalCourses = totalCourses,
                TotalFaculty = totalFaculty,
                MonthlyRevenue = revenue,
                RecentEnrollments = recentEnrollments
            };
        }
    }
}
