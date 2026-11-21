"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "./icons";

const SPINES = [["#b4532a", 88], ["#2f4a3f", 104], ["#c8962c", 76], ["#3b2f5c", 112], ["#8c3b4f", 92], ["#24384a", 100], ["#6b7a45", 80]] as const;

export function AuthForm({ mode, action }: { mode: "login" | "register"; action: (s: unknown, f: FormData) => Promise<{ error?: string } | null> }) {
  const [state, run, pending] = useActionState(action, null as { error?: string } | null);
  const login = mode === "login";
  return (
    <main className="page-enter mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-7 px-6 py-10">
      <div>
        <div className="mb-6 flex items-end gap-[5px]" aria-hidden>{SPINES.map(([c, h], i) => <span key={i} className="w-[22px] rounded-[3px] shadow-sm" style={{ background: c, height: h, transform: i === 4 ? "rotate(7deg)" : undefined, transformOrigin: "bottom left" }} />)}<span className="ml-1 h-[3px] w-full rounded bg-line-strong" /></div>
        <div className="flex items-center gap-2"><Logo className="h-8 w-8" /><span className="display text-3xl">Folio</span></div>
        <h1 className="display mt-4 text-[1.65rem] !font-medium leading-snug">{login ? "Welcome back to your shelf." : "Build the shelf you’ve always wanted."}</h1>
        <p className="mt-1.5 text-sm text-muted">{login ? "Log in to pick up where you left off." : "Track what you read, shelve what you own."}</p>
      </div>
      <form action={run} className="flex flex-col gap-4">
        {!login && <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" className="field" required /></div>}
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" className="field" required /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={login ? "current-password" : "new-password"} className="field" required minLength={8} placeholder={login ? undefined : "At least 8 characters"} /></div>
        {state?.error ? <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p> : null}
        <button disabled={pending} className="btn btn-primary mt-1 !min-h-12 text-base">{pending ? "One moment…" : login ? "Log in" : "Create account"}</button>
      </form>
      <p className="text-center text-sm text-muted">
        {login ? <>New here? <Link className="font-semibold text-accent" href="/register">Create an account</Link></>
          : <>Have an account? <Link className="font-semibold text-accent" href="/login">Log in</Link></>}
      </p>
    </main>
  );
}
