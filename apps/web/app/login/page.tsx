"use client";

import { Input } from "@/components/Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        username: email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg p-6 md:p-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-sans mb-3">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Continue your automation journey.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <Input
                label="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-foreground font-semibold hover:underline decoration-primary underline-offset-4"
            >
              Sign up
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
