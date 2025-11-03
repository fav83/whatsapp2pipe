using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WhatsApp2Pipe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWaitlistTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Waitlist",
                columns: table => new
                {
                    WaitlistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Waitlist", x => x.WaitlistId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Waitlist_CreatedAt",
                table: "Waitlist",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Waitlist_UpdatedAt",
                table: "Waitlist",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "UQ_Waitlist_Email",
                table: "Waitlist",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Waitlist");
        }
    }
}
