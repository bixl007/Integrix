"use client";

import { Input } from "@/components/Input";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import { motion } from "framer-motion";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        username: email,
        password,
        name,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg p-6 md:p-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-sans mb-3">
            Integrix
          </h1>
          <p className="text-muted-foreground text-lg">
            Join the automation revolution.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                required
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
              <Input
                label="Email Address"
                type="text"
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <Input
                label="Password"
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? "Creating Account..." : "Get Started"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-foreground font-semibold hover:underline decoration-primary underline-offset-4"
            >
              Sign in
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground/60 max-w-xs mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </motion.div>
    </div>
  );
}
