"use client";

import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) return; // Extra safeguard

    try {
      await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        username: email,
        password,
        name,
      });
      router.push("/login");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center min-h-screen items-center p-4 gap-10 md:gap-20">
      <div className="flex flex-col md:flex-row gap-10 w-full">
        <div className="flex-1 pt-10 md:pt-20 text-center md:text-left">
          <div className="text-2xl md:text-3xl font-semibold pb-6 font-mono">
            Join millions worldwide who automate their work using Integrix.
          </div>
          <div className="space-y-3">
            <CheckFeature label={"Easy setup, no coding required"} />
            <CheckFeature label={"Free forever for core features"} />
            <CheckFeature label={"14-day trial of premium features and apps"} />
          </div>
        </div>
        {/* ✅ Form now handles submission */}
        <form
          className="flex-1 border p-6 shadow-xl rounded-2xl max-w-sm w-full"
          onSubmit={handleSubmit}
        >
          <div className="text-sm font-light text-gray-600 mb-2">
            * indicates required
          </div>
          <Input label="Name" type="text" required onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="text" required onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" required onChange={(e) => setPassword(e.target.value)} />
          
          <div className="text-sm font-light text-gray-600 mt-2">
            By signing up, you agree to Integrix Terms of Service and Privacy Policy
          </div>
          {/* ✅ Now using `type="submit"` */}
          <button
            type="submit"
            className="bg-amber-600 p-3 rounded-full text-white w-full hover:bg-amber-700 mt-4"
          >
            Get Started for Free
          </button>
          <div className="text-sm font-light text-gray-600 mt-2 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-700 underline">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
