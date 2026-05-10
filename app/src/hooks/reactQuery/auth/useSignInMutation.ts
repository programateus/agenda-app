import { signIn } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";

export const useSignInMutation = () => {
  return useMutation({
    mutationFn: signIn,
  });
};
