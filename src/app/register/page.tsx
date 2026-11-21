import { AuthForm } from "@/components/auth-form";
import { register } from "@/lib/actions-auth";
export default function Page() { return <AuthForm mode="register" action={register} />; }
