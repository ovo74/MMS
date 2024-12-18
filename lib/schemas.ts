import * as z from 'zod'

// Minimum 8 characters, one lowercase letter, one number and one special character
const passwordValidation = new RegExp(
  /^(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,}$/
);

export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, { message: 'Must have at least 8 character' })
  .regex(passwordValidation, {
    message: 'Your password is not valid',
  }),
  location: z.string().optional(),
})

export const mediaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['image', 'video', 'youtube']),
})

