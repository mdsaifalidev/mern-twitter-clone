import { z } from "zod";

const updateUserProfileSchema = z.object({
  fullName: z
    .string({
      required_error: "Full Name is required.",
      invalid_type_error: "Full Name must be a string.",
    })
    .trim()
    .min(4, { message: "Full Name must be 4 or more characters long." })
    .max(255, { message: "Full Name must be 255 or fewer characters long." })
    .optional(),
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .trim()
    .min(4, { message: "Username must be 4 or more characters long." })
    .max(255, { message: "Username must be 255 or fewer characters long." })
    .optional(),
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Invalid email address." })
    .trim()
    .max(255, { message: "Email must be 255 or fewer characters long." })
    .optional(),
  bio: z
    .string({
      required_error: "Bio is required.",
      invalid_type_error: "Bio must be a string.",
    })
    .trim()
    .min(4, { message: "Bio must be 4 or more characters long." })
    .max(255, { message: "Bio must be 255 or fewer characters long." })
    .optional(),
  currentPassword: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .min(6, { message: "Password must be 6 or more characters long." })
    .max(255, { message: "Password must be 255 or fewer characters long." })
    .optional(),
  newPassword: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .min(6, { message: "Password must be 6 or more characters long." })
    .max(255, { message: "Password must be 255 or fewer characters long." })
    .optional(),
  link: z
    .string({
      required_error: "Link is required.",
      invalid_type_error: "Link must be a string.",
    })
    .trim()
    .min(4, { message: "Link must be 4 or more characters long." })
    .max(255, { message: "Link must be 255 or fewer characters long." })
    .optional(),
});

export { updateUserProfileSchema };
