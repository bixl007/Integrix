"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { Feature } from "./Feature";
import { HeroVideo } from "./HeroVideo";

export const Hero = () => {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-center">
        <div className="text-5xl font-semibold text-center pt-8 max-w-xl">
          Automate as fast as you can type
        </div>
      </div>
      <div className="flex justify-center">
        <div className="text-xl font-normal text-center pt-8 max-w-2xl">
          Ai gives you automation superpowers, and <b>Integrix</b> puts them to work.
          Pairing AI and <b>Integrix</b> helps you turn ideas into workflows and bots
          that work for you.
        </div>
      </div>

      <div className="flex justify-center py-8 gap-5">
        <PrimaryButton onClick={() => {
          router.push("/signup");
        }} size="large">
          Get Started Free
        </PrimaryButton>
        <SecondaryButton onClick={() => {
          router.push("/login")
        }} size="large">
          Login Here
        </SecondaryButton>
      </div>

      <div className="flex justify-center gap-2">
        <Feature title={"Free Forever"} subtitle={"for core features"} />
        <Feature title={"More apps"} subtitle={"than any other platforms"} />
        <Feature title={"Cutting Edge"} subtitle={"AI Features"} />
      </div>
        <HeroVideo />
    </div>
  );
};
