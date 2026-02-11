export type TransactionItemDto = {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
  lineTotal: number;
};

export type TransactionDto = {
  id: string;
  storeId: string;
  invoiceNumber: string;
  items: TransactionItemDto[];
  subtotal: number;
  discount?: {
    type: "AMOUNT" | "PERCENT";
    amount?: number | null;
    percent?: number | null;
  } | null;
  discountAmount: number;
  tax?: {
    rate?: number | null;
    inclusive?: boolean;
  } | null;
  taxAmount: number;
  totalAmount: number;
  cashReceived?: number | null;
  change: number;
  paymentMethod: string;
  cashierId: string;
  createdAt: string;
};
