package model

import (
	"time"
)

type Stock struct {
	ID         string    `json:"id" db:"id"`
	ItemID     string    `json:"item_id" db:"item_id"`
	LocationID string    `json:"location_id" db:"location_id"`
	Qty        int       `json:"qty" db:"qty"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type StockDetail struct {
	ID           string    `json:"id" db:"id"`
	ItemID       string    `json:"item_id" db:"item_id"`
	ItemSKU      string    `json:"item_sku,omitempty" db:"item_sku"`
	ItemName     string    `json:"item_name,omitempty" db:"item_name"`
	LocationID   string    `json:"location_id" db:"location_id"`
	LocationCode string    `json:"location_code" db:"location_code"`
	Zone         string    `json:"zone" db:"zone"`
	LocationType string    `json:"location_type" db:"location_type"`
	Qty          int       `json:"qty" db:"qty"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type ReceiveStockRequest struct {
	ItemID     string `json:"item_id" binding:"required"`
	LocationID string `json:"location_id" binding:"required"`
	Qty        int    `json:"qty" binding:"required"`
}

type StockMutationLog struct {
	ID           string    `json:"id" db:"id"`
	ItemID       string    `json:"item_id" db:"item_id"`
	LocationID   string    `json:"location_id" db:"location_id"`
	Type         string    `json:"type" db:"type"`
	QtyChange    int       `json:"qty_change" db:"qty_change"`
	BalanceAfter int       `json:"balance_after" db:"balance_after"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}
