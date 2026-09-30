package handler

import (
	"errors"
	"net/http"

	"backend/internal/model"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type StockHandler struct {
	stockService service.StockService
}

func NewStockHandler(stockService service.StockService) *StockHandler {
	return &StockHandler{stockService: stockService}
}

func (h *StockHandler) Receive(c *gin.Context) {
	var req model.ReceiveStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(
			"Invalid request payload",
			[]model.FieldError{{Field: "body", Reason: err.Error()}},
		))
		return
	}

	// Layer handler input validation
	fieldErrors := []model.FieldError{}
	if req.ItemID == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "item_id", Reason: "item_id is required"})
	}
	if req.LocationID == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "location_id", Reason: "location_id is required"})
	}
	if req.Qty <= 0 {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "qty", Reason: "qty must be greater than zero"})
	}

	if len(fieldErrors) > 0 {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Validation failed", fieldErrors))
		return
	}

	detail, err := h.stockService.ReceiveStock(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, model.ErrItemNotFound) {
			c.JSON(http.StatusNotFound, model.ErrorResponse("Item not found", []model.FieldError{{Field: "item_id", Reason: "Specified item does not exist"}}))
			return
		}
		if errors.Is(err, model.ErrLocationNotFound) {
			c.JSON(http.StatusNotFound, model.ErrorResponse("Location not found", []model.FieldError{{Field: "location_id", Reason: "Specified location does not exist"}}))
			return
		}
		if errors.Is(err, model.ErrInvalidQuantity) || errors.Is(err, model.ErrNegativeStock) {
			c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid stock quantity", []model.FieldError{{Field: "qty", Reason: err.Error()}}))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to process stock reception", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Stock received successfully", detail, nil))
}

func (h *StockHandler) GetByItemID(c *gin.Context) {
	itemID := c.Param("item_id")
	if itemID == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid item_id", []model.FieldError{{Field: "item_id", Reason: "item_id is required"}}))
		return
	}

	stocks, err := h.stockService.GetStockByItem(c.Request.Context(), itemID)
	if err != nil {
		if errors.Is(err, model.ErrItemNotFound) {
			c.JSON(http.StatusNotFound, model.ErrorResponse("Item not found", []model.FieldError{{Field: "item_id", Reason: "Specified item does not exist"}}))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to fetch item stock breakdown", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Item stock retrieved successfully", stocks, nil))
}
