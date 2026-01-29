using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleAndAdminSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Bio", "Branch", "Name", "PasswordHash", "PhoneNumber", "Role", "StudentId", "UniEmail", "enrolledCourses" },
                values: new object[] { "admin-guid-123", "System Administrator", "Administration", "System Admin", "$2a$11$e0CkPm1pF/WM0Mj4naAlF.OtnmcOiraQS7mZMaWUb42GxGmOaanVC", "000-000-0000", "admin", "ADMIN001", "admin@edu.com", "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "admin-guid-123");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}
