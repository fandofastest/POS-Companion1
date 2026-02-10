import mongoose, { type InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    unit: { type: String, default: "pcs" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 0 },
    primaryImageUrl: { type: String, default: null },
    imageUrls: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ storeId: 1, createdAt: -1 });

export type ProductDoc = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);
