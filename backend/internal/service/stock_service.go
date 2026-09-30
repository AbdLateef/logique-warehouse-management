package service

import (
	"context"
	"log"

	"backend/internal/model"
	"backend/internal/repository"
)

type StockService interface {
	ReceiveStock(ctx context.Context, req model.ReceiveStockRequest) (*model.StockDetail, error)
	TransferStock(ctx context.Context, req model.TransferStockRequest) error
	GetStockByItem(ctx context.Context, itemID string) ([]model.StockDetail, error)
	GetStockLogsByItem(ctx context.Context, itemID string) ([]model.StockMutationLogDetail, error)
}

type stockService struct {
	stockRepo    repository.StockRepository
	itemRepo     repository.ItemRepository
	locationRepo repository.LocationRepository
}

func NewStockService(
	stockRepo repository.StockRepository,
	itemRepo repository.ItemRepository,
	locationRepo repository.LocationRepository,
) StockService {
	return &stockService{
		stockRepo:    stockRepo,
		itemRepo:     itemRepo,
		locationRepo: locationRepo,
	}
}

func (s *stockService) ReceiveStock(ctx context.Context, req model.ReceiveStockRequest) (*model.StockDetail, error) {
	// Service Level Validation: Stock cannot be negative or zero
	if req.Qty <= 0 {
		return nil, model.ErrInvalidQuantity
	}

	// Ensure item exists
	item, err := s.itemRepo.GetByID(ctx, req.ItemID)
	if err != nil {
		return nil, err
	}

	// Ensure location exists
	location, err := s.locationRepo.GetByID(ctx, req.LocationID)
	if err != nil {
		return nil, err
	}

	// Perform stock receive transaction
	detail, err := s.stockRepo.ReceiveStock(ctx, req.ItemID, req.LocationID, req.Qty)
	if err != nil {
		return nil, err
	}

	// Application level mutation log (console/file) as required by specification
	log.Printf("[STOCK MUTATION LOG] RECEIVE | Item: %s (SKU: %s) | Location: %s (%s) | Qty Received: +%d | Balance After: %d",
		item.Name, item.SKU, location.Code, location.Zone, req.Qty, detail.Qty)

	return detail, nil
}

func (s *stockService) GetStockByItem(ctx context.Context, itemID string) ([]model.StockDetail, error) {
	// Ensure item exists
	_, err := s.itemRepo.GetByID(ctx, itemID)
	if err != nil {
		return nil, err
	}

	stocks, err := s.stockRepo.GetStockByItem(ctx, itemID)
	if err != nil {
		return nil, err
	}
	if stocks == nil {
		stocks = []model.StockDetail{}
	}
	return stocks, nil
}

func (s *stockService) TransferStock(ctx context.Context, req model.TransferStockRequest) error {
	if req.Qty <= 0 {
		return model.ErrInvalidQuantity
	}
	if req.FromLocationID == req.ToLocationID {
		return model.ErrSameLocation
	}

	item, err := s.itemRepo.GetByID(ctx, req.ItemID)
	if err != nil {
		return err
	}

	fromLoc, err := s.locationRepo.GetByID(ctx, req.FromLocationID)
	if err != nil {
		return err
	}

	toLoc, err := s.locationRepo.GetByID(ctx, req.ToLocationID)
	if err != nil {
		return err
	}

	err = s.stockRepo.TransferStock(ctx, req.ItemID, req.FromLocationID, req.ToLocationID, req.Qty)
	if err != nil {
		return err
	}

	log.Printf("[STOCK MUTATION LOG] TRANSFER | Item: %s (SKU: %s) | From: %s (%s) -> To: %s (%s) | Qty: %d",
		item.Name, item.SKU, fromLoc.Code, fromLoc.Zone, toLoc.Code, toLoc.Zone, req.Qty)

	return nil
}

func (s *stockService) GetStockLogsByItem(ctx context.Context, itemID string) ([]model.StockMutationLogDetail, error) {
	_, err := s.itemRepo.GetByID(ctx, itemID)
	if err != nil {
		return nil, err
	}

	logs, err := s.stockRepo.GetStockLogsByItem(ctx, itemID)
	if err != nil {
		return nil, err
	}
	if logs == nil {
		logs = []model.StockMutationLogDetail{}
	}
	return logs, nil
}
