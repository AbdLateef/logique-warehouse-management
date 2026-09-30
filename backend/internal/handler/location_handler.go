package handler

import (
	"net/http"

	"backend/internal/model"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type LocationHandler struct {
	locationService service.LocationService
}

func NewLocationHandler(locationService service.LocationService) *LocationHandler {
	return &LocationHandler{locationService: locationService}
}

func (h *LocationHandler) List(c *gin.Context) {
	locations, err := h.locationService.ListLocations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to fetch locations", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Locations retrieved successfully", locations, nil))
}
