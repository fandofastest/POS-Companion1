import mongoose, { type InferSchemaType } from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

storeSchema.index({ name: 1 });
storeSchema.index({ createdBy: 1 });

export type StoreDoc = InferSchemaType<typeof storeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StoreModel = mongoose.models.Store || mongoose.model("Store", storeSchema);
