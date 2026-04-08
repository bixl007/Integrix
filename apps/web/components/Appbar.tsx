"use client";

import { usePathname, useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { useEffect, useState } from "react";
import { ModeToggle } from "./ModeToggle";

export const Appbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className="text-xl font-bold font-sans tracking-tight cursor-pointer"
          onClick={() => router.push(isLoggedIn ? "/dashboard" : "/")}
        >
          Integrix
        </div>
        <div className="flex items-center gap-6">
          <ModeToggle />
          {pathname === "/login" ? (
            <PrimaryButton onClick={() => router.push("/signup")} size="small">
              Signup
            </PrimaryButton>
          ) : pathname === "/signup" ? (
            <PrimaryButton onClick={() => router.push("/login")} size="small">
              Login
            </PrimaryButton>
          ) : pathname === "/" ? (
            <div className="flex items-center gap-4">
              <LinkButton onClick={() => router.push("/login")}>Login</LinkButton>
              <PrimaryButton onClick={() => router.push("/signup")} size="small">
                Signup
              </PrimaryButton>
            </div>
          ) : (
            <PrimaryButton
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/");
              }}
              size="small"
            >
              Logout
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};
