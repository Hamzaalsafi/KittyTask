using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KittyTask.Api.Migrations
{
    /// <inheritdoc />
    public partial class ArchiveCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Cards",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Cards",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Cards");
        }
    }
}
