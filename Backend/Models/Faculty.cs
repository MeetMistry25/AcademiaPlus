namespace Backend.Models
{
    public class Faculty
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Department { get; set; }
        public required string Designation { get; set; }
        public int Experience { get; set; }
    }
}
