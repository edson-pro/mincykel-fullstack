export interface PurchaseItemInput {
  inventoryId: number;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  note?: string;
  receivedQuantity?: number;
}

export interface CreatePurchaseOrderInput {
  orderNumber: string;
  supplierId: number;
  expectedDeliveryDate: Date;
  notes?: string;
  items: PurchaseItemInput[];
}

export interface UpdatePurchaseOrderInput {
  expectedDeliveryDate?: Date;
  status?: "pending" | "received" | "cancelled" | "partially_received";
  notes?: string;
}

export interface ReceiveItemInput {
  itemId: number;
  receivedQuantity: number;
  note?: string;
  qualityIssue?: boolean;
  qualityNote?: string;
}

export interface ReceivePurchaseOrderInput {
  items: ReceiveItemInput[];
}

export interface QueryFilters {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  orderId?: string;
}
