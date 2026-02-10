import mongoose from "mongoose";

import { connectMongo } from "@/lib/db/mongoose";
import { InvoiceCounterModel } from "@/modules/counters/invoiceCounter.model";

export async function nextInvoiceSequence(storeId: string, dateKey: string): Promise<number> {
  await connectMongo();
  const doc = await InvoiceCounterModel.findOneAndUpdate(
    { storeId: new mongoose.Types.ObjectId(storeId), dateKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  ).exec();

  return (doc as any).seq as number;
}
