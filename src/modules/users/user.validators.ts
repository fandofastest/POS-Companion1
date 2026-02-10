import { z } from "zod";

import { USER_ROLES } from "@/types/roles";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES),
});
