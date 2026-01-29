using System.Numerics;

namespace Backend.Models
{
    public class User
    {

        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string UniEmail { get; set; }
        public required string PasswordHash { get; set; }
        public required string PhoneNumber { get; set; }
        public required string StudentId { get; set; }

        public required string Branch { get; set; }
        public required string Bio { get; set; }
        public string Role { get; set; } = "user"; // Default role
        public string enrolledCourses { get; set; } = string.Empty;
    }
}
