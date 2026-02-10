import mongoose, { type InferSchemaType } from "mongoose";

const invoiceCounterSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    dateKey: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

invoiceCounterSchema.index({ storeId: 1, dateKey: 1 }, { unique: true });

export type InvoiceCounterDoc = InferSchemaType<typeof invoiceCounterSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InvoiceCounterModel =
  mongoose.models.InvoiceCounter || mongoose.model("InvoiceCounter", invoiceCounterSchema);
