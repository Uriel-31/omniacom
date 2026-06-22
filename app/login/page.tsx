"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const { login } = useAuth();

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "E-mail ou mot de passe incorrect. Réessayez.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f0f23 100%)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bg.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">

          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo-.png"
              alt="OMNIACOM"
              width={110}
              height={110}
              priority
              className="object-contain"
            />
            <h1 className="mt-3 text-2xl font-bold uppercase tracking-[0.25em] text-white">
              OMNIACOM
            </h1>
          </div>

          <Card className="border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white">Bienvenue</h2>
                <p className="mt-2 text-sm text-white/70">
                  Connectez-vous pour accéder à votre espace
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-200 backdrop-blur-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom.prenom@omniacom.cm"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="flex h-11 w-full items-center justify-center gap-2 bg-[#D0453A] text-base font-semibold hover:bg-[#b83830] disabled:cursor-not-allowed disabled:bg-[#636363]"
                >
                  {busy ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Connexion…</>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
