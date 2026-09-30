package service

import (
	"context"

	"backend/internal/model"
	"backend/internal/repository"
)

type LocationService interface {
	ListLocations(ctx context.Context) ([]model.Location, error)
}

type locationService struct {
	locationRepo repository.LocationRepository
}

func NewLocationService(locationRepo repository.LocationRepository) LocationService {
	return &locationService{locationRepo: locationRepo}
}

func (s *locationService) ListLocations(ctx context.Context) ([]model.Location, error) {
	return s.locationRepo.List(ctx)
}
