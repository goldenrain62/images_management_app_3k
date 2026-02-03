"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    // Validate new password length
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    // Validate old and new password are different
    if (oldPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu cũ");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đặt lại mật khẩu thất bại");
      }

      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển hướng...");

      // Clear form
      setEmail("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              Đặt lại mật khẩu
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập thông tin để đặt lại mật khẩu của bạn
            </p>
          </div>
          <div>
            <form onSubmit={handleResetPassword}>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {success}
                </div>
              )}
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                  />
                </div>

                {/* Old Password */}
                <div>
                  <Label>
                    Mật khẩu cũ <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu cũ"
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      required
                    />
                    <span
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showOldPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <Label>
                    Mật khẩu mới <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      required
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <Label>
                    Nhập lại mật khẩu mới <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      required
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </Button>
                </div>

                {/* Back to Sign In Link */}
                <div className="text-center">
                  <Link
                    href="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
