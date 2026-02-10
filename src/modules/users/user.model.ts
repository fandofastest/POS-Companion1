import mongoose, { type InferSchemaType } from "mongoose";

const roleValues = ["OWNER", "ADMIN", "STAFF"] as const;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: roleValues,
      default: "OWNER",
    },
    storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
