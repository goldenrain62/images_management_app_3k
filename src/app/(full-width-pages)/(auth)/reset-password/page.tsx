import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Myspace Admin",
  description: "Reset your password for Myspace Admin Dashboard",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
