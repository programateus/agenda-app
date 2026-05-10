import {
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Surface,
  TextField,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { useState } from "react";
import { useSignInMutation } from "@/hooks/reactQuery/auth/useSignInMutation";

const signInSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(255, "Password is too long"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export const SignInPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    getValues,
    handleSubmit: onSubmit,
    trigger,
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const { mutateAsync: signIn, isPending } = useSignInMutation();

  const handleSubmit = async (data: SignInFormData) => {
    try {
      setServerError(null);
      const {
        data: { accessToken },
      } = await signIn(data);
      localStorage.setItem("accessToken", accessToken);
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          setServerError("Invalid credentials");
        }
      }
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Surface className="p-6 rounded-3xl w-lg">
        <Form onSubmit={onSubmit(handleSubmit)} className="space-y-4">
          <h1 className="text-xl text-center font-bold">Sign In</h1>

          {serverError && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{serverError}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                validationBehavior="aria"
              >
                <Label className="font-semibold">Email</Label>
                <Input placeholder="Email" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                type="password"
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (getValues("password")) {
                    trigger("password");
                  }
                }}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                validationBehavior="aria"
              >
                <Label className="font-semibold">Password</Label>
                <Input placeholder="Password" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <Button fullWidth type="submit" isDisabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-center">
            New here? <Link href="/sign-up">Sign Up</Link>
          </p>
        </Form>
      </Surface>
    </div>
  );
};
