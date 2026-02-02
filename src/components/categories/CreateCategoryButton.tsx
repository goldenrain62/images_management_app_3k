"use client";

import {
  useState,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Plus } from "lucide-react";

interface CreateCategoryProps {
  onSuccess: () => void;
}

const CreateCategoryButton = ({ onSuccess }: CreateCategoryProps) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên loại sàn");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setName("");
        setDescription("");
        setIsOpen(false);
        onSuccess();
      } else {
        setError(data.error || "Đã xảy ra lỗi khi tạo loại sàn");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreate();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium ${
          theme === "dark"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white transition-colors`}
      >
        <Plus size={20} className="font-bold" />
        Mới
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-99991 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800">
            <div className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
                Loại sàn mới
              </h3>

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Category Name */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên loại sàn <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Nhập tên loại sàn"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-md border-2 border-blue-500 px-3 py-2 text-gray-700 outline-none focus:ring-0 dark:bg-gray-700 dark:text-white dark:border-blue-400"
                />
              </div>

              {/* Category Description (Optional) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  placeholder="Nhập mô tả"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-gray-700 outline-none focus:border-blue-500 focus:ring-0 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 dark:bg-gray-900">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setName("");
                  setDescription("");
                }}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !name.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCategoryButton;
