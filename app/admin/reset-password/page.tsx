
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage("This reset link is invalid or expired. Request a new one.");
        setValidSession(false);
      } else {
        setValidSession(true);
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  async function handleUpdatePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setMessage("Password updated successfully. Redirecting to login...");

    setTimeout(() => {
      router.replace("/admin/login");
    }, 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e9e5dd] px-5 text-[#171614]">
      <form
        onSubmit={handleUpdatePassword}
        className="w-full max-w-md border border-black/10 bg-white p-8 shadow-xl md:p-12"
      >
        <p className="text-center text-[10px] font-semibold tracking-[4px] text-[#a17b55]">
          ATELIER ADMINISTRATION
        </p>

        <h1 className="mt-5 text-center font-serif text-4xl font-semibold">
          New password.
        </h1>

        <p className="mt-3 text-center text-sm text-[#55514b]">
          Create a new password for your admin account.
        </p>

        {checking ? (
          <p className="mt-8 text-center text-sm">Verifying reset link...</p>
        ) : validSession ? (
          <>
            <label className="mt-10 block text-xs font-semibold">
              New password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-2 w-full border border-[#c9c4bb] p-3 text-sm outline-none focus:border-[#a17b55]"
            />

            <label className="mt-5 block text-xs font-semibold">
              Confirm password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-2 w-full border border-[#c9c4bb] p-3 text-sm outline-none focus:border-[#a17b55]"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-[#171614] py-4 text-xs tracking-[3px] text-white transition hover:bg-[#a17b55] disabled:opacity-50"
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </>
        ) : null}

        {message && (
          <p className="mt-5 text-center text-sm text-[#a17b55]">
            {message}
          </p>
        )}

        {!validSession && !checking && (
          <a
            href="/admin/login"
            className="mt-6 block text-center text-xs text-[#a17b55] hover:underline"
          >
            Return to Admin Login
          </a>
        )}
      </form>
    </main>
  );
}
