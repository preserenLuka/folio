import { AuthForm } from "@/components/auth-form";
import { login } from "@/lib/actions-auth";
export default function Page() { return <AuthForm mode="login" action={login} />; }
