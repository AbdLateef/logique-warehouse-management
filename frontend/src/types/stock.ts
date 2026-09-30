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

export interface TransferStockPayload {
  item_id: string;
  from_location_id: string;
  to_location_id: string;
  qty: number;
}

export interface StockMutationLog {
  id: string;
  item_id: string;
  item_sku?: string;
  item_name?: string;
  location_id: string;
  location_code: string;
  zone: string;
  type: 'RECEIVE' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  qty_change: number;
  balance_after: number;
  created_at: string;
}
