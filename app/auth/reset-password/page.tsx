// This route is no longer used — the full reset flow lives on /auth/forgot-password
import { redirect } from "next/navigation";
export default function ResetPasswordPage() {
  redirect("/auth/forgot-password");
}
