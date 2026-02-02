"use client";

import { usePathname, useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { useEffect, useState } from "react";

export const Appbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  return (
    <div className="flex border-b justify-between px-4">
      <div
        className="flex flex-col justify-center px-4 cursor-pointer"
        onClick={() => (isLoggedIn ? router.push("/dashboard") : router.push("/"))}
      >
        Integrix
      </div>
      <div className="flex pr-4 gap-4 my-2">
        {pathname === "/login" ? (
          <PrimaryButton onClick={() => router.push("/signup")}>
            Signup
          </PrimaryButton>
        ) : pathname === "/signup" ? (
          <PrimaryButton onClick={() => router.push("/login")}>
            Login
          </PrimaryButton>
        ) : pathname === "/" ? (
          <>
            <LinkButton onClick={() => router.push("/login")}>Login</LinkButton>
            <PrimaryButton onClick={() => router.push("/signup")}>
              Signup
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton
            onClick={() => {
              // Clear the token from localStorage
              localStorage.removeItem("token");

              // Redirect to the homepage
              router.push("/");
            }}
          >
            Logout
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
