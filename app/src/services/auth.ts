import { api, type ApiResponse } from "@/lib/api";

export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignUpResponse = ApiResponse<Record<string, never>>;

export const signUp = async (payload: SignUpRequest) => {
  const { data } = await api.post<SignUpResponse>("/api/auth/sign-up", payload);

  return data;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = ApiResponse<{ accessToken: string }>;

export const signIn = async (payload: SignInRequest) => {
  const { data } = await api.post<SignInResponse>("/api/auth/sign-in", payload);

  return data;
};

export type MyProfileResponse = ApiResponse<{
  name: string;
  email: string;
}>;

export const myProfile = async () => {
  const { data } = await api.post<MyProfileResponse>("/api/auth/my-profile");

  return data;
};
