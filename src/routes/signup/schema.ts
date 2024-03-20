import { z } from "zod";

const passwordSchema = z.string().min(8).max(50)
    .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter.",
    })
    .refine((password) => /[a-z]/.test(password), {
        message: "Password must contain at least one lowercase letter.",
    })
    .refine((password) => /\d/.test(password), {
        message: "Password must contain at least one number.",
    });

export const formSchema = z.object({
    email: z.string().email().max(50),
    password: passwordSchema,
    confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export type FormSchema = typeof formSchema;