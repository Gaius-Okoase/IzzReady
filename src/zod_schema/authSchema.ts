import zod from 'zod';

export const RegisterSchema = zod.object({
  name: zod
    .string({
      error: (iss) =>
        iss.input === undefined ? 'Please provide your name' : 'Name must be a string',
    })
    .trim()
    .min(4, 'Name must be a minimum of 4 characters'),
  phoneNumber: zod
    .string('Phone number must be a string')
    .trim()
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid phone number'),
  password: zod
    .string('Password must be a string')
    .trim()
    .min(6, 'Password must be at least 6 characters'),
  role: zod.literal(['customer', 'owner'], 'Please sign up with a valid role'),
});

export const LoginSchema = zod.object({
  phoneNumber: zod
    .string('Phone number must be a string')
    .trim()
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid phone number'),
  password: zod
    .string('Password must be a string')
    .trim()
    .min(6, 'Password must be at least 6 characters'),
});
