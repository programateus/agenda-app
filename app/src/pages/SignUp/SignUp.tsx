import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUpMutation } from "@/hooks/reactQuery/signUpMutation";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";

const signUpSchema = z
  .object({
    name: z.string().min(3, "Name must have at least 3 characters"),
    email: z.email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must have at least one uppercase letter")
      .regex(/[a-z]/, "Password must have at least one lowercase letter")
      .regex(/[0-9]/, "Password must have at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must have at least one symbol"),
    passwordConfirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .superRefine(({ password, passwordConfirmation }, ctx) => {
    if (password !== passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Password does not match",
      });
    }
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignUpPage = () => {
  const {
    control,
    getValues,
    handleSubmit: onSubmit,
    setError,
    trigger,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onBlur",
  });
  const { mutateAsync: signUp, isPending } = useSignUpMutation();
  const navigate = useNavigate();

  const handleSubmit = async (data: SignUpFormData) => {
    try {
      await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created");
      navigate("/sign-in");
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          setError("email", { message: "Email already in use" });
          return;
        }
      }
      toast.danger("There was an error when Signing Up");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Surface className="p-6 rounded-3xl min-w-lg">
        <Form onSubmit={onSubmit(handleSubmit)} className="space-y-4">
          <h1 className="text-xl text-center font-bold">Sign Up</h1>

          <Controller
            name="name"
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
                <Label className="font-semibold">Name</Label>
                <Input placeholder="Name" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

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
                  if (getValues("passwordConfirmation")) {
                    trigger("passwordConfirmation");
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

          <Controller
            name="passwordConfirmation"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                type="password"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                validationBehavior="aria"
              >
                <Label className="font-semibold">Password Confirmation</Label>
                <Input placeholder="Password confirmation" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <Button fullWidth type="submit" isDisabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </Form>
      </Surface>
    </div>
  );
};
