import { z } from "zod";
//  login schema
export const loginSchema = z.object({
    email: z.string().email().max(50),
    password: z.string().min(8).max(50),
});

export type LoginSchema = typeof loginSchema;