import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username, email or student ID is required."),
  password: z.string().min(1, "Password is required."),
});

const signUpFieldsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  studentId: z
    .string()
    .trim()
    .min(1, "Student ID is required.")
    .max(50, "Student ID must not exceed 50 characters."),
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .max(50, "Username must not exceed 50 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/\d/, "Password must contain a number."),
  confirmPassword: z.string(),
});

export const signUpPersonalSchema = signUpFieldsSchema.pick({
  firstName: true,
  lastName: true,
  studentId: true,
});

export const signUpSchema = signUpFieldsSchema.refine(
  (values) => values.password === values.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);

export type LoginValues = z.infer<typeof loginSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type LoginField = keyof LoginValues;
export type SignUpField = keyof SignUpValues;
export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function getFieldErrors<T extends string>(error: z.ZodError) {
  const errors: FieldErrors<T> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field as T]) {
      errors[field as T] = issue.message;
    }
  });

  return errors;
}
