
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setMessage(error?.message || "Login failed.");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        setMessage(
          adminError?.message || "This account does not have admin access."
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        }
      );

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Password reset email sent. Check your inbox and follow the link."
      );
    } catch {
      setMessage("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e9e5dd] px-5 text-[#171614]">
      <form
        onSubmit={forgotMode ? handleForgotPassword : handleLogin}
        className="w-full max-w-md border border-black/10 bg-white p-8 shadow-xl md:p-12"
      >
        <p className="text-center text-[10px] font-semibold tracking-[4px] text-[#a17b55]">
          ATELIER ADMINISTRATION
        </p>

        <h1 className="mt-5 text-center font-serif text-4xl font-semibold">
          {forgotMode ? "Reset password." : "Welcome back."}
        </h1>

        <p className="mt-3 text-center text-sm text-[#55514b]">
          {forgotMode
            ? "Enter your admin email to receive a password reset link."
            : "Sign in to manage your fashion store."}
        </p>

        <label className="mt-10 block text-xs font-semibold">
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="mt-2 w-full border border-[#c9c4bb] bg-white p-3 text-sm outline-none placeholder:text-[#99938a] focus:border-[#a17b55]"
        />

        {!forgotMode && (
          <>
            <label className="mt-5 block text-xs font-semibold">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full border border-[#c9c4bb] bg-white p-3 text-sm outline-none placeholder:text-[#99938a] focus:border-[#a17b55]"
            />

            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setMessage("");
                }}
                className="text-xs text-[#a17b55] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}

        {message && (
          <p className="mt-4 text-sm text-center text-[#a17b55]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-[#171614] py-4 text-xs tracking-[3px] text-white transition hover:bg-[#a17b55] disabled:opacity-50"
        >
          {loading
            ? forgotMode
              ? "SENDING..."
              : "SIGNING IN..."
            : forgotMode
              ? "SEND RESET LINK"
              : "SIGN IN"}
        </button>

        {forgotMode && (
          <button
            type="button"
            onClick={() => {
              setForgotMode(false);
              setMessage("");
            }}
            className="mt-5 block w-full text-center text-xs text-[#55514b] hover:text-[#a17b55]"
          >
            Back to Admin Login
          </button>
        )}

        <a
          href="/"
          className="mt-6 block text-center text-xs text-[#55514b] hover:text-[#a17b55]"
        >
          Back to storefront
        </a>
      </form>
    </main>
  );
}
