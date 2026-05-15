using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infra.Migrations
{
    /// <inheritdoc />
    public partial class RenameEntryOcurrenceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_entry_occurrence_entries_entry_id",
                table: "entry_occurrence");

            migrationBuilder.DropPrimaryKey(
                name: "PK_entry_occurrence",
                table: "entry_occurrence");

            migrationBuilder.RenameTable(
                name: "entry_occurrence",
                newName: "entry_occurrences");

            migrationBuilder.RenameIndex(
                name: "IX_entry_occurrence_entry_id_original_start_date",
                table: "entry_occurrences",
                newName: "IX_entry_occurrences_entry_id_original_start_date");

            migrationBuilder.AddPrimaryKey(
                name: "PK_entry_occurrences",
                table: "entry_occurrences",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_entry_occurrences_entries_entry_id",
                table: "entry_occurrences",
                column: "entry_id",
                principalTable: "entries",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_entry_occurrences_entries_entry_id",
                table: "entry_occurrences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_entry_occurrences",
                table: "entry_occurrences");

            migrationBuilder.RenameTable(
                name: "entry_occurrences",
                newName: "entry_occurrence");

            migrationBuilder.RenameIndex(
                name: "IX_entry_occurrences_entry_id_original_start_date",
                table: "entry_occurrence",
                newName: "IX_entry_occurrence_entry_id_original_start_date");

            migrationBuilder.AddPrimaryKey(
                name: "PK_entry_occurrence",
                table: "entry_occurrence",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_entry_occurrence_entries_entry_id",
                table: "entry_occurrence",
                column: "entry_id",
                principalTable: "entries",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
