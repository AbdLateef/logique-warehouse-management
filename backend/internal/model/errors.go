package model

import "errors"

var (
	ErrDuplicateSKU     = errors.New("SKU already exists")
	ErrItemNotFound     = errors.New("Item not found")
	ErrLocationNotFound = errors.New("Location not found")
	ErrNegativeStock    = errors.New("Stock quantity cannot be negative")
	ErrInvalidQuantity  = errors.New("Quantity must be greater than zero")
	ErrSameLocation     = errors.New("Source and destination locations cannot be the same")
	ErrInsufficientStock = errors.New("Insufficient stock at source location")
)
