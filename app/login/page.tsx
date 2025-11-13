"use client";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/components/auth/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/atoms";



const schema = z.object({
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const { login, isLoading, error } = useAuth();
    const [pwd, setPwd] = useState("");
    const canSubmit = email.trim() !== "" && pwd.trim() !== "";
    const router = useRouter();
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginForm>({ resolver: zodResolver(schema), mode: "onChange" });



    //   const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     if (!canSubmit) return;
    //     router.push("/");
    //   };

    const onSubmit = async (data: LoginForm) => {
       
        try {
            const res = await login(data.email, data.password, remember);
            if (res) {
              
                const from = (searchParams.get("from"));
                const redirect = (res as any).redirectTo ?? from ?? "/";
              

                // navigate(redirect, { replace: true });
                router.push(redirect)
            }
        } catch (err) { }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Input
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message as string | undefined}
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
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                >
                                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7 1.08-2.03 2.81-3.78 4.83-4.86" />
                                    <path d="M1 1l22 22" />
                                    <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                                </svg>
                            ) : (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    }
                />

                <label className="flex items-center mt-2 select-none">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="mr-2"
                    />
                    <span className="text-sm">Remember me</span>
                </label>

                {error && (
                    <div className="text-red-600 mt-2" role="alert">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={!isValid || isLoading} className="mt-4 w-full">
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </form>
            {/* <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-xl border p-8 max-w-xl w-full justify-self-center">
                <h1 className="text-4xl font-bold mb-8">Login</h1>

                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 mb-4"
                    placeholder="you@example.com"
                />

                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />

                <div className="flex items-center gap-3 mt-4">
                    <input id="remember" type="checkbox" className="h-4 w-4" />
                    <label htmlFor="remember" className="text-sm">Remember me</label>
                </div>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full mt-6 rounded-lg bg-black text-white py-3 disabled:opacity-50 hover:bg-orange-500 transition-colors"
                >
                    Login
                </button>
            </form> */}

            <div className="hidden md:flex items-center justify-center">
                <div className="rounded-3xl bg-black p-6">
                    <Image src="/TTE.png" alt="Tech Trend Emporium" width={520} height={620} className="rounded-xl" priority />
                </div>
            </div>
        </div>
    );
}
