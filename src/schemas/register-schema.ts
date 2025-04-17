import { z } from 'zod'

export const registerFormSchema = z.object({
  username: z.string().min(3, "아이디는 최소 3글자 이상이어야 합니다"),
  password: z.string().min(6, "비밀번호는 최소 6글자 이상이어야 합니다"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "올바른 전화번호 형식이 아닙니다 (10-11자리 숫자)")
    .optional(),
  role: z.enum(["INSTRUCTOR", "PARENT", "MANAGER"], {
    required_error: "역할을 선택해주세요",
  }),
})

export type RegisterFormData = z.infer<typeof registerFormSchema>
