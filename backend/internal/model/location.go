package model

import (
	"time"
)

type Location struct {
	ID        string    `json:"id" db:"id"`
	Code      string    `json:"code" db:"code"`
	Zone      string    `json:"zone" db:"zone"`
	Type      string    `json:"type" db:"type"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
