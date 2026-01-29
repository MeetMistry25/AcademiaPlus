using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Enrollment
    {
        [Key]
        public int Id { get; set; }

        public required string UserEmail { get; set; }

        public required int CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public Subject? Course { get; set; }

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Active"; // Active, Completed
        public int Progress { get; set; } = 0; // 0-100
    }
}
