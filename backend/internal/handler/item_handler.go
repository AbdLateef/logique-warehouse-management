package handler

import (
	"errors"
	"net/http"

	"backend/internal/model"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type ItemHandler struct {
	itemService service.ItemService
}

func NewItemHandler(itemService service.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

func (h *ItemHandler) Create(c *gin.Context) {
	var req model.CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(
			"Invalid request payload",
			[]model.FieldError{{Field: "body", Reason: err.Error()}},
		))
		return
	}

	// Validate input fields at handler layer before calling service
	fieldErrors := []model.FieldError{}
	if req.SKU == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "sku", Reason: "SKU is required"})
	}
	if req.Name == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "name", Reason: "Name is required"})
	}
	if req.Category == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "category", Reason: "Category is required"})
	}
	if req.Unit == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "unit", Reason: "Unit is required"})
	}

	if len(fieldErrors) > 0 {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Validation failed", fieldErrors))
		return
	}

	item, err := h.itemService.CreateItem(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, model.ErrDuplicateSKU) {
			c.JSON(http.StatusConflict, model.ErrorResponse(
				"SKU already exists",
				[]model.FieldError{{Field: "sku", Reason: "Duplicate entry"}},
			))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to create item", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusCreated, model.SuccessResponse("Item created successfully", item, nil))
}

func (h *ItemHandler) List(c *gin.Context) {
	var filter model.ItemFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid query parameters", []model.FieldError{{Field: "query", Reason: err.Error()}}))
		return
	}

	items, meta, err := h.itemService.ListItems(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to fetch items", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Items retrieved successfully", items, meta))
}

func (h *ItemHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid item ID", []model.FieldError{{Field: "id", Reason: "ID is required"}}))
		return
	}

	item, err := h.itemService.GetItemByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, model.ErrItemNotFound) {
			c.JSON(http.StatusNotFound, model.ErrorResponse("Item not found", []model.FieldError{{Field: "id", Reason: "Item with specified ID does not exist"}}))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to fetch item detail", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Item detail retrieved successfully", item, nil))
}

func (h *ItemHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid item ID", []model.FieldError{{Field: "id", Reason: "ID is required"}}))
		return
	}

	var req model.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid request payload", []model.FieldError{{Field: "body", Reason: err.Error()}}))
		return
	}

	fieldErrors := []model.FieldError{}
	if req.SKU == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "sku", Reason: "SKU is required"})
	}
	if req.Name == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "name", Reason: "Name is required"})
	}
	if req.Category == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "category", Reason: "Category is required"})
	}
	if req.Unit == "" {
		fieldErrors = append(fieldErrors, model.FieldError{Field: "unit", Reason: "Unit is required"})
	}

	if len(fieldErrors) > 0 {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Validation failed", fieldErrors))
		return
	}

	item, err := h.itemService.UpdateItem(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, model.ErrItemNotFound) {
			c.JSON(http.StatusNotFound, model.ErrorResponse("Item not found", []model.FieldError{{Field: "id", Reason: "Item with specified ID does not exist"}}))
			return
		}
		if errors.Is(err, model.ErrDuplicateSKU) {
			c.JSON(http.StatusConflict, model.ErrorResponse("SKU already exists", []model.FieldError{{Field: "sku", Reason: "Duplicate entry"}}))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to update item", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Item updated successfully", item, nil))
}

func (h *ItemHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("Invalid item ID", []model.FieldError{{Field: "id", Reason: "ID is required"}}))
		return
	}

	err := h.itemService.DeleteItem(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, model.ErrItemNotFound) {
			c.JSON(http.StatusNotFound, model.ErrorResponse("Item not found", []model.FieldError{{Field: "id", Reason: "Item with specified ID does not exist"}}))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to delete item", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Item deleted successfully", nil, nil))
}

func (h *ItemHandler) GetCategories(c *gin.Context) {
	categories, err := h.itemService.GetCategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("Failed to fetch categories", []model.FieldError{{Field: "server", Reason: err.Error()}}))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("Categories retrieved successfully", categories, nil))
}
