package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"backend/internal/model"
)

type ItemRepository interface {
	Create(ctx context.Context, item *model.Item) error
	GetByID(ctx context.Context, id string) (*model.Item, error)
	GetBySKU(ctx context.Context, sku string) (*model.Item, error)
	List(ctx context.Context, filter model.ItemFilter) ([]model.Item, int64, error)
	Update(ctx context.Context, item *model.Item) error
	SoftDelete(ctx context.Context, id string) error
	GetCategories(ctx context.Context) ([]string, error)
}

type itemRepository struct {
	db *sql.DB
}

func NewItemRepository(db *sql.DB) ItemRepository {
	return &itemRepository{db: db}
}

func (r *itemRepository) Create(ctx context.Context, item *model.Item) error {
	query := `
		INSERT INTO items (sku, name, category, unit, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	now := time.Now()
	err := r.db.QueryRowContext(ctx, query, item.SKU, item.Name, item.Category, item.Unit, now, now).
		Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "idx_items_sku_unique") || strings.Contains(err.Error(), "duplicate key") {
			return model.ErrDuplicateSKU
		}
		return err
	}
	return nil
}

func (r *itemRepository) GetByID(ctx context.Context, id string) (*model.Item, error) {
	query := `
		SELECT i.id, i.sku, i.name, i.category, i.unit,
		       COALESCE(SUM(s.qty), 0) AS total_stock,
		       i.created_at, i.updated_at, i.deleted_at
		FROM items i
		LEFT JOIN stocks s ON i.id = s.item_id
		WHERE i.id = $1 AND i.deleted_at IS NULL
		GROUP BY i.id
	`
	var item model.Item
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&item.ID, &item.SKU, &item.Name, &item.Category, &item.Unit,
		&item.TotalStock, &item.CreatedAt, &item.UpdatedAt, &item.DeletedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, model.ErrItemNotFound
		}
		return nil, err
	}
	return &item, nil
}

func (r *itemRepository) GetBySKU(ctx context.Context, sku string) (*model.Item, error) {
	query := `
		SELECT id, sku, name, category, unit, created_at, updated_at, deleted_at
		FROM items
		WHERE sku = $1 AND deleted_at IS NULL
	`
	var item model.Item
	err := r.db.QueryRowContext(ctx, query, sku).Scan(
		&item.ID, &item.SKU, &item.Name, &item.Category, &item.Unit,
		&item.CreatedAt, &item.UpdatedAt, &item.DeletedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, model.ErrItemNotFound
		}
		return nil, err
	}
	return &item, nil
}

func (r *itemRepository) List(ctx context.Context, filter model.ItemFilter) ([]model.Item, int64, error) {
	whereClauses := []string{"i.deleted_at IS NULL"}
	args := []interface{}{}
	argId := 1

	if filter.Category != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("i.category = $%d", argId))
		args = append(args, filter.Category)
		argId++
	}

	if filter.Search != "" {
		searchPattern := "%" + strings.ToLower(filter.Search) + "%"
		whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(i.name) LIKE $%d OR LOWER(i.sku) LIKE $%d)", argId, argId))
		args = append(args, searchPattern)
		argId++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM items i WHERE %s", whereSQL)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Pagination limits
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}
	offset := (filter.Page - 1) * filter.Limit

	listQuery := fmt.Sprintf(`
		SELECT i.id, i.sku, i.name, i.category, i.unit,
		       COALESCE(SUM(s.qty), 0) AS total_stock,
		       i.created_at, i.updated_at
		FROM items i
		LEFT JOIN stocks s ON i.id = s.item_id
		WHERE %s
		GROUP BY i.id
		ORDER BY i.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, argId, argId+1)

	args = append(args, filter.Limit, offset)

	rows, err := r.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []model.Item{}
	for rows.Next() {
		var item model.Item
		if err := rows.Scan(
			&item.ID, &item.SKU, &item.Name, &item.Category, &item.Unit,
			&item.TotalStock, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}

	return items, total, nil
}

func (r *itemRepository) Update(ctx context.Context, item *model.Item) error {
	query := `
		UPDATE items
		SET sku = $1, name = $2, category = $3, unit = $4, updated_at = $5
		WHERE id = $6 AND deleted_at IS NULL
	`
	now := time.Now()
	res, err := r.db.ExecContext(ctx, query, item.SKU, item.Name, item.Category, item.Unit, now, idOrString(item.ID))
	if err != nil {
		if strings.Contains(err.Error(), "idx_items_sku_unique") || strings.Contains(err.Error(), "duplicate key") {
			return model.ErrDuplicateSKU
		}
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return model.ErrItemNotFound
	}
	item.UpdatedAt = now
	return nil
}

func (r *itemRepository) SoftDelete(ctx context.Context, id string) error {
	query := `
		UPDATE items
		SET deleted_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return model.ErrItemNotFound
	}
	return nil
}

func (r *itemRepository) GetCategories(ctx context.Context) ([]string, error) {
	query := `SELECT DISTINCT category FROM items WHERE deleted_at IS NULL ORDER BY category ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := []string{}
	for rows.Next() {
		var cat string
		if err := rows.Scan(&cat); err == nil {
			categories = append(categories, cat)
		}
	}
	return categories, nil
}

func idOrString(id string) string {
	return id
}
