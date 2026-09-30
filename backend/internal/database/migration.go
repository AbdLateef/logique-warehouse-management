package database

import (
	"database/sql"
	"log"
	"os"
)

func RunMigrations(db *sql.DB) error {
	migrationFile := "migrations/000001_init_schema.up.sql"
	content, err := os.ReadFile(migrationFile)
	if err != nil {
		log.Printf("Migration file not found at %s, trying relative path...", migrationFile)
		content, err = os.ReadFile("/app/migrations/000001_init_schema.up.sql")
		if err != nil {
			return err
		}
	}

	_, err = db.Exec(string(content))
	if err != nil {
		return err
	}

	log.Println("Database migration executed successfully")
	return nil
}
