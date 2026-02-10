export type ProductDto = {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  categoryId: string | null;
  unit: string;
  price: number;
  stock: number;
  minimumStock: number;
  primaryImageUrl?: string | null;
  imageUrls: string[];
  isActive: boolean;
};
