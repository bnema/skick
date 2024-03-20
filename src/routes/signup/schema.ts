import { z } from "zod";

export const formSchema = z.object({
    email: z.string().email().max(50),
    password: z.string().min(8).max(50).refine((password) => {
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/;
        return passwordPattern.test(password);
    }, {
        message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
    }),
    confirmPassword: z.string().min(8).max(50),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export type FormSchema = typeof formSchema;