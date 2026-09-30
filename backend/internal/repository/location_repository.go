package repository

import (
	"context"
	"database/sql"
	"errors"

	"backend/internal/model"
)

type LocationRepository interface {
	GetByID(ctx context.Context, id string) (*model.Location, error)
	List(ctx context.Context) ([]model.Location, error)
}

type locationRepository struct {
	db *sql.DB
}

func NewLocationRepository(db *sql.DB) LocationRepository {
	return &locationRepository{db: db}
}

func (r *locationRepository) GetByID(ctx context.Context, id string) (*model.Location, error) {
	query := `SELECT id, code, zone, type, created_at FROM locations WHERE id = $1`
	var loc model.Location
	err := r.db.QueryRowContext(ctx, query, id).Scan(&loc.ID, &loc.Code, &loc.Zone, &loc.Type, &loc.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, model.ErrLocationNotFound
		}
		return nil, err
	}
	return &loc, nil
}

func (r *locationRepository) List(ctx context.Context) ([]model.Location, error) {
	query := `SELECT id, code, zone, type, created_at FROM locations ORDER BY code ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	locations := []model.Location{}
	for rows.Next() {
		var loc model.Location
		if err := rows.Scan(&loc.ID, &loc.Code, &loc.Zone, &loc.Type, &loc.CreatedAt); err == nil {
			locations = append(locations, loc)
		}
	}
	return locations, nil
}
