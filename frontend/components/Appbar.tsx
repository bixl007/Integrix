"use client";

import Image from 'next/image';



import { useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";

export const Appbar = () => {
  const router = useRouter();
  return (
    <div className="flex border-b justify-between px-4">
      <div className="flex flex-col justify-center px-4"><Image 
  src="/appBar.png"
  alt="Integrix Logo" 
  width={100} 
  height={10} 
/></div>
      <div className="flex pr-4 gap-4 my-2">
        <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
        <LinkButton
          onClick={() => {
            router.push("/login");
          }}
        >
          Login
        </LinkButton>
        <PrimaryButton
          onClick={() => {
            router.push("/signup");
          }}
        >
          Signup
        </PrimaryButton>
      </div>
    </div>
  );
};
