using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexToEntryOccurrence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_entry_occurrence_entry_id",
                table: "entry_occurrence");

            migrationBuilder.CreateIndex(
                name: "IX_entry_occurrence_entry_id_original_start_date",
                table: "entry_occurrence",
                columns: new[] { "entry_id", "original_start_date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_entry_occurrence_entry_id_original_start_date",
                table: "entry_occurrence");

            migrationBuilder.CreateIndex(
                name: "IX_entry_occurrence_entry_id",
                table: "entry_occurrence",
                column: "entry_id");
        }
    }
}
