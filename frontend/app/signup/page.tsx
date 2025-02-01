"use client";

import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";

export default function Signup() {
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
        <form className="flex-1 border p-6 shadow-xl rounded-2xl max-w-sm w-full">
          <div className="text-sm font-light text-gray-600 mb-2">* indicates required</div>
          <Input label={"Name"} type="text" onChange={() => {}} />
          <Input label={"Email"} type="text" onChange={() => {}} />
          <Input label={"Password"} type="password" onChange={() => {}} />
          <div className="text-sm font-light text-gray-600 mt-2">
            By signing up, you agree to Integrix Terms of Service and Privacy Policy
          </div>
          <button className="bg-amber-600 p-3 rounded-full text-white w-full hover:bg-amber-700 mt-4">
            Get Started for Free
          </button>
          <div className="text-sm font-light text-gray-600 mt-2 text-center">
            Already have an account? <a href="/login" className="text-blue-700 underline">Login</a>
          </div>
        </form>
      </div>
      <div className="hidden lg:block w-full text-center">
        <div className="text-sm font-normal text-gray-600 flex flex-col gap-6">
          <div>Trusted at companies large and small</div>
          <div className="flex flex-wrap justify-center gap-6">
            <img className="h-6" src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631505/Company%20logos/dropbox_bfeqf0.svg" alt="Dropbox" />
            <img className="h-6" src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631782/Company%20logos/lyft_xb3vqy.svg" alt="Lyft" />
            <img className="h-6" src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631507/Company%20logos/hello-fresh_spytbw.svg" alt="HelloFresh" />
            <img className="h-6" src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631505/Company%20logos/asana_sgibbb.svg" alt="Asana" />
            <img className="h-6" src="https://res.cloudinary.com/zapier-media/image/upload/q_auto/v1685631509/Company%20logos/zendesk_g4uhso.svg" alt="Zendesk" />
          </div>
        </div>
      </div>
    </div>
  );
}
