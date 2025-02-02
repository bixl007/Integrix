"use client";

import { usePathname, useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";

export const Appbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex border-b justify-between px-4">
      <div
        className="flex flex-col justify-center px-4 cursor-pointer"
        onClick={() => router.push("/")}
      >
        Integrix
      </div>
      <div className="flex pr-4 gap-4 my-2">
        <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
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
