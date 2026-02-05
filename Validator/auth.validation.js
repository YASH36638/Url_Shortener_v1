import { z } from "zod";

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must have at least three characters" })
    .max(100, { message: "Name can have at most 100 characters" }),

  password: z
    .string()
    .trim()
    .min(6, { message: "Password must have at least six characters" })
    .max(100, { message: "Password can have at most 100 characters" }),

  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email." })
    .max(100, { message: "Email can have at most 100 characters" }),
});

export const urlValidator=z.object({
  url:z.string().trim().url({message:"Enter a valid url"}),
  code:z.string().trim().min(3,{message:"Code must be at least 3 characters"}).max(30,{message:"Code can be at most 30 characters"})
})

export const userSchema = registerUserSchema.pick({
  name:true
});

export const emailSchema=registerUserSchema.pick({
  email:true
});

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password is required"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"], // error confirmPassword field pe dikhayega
  });

  export const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });