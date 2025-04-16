import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소가 아닙니다.' }),
  password: z
    .string()
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,24}$/,
      '영문, 숫자, 특수문자를 포함히여 8자 이상 입력하세요.'
    ),
  pin: z
    .string()
    .length(8, '010을 제외한 나머지 전화번호를 입력하세요.')
    .nullable(),
  code: z
    .string()
    .length(4, '한글 4음절로 된 초대코드를 입력하세요.')
    .nullable(),
  // remember: z.boolean(),
})

export type RegisterFormData = z.infer<typeof registerSchema>
