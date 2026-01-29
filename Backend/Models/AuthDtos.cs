namespace Backend.Models
{
    public class UserRegisterDto
    {
        public required string Name { get; set; }
        public required string UniEmail { get; set; }
        public required string Password { get; set; }
        public required string PhoneNumber { get; set; }
        public required string StudentId { get; set; }
        public required string Branch { get; set; }
        public required string Bio { get; set; }
        public string enrolledCourses { get; set; } = string.Empty;
    }



    public class LoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class EnrollmentDto
    {
        public required string UserEmail { get; set; }
        public required int CourseId { get; set; }
    }
}
