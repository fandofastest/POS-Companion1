import mongoose, { type InferSchemaType } from "mongoose";

const transactionItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    items: { type: [transactionItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: {
      type: {
        type: String,
        enum: ["AMOUNT", "PERCENT"],
        default: null,
      },
      amount: { type: Number, min: 0, default: null },
      percent: { type: Number, min: 0, max: 100, default: null },
    },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    tax: {
      rate: { type: Number, min: 0, max: 1, default: null },
      inclusive: { type: Boolean, default: false },
    },
    taxAmount: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    cashReceived: { type: Number, min: 0, default: null },
    change: { type: Number, required: true, min: 0, default: 0 },
    paymentMethod: { type: String, required: true, trim: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ cashierId: 1, createdAt: -1 });
transactionSchema.index({ storeId: 1, createdAt: -1 });

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TransactionModel =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
