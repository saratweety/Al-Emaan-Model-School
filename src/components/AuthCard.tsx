"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { isLikelyPhone } from "@/lib/phone";
import { loginWithPhone } from "@/lib/phone-auth-actions";
import {
  UserIcon,
  LockIcon,
  LogInBadgeIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
} from "./icons";

const roleRedirects: Record<string, string> = {
  principal: "/dashboard",
  teacher: "/teacher",
  parent: "/parent",
};

const footerItems = [
  { Icon: MapPinIcon, lines: ["Allama Iqbal Town, Basirpur,", "Lahore, Pakistan"] },
  { Icon: PhoneIcon, lines: ["0341 8298314", "0345 2027799"] },
  { Icon: MailIcon, lines: ["info@alemaanschool.edu.pk", "www.alemaanschool.edu.pk"] },
  { Icon: ShieldCheckIcon, lines: ["Safe Environment", "Quality Education"] },
];

export default function AuthCard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    if (isLikelyPhone(identifier)) {
      const result = await loginWithPhone({ phone: identifier, password });
      setLoading(false);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      router.push(roleRedirects[result.role] ?? "/");
      return;
    }

    const supabase = createClient();

    // 1. Login with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

    if (authError || !authData.user) {
      setErrorMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    // 2. Get this user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      setErrorMessage("User profile was not found.");
      setLoading(false);
      return;
    }

    // 3. Redirect according to role
    const destination = roleRedirects[profile.role as string];
    if (!destination) {
      setErrorMessage("Your account does not have a valid role.");
      setLoading(false);
      return;
    }

    router.push(destination);
  }

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLikelyPhone(forgotEmail)) return;

    setForgotSending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setForgotSending(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("If that email is registered, a reset link has been sent.", "success");
    setForgotOpen(false);
    setForgotEmail("");
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
          <div className="animate-auth-zoom flex w-full flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3AB67D] to-[#13714C] text-white shadow-lg">
              <LogInBadgeIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-3 text-3xl font-extrabold tracking-wide text-[#0f4d34]">LOGIN</h2>
            <p className="mt-1 text-sm text-gray-500">Login to your account</p>

            <form onSubmit={handleLogin} className="mt-6 w-full max-w-sm space-y-4">
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Email or Phone Number"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
                />
              </div>

              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-semibold text-[#13714C] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {errorMessage && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] py-3.5 text-sm font-bold tracking-wide text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
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

      <Modal
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false);
          setForgotEmail("");
        }}
        title="Reset your password"
      >
        {isLikelyPhone(forgotEmail) ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Password resets for teacher and parent accounts are handled at the school office. Please visit in
              person with valid ID.
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotEmail("");
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter your account email, or your phone number if you&apos;re a teacher or parent.
            </p>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Email or Phone Number"
                autoComplete="username"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotEmail("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={forgotSending}>
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
