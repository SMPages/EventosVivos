using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventosVivos.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQueryPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "BuyerEmail",
                table: "Reservations",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_BuyerEmail_Status_CreatedAt",
                table: "Reservations",
                columns: new[] { "BuyerEmail", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_EventId_Status_IsLost",
                table: "Reservations",
                columns: new[] { "EventId", "Status", "IsLost" });

            migrationBuilder.CreateIndex(
                name: "IX_Events_Status_StartAt",
                table: "Events",
                columns: new[] { "Status", "StartAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Events_VenueId_StartAt_EndAt",
                table: "Events",
                columns: new[] { "VenueId", "StartAt", "EndAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_BuyerEmail_Status_CreatedAt",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_EventId_Status_IsLost",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Events_Status_StartAt",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_VenueId_StartAt_EndAt",
                table: "Events");

            migrationBuilder.AlterColumn<string>(
                name: "BuyerEmail",
                table: "Reservations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
