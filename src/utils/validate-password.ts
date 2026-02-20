import { apiResponse } from "@/lib/api-response";

export function validatePassword(password: string) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return apiResponse({
      status: 400,
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et une minuscule.",
    });
  }
  return true;
}
