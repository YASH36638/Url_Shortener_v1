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