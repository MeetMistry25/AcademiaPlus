
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "My API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Please enter token",
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "bearer"
                });
                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type=Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        new string[]{}
                    }
                });
            });

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

            if (!string.IsNullOrEmpty(dbUrl))
            {
                // Parse the Render/Heroku style DATABASE_URL
                // Format: postgres://user:password@host:port/databasein 
                try 
                {
                    var databaseUri = new Uri(dbUrl);
                    var userInfo = databaseUri.UserInfo.Split(':');
                    
                    var npgsqlBuilder = new Npgsql.NpgsqlConnectionStringBuilder
                    {
                        Host = databaseUri.Host,
                        Port = databaseUri.Port,
                        Username = userInfo[0],
                        Password = userInfo[1],
                        Database = databaseUri.LocalPath.TrimStart('/'),
                        SslMode = Npgsql.SslMode.Require,
                        TrustServerCertificate = true
                    };
                    connectionString = npgsqlBuilder.ToString();
                    
                    builder.Services.AddDbContext<Backend.Data.UserDbContext>(options =>
                        options.UseNpgsql(connectionString));
                        
                    Console.WriteLine("--> Using PostgreSQL Database");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"--> Error parsing DATABASE_URL: {ex.Message}");
                    Console.WriteLine("--> Falling back to SQLite");
                    builder.Services.AddDbContext<Backend.Data.UserDbContext>(options =>
                         options.UseSqlite("Data Source=User.db"));
                }
            }
            else
            {
                Console.WriteLine("--> Using Local SQLite Database");
                builder.Services.AddDbContext<Backend.Data.UserDbContext>(options =>
                    options.UseSqlite("Data Source=User.db"));
            }
            


            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            // Seed Database
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<Backend.Data.UserDbContext>();
                
                if (!context.Faculties.Any())
                {
                    Console.WriteLine("Seeding Faculties...");
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "faculty table - Sheet1.csv");
                    if (System.IO.File.Exists(filePath))
                    {
                        var lines = System.IO.File.ReadAllLines(filePath);
                        for (int i = 1; i < lines.Length; i++)
                        {
                            var parts = lines[i].Split(',');
                            if (parts.Length < 8) continue;
                            context.Faculties.Add(new Backend.Models.Faculty
                            {
                                Id = parts[0].Trim(),
                                Name = parts[1].Trim(),
                                Email = parts[2].Trim(),
                                PasswordHash = parts[3].Trim(),
                                PhoneNumber = parts[4].Trim(),
                                Department = parts[5].Trim(),
                                Designation = parts[6].Trim(),
                                Experience = int.TryParse(parts[7].Trim(), out int exp) ? exp : 0
                            });
                        }
                        context.SaveChanges();
                        Console.WriteLine($"Seeded {context.Faculties.Count()} faculties.");
                    }
                }

                if (!context.Subjects.Any())
                {
                    Console.WriteLine("Seeding Subjects...");
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "subjects table - Sheet1 (1).csv");
                    if (System.IO.File.Exists(filePath))
                    {
                        var lines = System.IO.File.ReadAllLines(filePath);
                        for (int i = 1; i < lines.Length; i++)
                        {
                            var parts = ParseCsvLine(lines[i]);
                            if (parts.Count < 8) continue;
                            context.Subjects.Add(new Backend.Models.Subject
                            {
                                Name = parts[0].Trim(),
                                Location = parts[1].Trim(),
                                CoreFocus = parts[2].Trim(),
                                Prerequisites = parts[3].Trim(),
                                Duration = int.TryParse(parts[4].Trim(), out int dur) ? dur : 0,
                                TargetAudience = parts[5].Trim(),
                                SkillType = parts[6].Trim(),
                                FacultyName = parts[7].Trim()
                            });
                        }
                        context.SaveChanges();
                        Console.WriteLine($"Seeded {context.Subjects.Count()} subjects.");
                    }
                }
            }

            app.Run();
        }

        private static List<string> ParseCsvLine(string line)
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
