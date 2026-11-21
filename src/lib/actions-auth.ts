"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { createSession, destroySession } from "./auth";

const creds = z.object({ email: z.email(), password: z.string().min(8) });

export async function register(_: unknown, fd: FormData) {
  const parsed = creds.extend({ name: z.string().min(1) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Enter a name, a valid email and a password of 8+ characters." };
  const { email, password, name } = parsed.data;
  if (await db.user.findUnique({ where: { email: email.toLowerCase() } })) return { error: "That email is already registered." };
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(), name, passwordHash: await bcrypt.hash(password, 10),
      libraries: { create: [
        { name: "My library", isDefault: true, position: 0 },
        { name: "TBR", kind: "SMART", smartRule: { status: ["WANT_TO_READ"] }, position: 1 },
      ] },
    },
  });
  await createSession(user.id);
  redirect("/home");
}

export async function login(_: unknown, fd: FormData) {
  const parsed = creds.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Invalid email or password." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return { error: "Invalid email or password." };
  await createSession(user.id);
  redirect("/home");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
