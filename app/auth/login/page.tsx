"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);

        try {
            await login({ email, password });
            // TODO: Let login redirect to the corresponding dashboard based on the user role
            router.push("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred during login. Please try again."
            );
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <Image
            src="/bg.jpg"
            alt="Background"
            fill
            priority
            className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center">
                <Image
                src="/logo.png"
                alt="OmniaCom Logo"
                width={110}
                height={110}
                priority
                />

                <h1 className="mt-2 text-2xl font-bold uppercase tracking-[0.25em] text-white">
                Omniacom
                </h1>
            </div>

            {/* Login Card */}
            <Card className="border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-8">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white">
                    Welcome Back
                    </h2>

                    <p className="mt-2 text-sm text-white/70">
                    Sign in to continue to your account
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Error alert */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-200 backdrop-blur-sm">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        className="text-white/90"
                    >
                        Email
                    </Label>

                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="
                        border-white/20
                        bg-white/10
                        text-white
                        placeholder:text-white/50
                        "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>

                    <div className="space-y-2">
                    <Label
                        htmlFor="password"
                        className="text-white/90"
                    >
                        Password
                    </Label>

                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="
                        border-white/20
                        bg-white/10
                        text-white
                        placeholder:text-white/50
                        "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>

                    <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full cursor-pointer h-11 text-base font-semibold bg-[#D0453A] hover:bg-[#636363] disabled:bg-[#636363] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                    {isLoggingIn ? (
                        <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                    </Button>

                    <div className="text-center">
                    <button
                        type="button"
                        className="text-sm text-white/70 hover:text-white transition"
                    >
                        Forgot password?
                    </button>
                    </div>
                </form>
                </CardContent>
            </Card>
            </div>
        </div>
        </main>
    );
}