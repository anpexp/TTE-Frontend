"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { useRouter, useSearchParams } from "next/navigation";

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
      message: "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
    }),
});

type RegisterForm = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const from = search?.get("from") ?? null;
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema), mode: "onChange" });

  const onSubmit = async (data: RegisterForm) => {
    const res = await registerUser(data.email, data.username, data.password);
    const redirect = res && (res as any).redirectTo ? (res as any).redirectTo : from || "/";
    router.replace(redirect);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow" role="main">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message as string | undefined}
        />

        <Input
          label="Username"
          type="text"
          {...register("username")}
          error={errors.username?.message as string | undefined}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={errors.password?.message as string | undefined}
          rightSlot={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              onTouchCancel={() => setShowPassword(false)}
              className="p-2 text-neutral-600 hover:text-neutral-800"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.08-2.03 2.81-3.78 4.83-4.86" />
                  <path d="M1 1l22 22" />
                  <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          }
        />

        {error && <div className="text-red-600 mt-2" role="alert">{error}</div>}

        <Button type="submit" disabled={!isValid || isLoading} className="mt-4 w-full">
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
