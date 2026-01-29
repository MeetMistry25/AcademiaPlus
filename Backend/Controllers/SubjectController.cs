using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly UserDbContext _context;

        public SubjectController(UserDbContext context)
        {
            _context = context;
        }

        // GET: api/Subject
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects()
        {
            return await _context.Subjects.ToListAsync();
        }

        // GET: api/Subject/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Subject>> GetSubject(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);

            if (subject == null)
            {
                return NotFound();
            }

            return subject;
        }

        // POST: api/Subject/import
        [HttpPost("import")]
        public async Task<IActionResult> ImportSubjects()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "subjects table - Sheet1 (1).csv");
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("CSV file not found.");
            }

            var lines = await System.IO.File.ReadAllLinesAsync(filePath);
            // Skip header
            for (int i = 1; i < lines.Length; i++)
            {
                var parts = ParseCsvLine(lines[i]);
                if (parts.Count < 8) continue;

                var subjectName = parts[0].Trim();
                if (await _context.Subjects.AnyAsync(s => s.Name == subjectName)) continue;

                var subject = new Subject
                {
                    Name = subjectName,
                    Location = parts[1].Trim(),
                    CoreFocus = parts[2].Trim(),
                    Prerequisites = parts[3].Trim(),
                    Duration = int.TryParse(parts[4].Trim(), out int duration) ? duration : 0,
                    TargetAudience = parts[5].Trim(),
                    SkillType = parts[6].Trim(),
                    FacultyName = parts[7].Trim()
                };

                _context.Subjects.Add(subject);
            }

            await _context.SaveChangesAsync();
            return Ok("Subjects imported successfully.");
        }

        // POST: api/Subject
        [HttpPost]
        public async Task<ActionResult<Subject>> PostSubject(Subject subject)
        {
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSubject", new { id = subject.Id }, subject);
        }

        // PUT: api/Subject/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSubject(int id, Subject subject)
        {
            if (id != subject.Id)
            {
                return BadRequest();
            }

            _context.Entry(subject).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SubjectExists(id))
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

        // DELETE: api/Subject/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null)
            {
                return NotFound();
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SubjectExists(int id)
        {
            return _context.Subjects.Any(e => e.Id == id);
        }

        private List<string> ParseCsvLine(string line)
        {
            var result = new List<string>();
            bool inQuotes = false;
            string currentField = "";

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(currentField);
                    currentField = "";
                }
                else
                {
                    currentField += c;
                }
            }
            result.Add(currentField);
            return result;
        }
    }
}
