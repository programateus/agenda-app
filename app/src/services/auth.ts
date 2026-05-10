import { api, type ApiResponse } from "@/lib/api";

export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignUpResponse = ApiResponse<Record<string, never>>;

export const signUp = async (payload: SignUpRequest) => {
  const { data } = await api.post<SignUpResponse>("/auth/sign-up", payload);

  return data;
};
