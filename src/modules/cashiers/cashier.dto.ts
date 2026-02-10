export type CashierDto = {
  id: string;
  name: string;
  email: string;
  role: "STAFF";
  isActive: boolean;
  storeIds: string[];
};
