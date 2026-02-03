"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/ui/button/Button";
import { Trash2 } from "lucide-react";

interface DeleteUserButtonProps {
  userId: string;
}

const DeleteUserButton = ({ userId }: DeleteUserButtonProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setIsOpen(false);
        router.push("/users");
        router.refresh();
      } else {
        setError(data.error || "Đã xảy ra lỗi khi xóa tài khoản");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        size="md"
        variant="danger"
        startIcon={<Trash2 />}
        onClick={() => setIsOpen(true)}
      >
        Xóa tài khoản
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-99991 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-lg ${
              theme === "dark"
                ? "bg-gray-800/95 backdrop-blur-md"
                : "bg-white/95 backdrop-blur-md"
            }`}
          >
            <h2
              className={`mb-4 text-xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Xác nhận xóa tài khoản
            </h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <p
              className={`mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể
              hoàn tác.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className={`rounded-md px-4 py-2 ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteUserButton;
