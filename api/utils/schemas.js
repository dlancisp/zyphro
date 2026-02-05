import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const SecretSchema = z.object({
  cipherText: z.string().min(10).max(10000),
});

export const CheckInSchema = z.object({
  id: z.string().uuid(),
});

export const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(100),
  message: z.string().min(1).max(5000),
});