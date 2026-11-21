"use client";
import { useActionState } from "react";
import Link from "next/link";

export function AuthForm({ mode, action }: { mode: "login" | "register"; action: (s: unknown, f: FormData) => Promise<{ error?: string } | null> }) {
  const [state, run, pending] = useActionState(action, null as { error?: string } | null);
  const input = "w-full rounded-lg border border-wood/30 bg-white/70 px-3 py-2";
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="font-serif text-3xl">Folio</h1>
      <form action={run} className="flex flex-col gap-3">
        {mode === "register" && <input name="name" placeholder="Name" className={input} required />}
        <input name="email" type="email" placeholder="Email" className={input} required />
        <input name="password" type="password" placeholder="Password (8+ chars)" className={input} required minLength={8} />
        {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <button disabled={pending} className="rounded-lg bg-accent px-3 py-2 font-medium text-white disabled:opacity-60">
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="text-sm">
        {mode === "login" ? <>New here? <Link className="underline" href="/register">Create an account</Link></>
          : <>Have an account? <Link className="underline" href="/login">Log in</Link></>}
      </p>
    </main>
  );
}
