using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WhatsApp2Pipe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInviteSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "InviteId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Invites",
                columns: table => new
                {
                    InviteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsageCount = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invites", x => x.InviteId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_InviteId",
                table: "Users",
                column: "InviteId");

            migrationBuilder.CreateIndex(
                name: "IX_Invites_Code",
                table: "Invites",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Invites_InviteId",
                table: "Users",
                column: "InviteId",
                principalTable: "Invites",
                principalColumn: "InviteId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Invites_InviteId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Invites");

            migrationBuilder.DropIndex(
                name: "IX_Users_InviteId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "InviteId",
                table: "Users");
        }
    }
}
