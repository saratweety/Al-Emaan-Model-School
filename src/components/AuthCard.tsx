"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UserIcon,
  LockIcon,
  UserPlusBadgeIcon,
  LogInBadgeIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
} from "./icons";

type Mode = "login" | "signup";

const footerItems = [
  { Icon: MapPinIcon, lines: ["Allama Iqbal Town, Basirpur,", "Lahore, Pakistan"] },
  { Icon: PhoneIcon, lines: ["0341 8298314", "0345 2027799"] },
  { Icon: MailIcon, lines: ["info@alemaanschool.edu.pk", "www.alemaanschool.edu.pk"] },
  { Icon: ShieldCheckIcon, lines: ["Safe Environment", "Quality Education"] },
];

export default function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden md:grid md:grid-cols-2">
        {/* Left branding panel — building photo fills the whole side */}
        <div className="relative hidden overflow-hidden md:flex">
          <Image
            src="/school-building.jpeg"
            alt="Al-Emaan Model School building"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f4d34]/80 via-[#13714C]/45 to-[#0f4d34]/85" />

          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-5 px-10 text-center">
            <div className="h-36 w-36 overflow-hidden rounded-full shadow-xl ring-4 ring-white/90">
              <Image
                src="/logo.jpeg"
                alt="Al-Emaan Model School logo"
                width={180}
                height={180}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-wide text-white">
                AL-EMAAN
                <br />
                MODEL SCHOOL
              </h1>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-white/50" />
                <span className="text-xs font-semibold tracking-[0.15em] text-white/90">
                  YOUR CHILD IS OUR PRIORITY
                </span>
                <span className="h-px w-10 bg-white/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-6 py-6 sm:px-16">
          <div key={mode} className="animate-auth-zoom flex w-full flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3AB67D] to-[#13714C] text-white shadow-lg">
              {isLogin ? (
                <LogInBadgeIcon className="h-8 w-8" />
              ) : (
                <UserPlusBadgeIcon className="h-8 w-8" />
              )}
            </div>

            <h2 className="mt-3 text-3xl font-extrabold tracking-wide text-[#0f4d34]">
              {isLogin ? "LOGIN" : "SIGN UP"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isLogin ? "Login to your account" : "Create your account"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-4">
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
                  />
                </div>
              )}

              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-11 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon className="h-5 w-5" off={showPassword} />
                </button>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className="text-xs font-semibold text-[#13714C] hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] py-3.5 text-sm font-bold tracking-wide text-white shadow-lg transition hover:brightness-110"
              >
                {isLogin ? "SIGN IN" : "SIGN UP"}
              </button>
            </form>

            <p className="mt-5 text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(isLogin ? "signup" : "login")}
                className="font-bold text-[#13714C] hover:underline"
              >
                {isLogin ? "SIGN UP" : "LOGIN"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Contact footer */}
      <footer className="flex flex-col divide-y divide-white/15 bg-[#0f4d34] px-6 sm:flex-row sm:divide-x sm:divide-y-0 sm:px-10">
        {footerItems.map(({ Icon, lines }) => (
          <div key={lines[0]} className="flex flex-1 items-center gap-3 py-3 sm:justify-center sm:py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#A2E494]">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-xs leading-snug text-white/90">
              {lines[0]}
              <br />
              {lines[1]}
            </span>
          </div>
        ))}
      </footer>
    </div>
  );
}
