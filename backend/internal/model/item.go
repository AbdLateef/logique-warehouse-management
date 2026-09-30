package model

import (
	"time"
)

type Item struct {
	ID         string     `json:"id" db:"id"`
	SKU        string     `json:"sku" db:"sku"`
	Name       string     `json:"name" db:"name"`
	Category   string     `json:"category" db:"category"`
	Unit       string     `json:"unit" db:"unit"`
	TotalStock int        `json:"total_stock,omitempty" db:"total_stock"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt  *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

type CreateItemRequest struct {
	SKU      string `json:"sku" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Category string `json:"category" binding:"required"`
	Unit     string `json:"unit" binding:"required"`
}

type UpdateItemRequest struct {
	SKU      string `json:"sku" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Category string `json:"category" binding:"required"`
	Unit     string `json:"unit" binding:"required"`
}

type ItemFilter struct {
	Page     int    `form:"page,default=1"`
	Limit    int    `form:"limit,default=10"`
	Category string `form:"category"`
	Search   string `form:"search"`
}
