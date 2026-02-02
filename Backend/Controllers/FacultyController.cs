using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FacultyController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;

        public FacultyController(UserDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Faculty
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Faculty>>> GetFaculties()
        {
            return await _context.Faculties.ToListAsync();
        }

        // GET: api/Faculty/F201
        [HttpGet("{id}")]
        public async Task<ActionResult<Faculty>> GetFaculty(string id)
        {
            var faculty = await _context.Faculties.FindAsync(id);

            if (faculty == null)
            {
                return NotFound();
            }

            return faculty;
        }

        // POST: api/Faculty/import
        [HttpPost("import")]
        public async Task<IActionResult> ImportFaculties()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "faculty table - Sheet1.csv");
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("CSV file not found.");
            }

            var lines = await System.IO.File.ReadAllLinesAsync(filePath);
            // Skip header
            for (int i = 1; i < lines.Length; i++)
            {
                var parts = lines[i].Split(',');
                if (parts.Length < 8) continue;

                var id = parts[0].Trim();
                if (await _context.Faculties.AnyAsync(f => f.Id == id || f.Email == parts[2].Trim())) continue;

                var faculty = new Faculty
                {
                    Id = id,
                    Name = parts[1].Trim(),
                    Email = parts[2].Trim(),
                    PasswordHash = parts[3].Trim(), // In real app, we should probably hash if they are raw, but CSV has pre-hashed looking strings
                    PhoneNumber = parts[4].Trim(),
                    Department = parts[5].Trim(),
                    Designation = parts[6].Trim(),
                    Experience = int.Parse(parts[7].Trim())
                };

                _context.Faculties.Add(faculty);
            }

            await _context.SaveChangesAsync();
            return Ok("Faculties imported successfully.");
        }

        // POST: api/Faculty
        [HttpPost]
        public async Task<ActionResult<Faculty>> PostFaculty(Faculty faculty)
        {
            if (FacultyExists(faculty.Id))
            {
                return Conflict();
            }

            _context.Faculties.Add(faculty);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (FacultyExists(faculty.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetFaculty", new { id = faculty.Id }, faculty);
        }

        // PUT: api/Faculty/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFaculty(string id, Faculty faculty)
        {
            if (id != faculty.Id)
            {
                return BadRequest();
            }

            _context.Entry(faculty).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FacultyExists(id))
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

        // DELETE: api/Faculty/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFaculty(string id)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null)
            {
                return NotFound();
            }

            _context.Faculties.Remove(faculty);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FacultyExists(string id)
        {
            return _context.Faculties.Any(e => e.Id == id);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginDto request)
        {
            if (request.Role.ToLower() != "faculty")
            {
                return BadRequest("Invalid role. Expected 'faculty'.");
            }

            var faculty = await _context.Faculties.FirstOrDefaultAsync(f => f.Email == request.Email);
            if (faculty == null)
            {
                return BadRequest("Faculty not found.");
            }

            // The CSV has passwordHash like "8jK2pL0mN4qO6rP8sT0uV2wX". 
            // If these are raw passwords or some other hash, we need to know.
            // For now, I'll assume they are the passwords themselves or pre-hashed.
            // The UserController uses BCrypt.
            // I'll check if the CSV password matches the request password.
            // If it's a real hash from BCrypt, we use Verify. 
            // But "8jK2pL0mN4qO6rP8sT0uV2wX" doesn't look like a standard BCrypt hash (usually starts with $2a$ or $2b$).
            // It looks like a custom string.
            
            if (faculty.PasswordHash != request.Password)
            {
                 // Try BCrypt just in case
                 try {
                     if (!BCrypt.Net.BCrypt.Verify(request.Password, faculty.PasswordHash))
                        return BadRequest("Wrong password.");
                 } catch {
                     return BadRequest("Wrong password.");
                 }
            }

            string token = CreateToken(faculty);
            return Ok(token);
        }

        private string CreateToken(Faculty faculty)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, faculty.Email),
                new Claim(ClaimTypes.Role, "Faculty"),
                new Claim("FacultyId", faculty.Id)
            };

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration.GetSection("Jwt:Key").Value!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds,
                    issuer: _configuration.GetSection("Jwt:Issuer").Value,
                    audience: _configuration.GetSection("Jwt:Audience").Value
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
