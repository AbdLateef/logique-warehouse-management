package repository

import (
	"context"
	"database/sql"
	"errors"

	"backend/internal/model"
)

type StockRepository interface {
	ReceiveStock(ctx context.Context, itemID string, locationID string, qty int) (*model.StockDetail, error)
	TransferStock(ctx context.Context, itemID string, fromLocationID string, toLocationID string, qty int) error
	GetStockByItem(ctx context.Context, itemID string) ([]model.StockDetail, error)
	GetStockLogsByItem(ctx context.Context, itemID string) ([]model.StockMutationLogDetail, error)
}

type stockRepository struct {
	db *sql.DB
}

func NewStockRepository(db *sql.DB) StockRepository {
	return &stockRepository{db: db}
}

func (r *stockRepository) ReceiveStock(ctx context.Context, itemID string, locationID string, qty int) (*model.StockDetail, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Upsert stock quantity
	upsertQuery := `
		INSERT INTO stocks (item_id, location_id, qty, updated_at)
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
		ON CONFLICT (item_id, location_id)
		DO UPDATE SET qty = stocks.qty + $3, updated_at = CURRENT_TIMESTAMP
		RETURNING id, qty, updated_at
	`
	var stockID string
	var newBalance int
	var updatedAt sql.NullTime

	err = tx.QueryRowContext(ctx, upsertQuery, itemID, locationID, qty).Scan(&stockID, &newBalance, &updatedAt)
	if err != nil {
		return nil, err
	}

	// 2. Insert Stock Mutation Log
	logQuery := `
		INSERT INTO stock_mutation_logs (item_id, location_id, type, qty_change, balance_after)
		VALUES ($1, $2, 'RECEIVE', $3, $4)
	`
	_, err = tx.ExecContext(ctx, logQuery, itemID, locationID, qty, newBalance)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Fetch detail with location & item names
	detailQuery := `
		SELECT s.id, s.item_id, i.sku, i.name, s.location_id, l.code, l.zone, l.type, s.qty, s.updated_at
		FROM stocks s
		JOIN items i ON s.item_id = i.id
		JOIN locations l ON s.location_id = l.id
		WHERE s.id = $1
	`
	var detail model.StockDetail
	err = r.db.QueryRowContext(ctx, detailQuery, stockID).Scan(
		&detail.ID, &detail.ItemID, &detail.ItemSKU, &detail.ItemName,
		&detail.LocationID, &detail.LocationCode, &detail.Zone, &detail.LocationType,
		&detail.Qty, &detail.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &detail, nil
}

func (r *stockRepository) GetStockByItem(ctx context.Context, itemID string) ([]model.StockDetail, error) {
	query := `
		SELECT s.id, s.item_id, i.sku, i.name, s.location_id, l.code, l.zone, l.type, s.qty, s.updated_at
		FROM stocks s
		JOIN items i ON s.item_id = i.id
		JOIN locations l ON s.location_id = l.id
		WHERE s.item_id = $1 AND i.deleted_at IS NULL
		ORDER BY l.code ASC
	`
	rows, err := r.db.QueryContext(ctx, query, itemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stocks := []model.StockDetail{}
	for rows.Next() {
		var detail model.StockDetail
		err := rows.Scan(
			&detail.ID, &detail.ItemID, &detail.ItemSKU, &detail.ItemName,
			&detail.LocationID, &detail.LocationCode, &detail.Zone, &detail.LocationType,
			&detail.Qty, &detail.UpdatedAt,
		)
		if err == nil {
			stocks = append(stocks, detail)
		}
	}
	return stocks, nil
}

func (r *stockRepository) TransferStock(ctx context.Context, itemID string, fromLocationID string, toLocationID string, qty int) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Lock and check source stock
	var currentFromQty int
	fromQuery := `SELECT qty FROM stocks WHERE item_id = $1 AND location_id = $2 FOR UPDATE`
	err = tx.QueryRowContext(ctx, fromQuery, itemID, fromLocationID).Scan(&currentFromQty)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.ErrInsufficientStock
		}
		return err
	}

	if currentFromQty < qty {
		return model.ErrInsufficientStock
	}

	// 2. Decrement source location stock
	newFromQty := currentFromQty - qty
	updateFromQuery := `UPDATE stocks SET qty = $1, updated_at = CURRENT_TIMESTAMP WHERE item_id = $2 AND location_id = $3`
	_, err = tx.ExecContext(ctx, updateFromQuery, newFromQty, itemID, fromLocationID)
	if err != nil {
		return err
	}

	// 3. Upsert destination location stock
	upsertToQuery := `
		INSERT INTO stocks (item_id, location_id, qty, updated_at)
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
		ON CONFLICT (item_id, location_id)
		DO UPDATE SET qty = stocks.qty + $3, updated_at = CURRENT_TIMESTAMP
		RETURNING qty
	`
	var newToQty int
	err = tx.QueryRowContext(ctx, upsertToQuery, itemID, toLocationID, qty).Scan(&newToQty)
	if err != nil {
		return err
	}

	// 4. Log stock mutations (TRANSFER_OUT and TRANSFER_IN)
	logOutQuery := `
		INSERT INTO stock_mutation_logs (item_id, location_id, type, qty_change, balance_after)
		VALUES ($1, $2, 'TRANSFER_OUT', $3, $4)
	`
	_, err = tx.ExecContext(ctx, logOutQuery, itemID, fromLocationID, -qty, newFromQty)
	if err != nil {
		return err
	}

	logInQuery := `
		INSERT INTO stock_mutation_logs (item_id, location_id, type, qty_change, balance_after)
		VALUES ($1, $2, 'TRANSFER_IN', $3, $4)
	`
	_, err = tx.ExecContext(ctx, logInQuery, itemID, toLocationID, qty, newToQty)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *stockRepository) GetStockLogsByItem(ctx context.Context, itemID string) ([]model.StockMutationLogDetail, error) {
	query := `
		SELECT l.id, l.item_id, i.sku, i.name, l.location_id, loc.code, loc.zone, l.type, l.qty_change, l.balance_after, l.created_at
		FROM stock_mutation_logs l
		JOIN items i ON l.item_id = i.id
		JOIN locations loc ON l.location_id = loc.id
		WHERE l.item_id = $1
		ORDER BY l.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, itemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := []model.StockMutationLogDetail{}
	for rows.Next() {
		var detail model.StockMutationLogDetail
		err := rows.Scan(
			&detail.ID, &detail.ItemID, &detail.ItemSKU, &detail.ItemName,
			&detail.LocationID, &detail.LocationCode, &detail.Zone,
			&detail.Type, &detail.QtyChange, &detail.BalanceAfter, &detail.CreatedAt,
		)
		if err == nil {
			logs = append(logs, detail)
		}
	}
	return logs, nil
}
