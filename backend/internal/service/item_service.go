package service

import (
	"context"

	"backend/internal/model"
	"backend/internal/repository"
)

type ItemService interface {
	CreateItem(ctx context.Context, req model.CreateItemRequest) (*model.Item, error)
	GetItemByID(ctx context.Context, id string) (*model.Item, error)
	ListItems(ctx context.Context, filter model.ItemFilter) ([]model.Item, *model.PaginationMeta, error)
	UpdateItem(ctx context.Context, id string, req model.UpdateItemRequest) (*model.Item, error)
	DeleteItem(ctx context.Context, id string) error
	GetCategories(ctx context.Context) ([]string, error)
}

type itemService struct {
	itemRepo repository.ItemRepository
}

func NewItemService(itemRepo repository.ItemRepository) ItemService {
	return &itemService{itemRepo: itemRepo}
}

func (s *itemService) CreateItem(ctx context.Context, req model.CreateItemRequest) (*model.Item, error) {
	item := &model.Item{
		SKU:      req.SKU,
		Name:     req.Name,
		Category: req.Category,
		Unit:     req.Unit,
	}

	if err := s.itemRepo.Create(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *itemService) GetItemByID(ctx context.Context, id string) (*model.Item, error) {
	return s.itemRepo.GetByID(ctx, id)
}

func (s *itemService) ListItems(ctx context.Context, filter model.ItemFilter) ([]model.Item, *model.PaginationMeta, error) {
	items, total, err := s.itemRepo.List(ctx, filter)
	if err != nil {
		return nil, nil, err
	}

	meta := &model.PaginationMeta{
		Page:  filter.Page,
		Limit: filter.Limit,
		Total: total,
	}

	return items, meta, nil
}

func (s *itemService) UpdateItem(ctx context.Context, id string, req model.UpdateItemRequest) (*model.Item, error) {
	item, err := s.itemRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	item.SKU = req.SKU
	item.Name = req.Name
	item.Category = req.Category
	item.Unit = req.Unit

	if err := s.itemRepo.Update(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *itemService) DeleteItem(ctx context.Context, id string) error {
	return s.itemRepo.SoftDelete(ctx, id)
}

func (s *itemService) GetCategories(ctx context.Context) ([]string, error) {
	return s.itemRepo.GetCategories(ctx)
}
