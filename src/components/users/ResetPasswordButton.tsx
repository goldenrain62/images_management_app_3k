"use client"

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import { RefreshCcw, X, Copy, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ResetPasswordButtonProps {
  userId: string;
}

const ResetPasswordButton = ({ userId }: ResetPasswordButtonProps) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwordData, setPasswordData] = useState<{
    newPassword: string;
    userName: string;
    userEmail: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleResetPassword = async () => {
    const confirmed = confirm(
      "Bạn có chắc chắn muốn reset mật khẩu người dùng này về mật khẩu mặc định?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể reset mật khẩu");
      }

      const data = await response.json();
      setPasswordData(data.data);
      setShowModal(true);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (passwordData?.newPassword) {
      try {
        await navigator.clipboard.writeText(passwordData.newPassword);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPasswordData(null);
    setIsCopied(false);
  };

  return (
    <>
      <div className="flex items-center gap-5">
        <Button
          size="md"
          variant="primary"
          startIcon={<RefreshCcw />}
          onClick={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? "Đang reset..." : "Reset Mật Khẩu"}
        </Button>
      </div>

      {/* Success Modal */}
      {showModal && passwordData && (
        <div className="fixed inset-0 z-99991 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-lg ${
              theme === "dark"
                ? "bg-gray-800/95 backdrop-blur-md"
                : "bg-white/95 backdrop-blur-md"
            }`}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2
                className={`text-xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Reset mật khẩu thành công
              </h2>
              <button
                onClick={handleCloseModal}
                className={`rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tên người dùng
                </label>
                <p
                  className={`rounded-md border px-3 py-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-gray-50 text-gray-900"
                  }`}
                >
                  {passwordData.userName}
                </p>
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <p
                  className={`rounded-md border px-3 py-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-gray-50 text-gray-900"
                  }`}
                >
                  {passwordData.userEmail}
                </p>
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Mật khẩu mới
                </label>
                <div className="flex gap-2">
                  <p
                    className={`flex-1 rounded-md border px-3 py-2 font-mono text-lg font-semibold ${
                      theme === "dark"
                        ? "border-green-600 bg-green-900/30 text-green-400"
                        : "border-green-300 bg-green-50 text-green-700"
                    }`}
                  >
                    {passwordData.newPassword}
                  </p>
                  <button
                    onClick={handleCopyPassword}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
                      isCopied
                        ? "bg-green-600 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`rounded-md border-l-4 p-3 ${
                  theme === "dark"
                    ? "border-yellow-600 bg-yellow-900/20 text-yellow-400"
                    : "border-yellow-400 bg-yellow-50 text-yellow-800"
                }`}
              >
                <p className="text-sm">
                  Hãy lưu mật khẩu này và gửi cho người dùng. Người dùng nên đổi
                  mật khẩu sau khi đăng nhập lần đầu.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCloseModal} size="md">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordButton;
