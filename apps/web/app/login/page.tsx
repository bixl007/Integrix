"use client";

import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Appbar } from "@/components/Appbar";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Prevent form reload

    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        username: email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div>
      <Appbar />
      <div className="max-w-5xl mx-auto flex flex-col justify-center min-h-screen items-center p-4 gap-10 md:gap-20">
        <div className="flex flex-col md:flex-row gap-10 w-full">
          <div className="flex-1 pt-10 md:pt-20 text-center md:text-left">
            <div className="text-2xl md:text-3xl font-semibold pb-6 font-mono">
              Automate across your teams
            </div>
            <div className="space-y-3">
              <CheckFeature label={"Easy setup, no coding required"} />
              <CheckFeature label={"Free forever for core features"} />
              <CheckFeature
                label={"14-day trial of premium features and apps"}
              />
            </div>
          </div>
          <form
            onSubmit={handleLogin} // ✅ Form submission with validation
            className="flex-1 border p-6 shadow-xl rounded-2xl max-w-sm w-full"
          >
            <div className="text-sm font-light text-gray-600 mb-2">
              * indicates required
            </div>
            <Input
              label="Email"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="text-sm font-light text-gray-600 mt-2">
              By signing up, you agree to Integrix Terms of Service and Privacy
              Policy
            </div>
            <button
              type="submit"
              className="bg-amber-600 p-3 rounded-full text-white w-full hover:bg-amber-700 mt-4"
            >
              Login
            </button>
            <div className="text-sm font-light text-gray-600 mt-2 text-center">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-700 underline">
                Signup
              </a>
            </div>
          </form>
        </div>
        <div className="hidden lg:block w-full text-center">
          <div className="text-sm font-normal text-gray-600 flex flex-col gap-6">
            <div>Trusted at companies large and small</div>
            <div className="flex flex-wrap justify-center gap-6">
              <img
                className="h-6"
                src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631505/Company%20logos/dropbox_bfeqf0.svg"
                alt="Dropbox"
              />
              <img
                className="h-6"
                src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631782/Company%20logos/lyft_xb3vqy.svg"
                alt="Lyft"
              />
              <img
                className="h-6"
                src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631507/Company%20logos/hello-fresh_spytbw.svg"
                alt="HelloFresh"
              />
              <img
                className="h-6"
                src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631505/Company%20logos/asana_sgibbb.svg"
                alt="Asana"
              />
              <img
                className="h-6"
                src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631509/Company%20logos/zendesk_g4uhso.svg"
                alt="Zendesk"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
