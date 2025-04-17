"use server";

import { RegisterFormData } from "@/schemas/register-schema";
import { revalidatePath } from "next/cache";

/**
 * 회원가입을 처리하는 서버 액션
 */
export async function registerUser(data: RegisterFormData): Promise<{ success: boolean; message?: string }> {
  try {
    // 역할에 따른 API 엔드포인트 선택
    const endpoint =
      data.role === "MANAGER"
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/register-manager`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

    // 회원가입 요청
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || "회원가입에 실패했습니다",
      };
    }

    revalidatePath("/login");

    return {
      success: true,
      message: "회원가입이 완료되었습니다.",
    };
  } catch (error) {
    console.error("회원가입 오류:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "서버 오류가 발생했습니다",
    };
  }
} 