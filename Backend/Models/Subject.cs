using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Subject
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Location { get; set; }
        public required string CoreFocus { get; set; }
        public required string Prerequisites { get; set; }
        public int Duration { get; set; }
        public required string TargetAudience { get; set; }
        public required string SkillType { get; set; }
        public required string FacultyName { get; set; }
    }
}
