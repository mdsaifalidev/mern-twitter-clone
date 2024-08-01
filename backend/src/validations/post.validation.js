import { z } from "zod";

const createPost = z.object({
  text: z
    .string({
      required_error: "Title is required.",
      invalid_type_error: "Title must be a string.",
    })
    .trim()
    .min(4, { message: "Title must be 4 or more characters long." })
    .max(255, { message: "Title must be 255 or fewer characters long." }),
});

export { createPost };
