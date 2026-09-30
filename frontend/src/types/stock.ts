export interface Stock {
  id: string;
  item_id: string;
  location_id: string;
  qty: number;
  updated_at: string;
}

export interface StockDetail {
  id: string;
  item_id: string;
  item_sku?: string;
  item_name?: string;
  location_id: string;
  location_code: string;
  zone: string;
  location_type: string;
  qty: number;
  updated_at: string;
}

export interface ReceiveStockPayload {
  item_id: string;
  location_id: string;
  qty: number;
}
