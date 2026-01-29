using Microsoft.EntityFrameworkCore;
namespace Backend.Data

{
    public class UserDbContext : DbContext

    {
        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
        {
        }
        public DbSet<Backend.Models.User> Users { get; set; }
        public DbSet<Backend.Models.Faculty> Faculties { get; set; }
        public DbSet<Backend.Models.Subject> Subjects { get; set; }
        public DbSet<Backend.Models.Enrollment> Enrollments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed Admin User
            modelBuilder.Entity<Backend.Models.User>().HasData(
                new Backend.Models.User
                {
                    Id = "admin-guid-123", // Fixed GUID for consistency
                    Name = "System Admin",
                    UniEmail = "admin@edu.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin1234"), // Hash the password
                    Role = "admin", // Explicitly set role
                    PhoneNumber = "000-000-0000",
                    StudentId = "ADMIN001",
                    Branch = "Administration",
                    Bio = "System Administrator"
                }
            );
        }
    }
}
