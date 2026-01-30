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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }), // Sending as array for your API
      });

      if (res.ok) {
        setName("");
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating category:", error);
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
          <div className="mx-4 w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                Loại sàn mới
              </h3>

              <input
                autoFocus
                type="text"
                placeholder="Nhập tên loại sàn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-md border-2 border-blue-500 px-3 py-2 text-gray-700 outline-none focus:ring-0"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !name.trim()}
                className="rounded-md px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
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
