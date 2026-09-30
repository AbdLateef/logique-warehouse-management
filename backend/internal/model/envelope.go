package model

type PaginationMeta struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

type FieldError struct {
	Field  string `json:"field"`
	Reason string `json:"reason"`
}

type ResponseEnvelope struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    interface{}     `json:"data,omitempty"`
	Meta    *PaginationMeta `json:"meta,omitempty"`
	Errors  []FieldError    `json:"errors,omitempty"`
}

func SuccessResponse(message string, data interface{}, meta *PaginationMeta) ResponseEnvelope {
	return ResponseEnvelope{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	}
}

func ErrorResponse(message string, errors []FieldError) ResponseEnvelope {
	return ResponseEnvelope{
		Success: false,
		Message: message,
		Errors:  errors,
	}
}
