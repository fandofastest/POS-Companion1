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
  totalAmount: number;
  paymentMethod: string;
  cashierId: string;
  createdAt: string;
};
