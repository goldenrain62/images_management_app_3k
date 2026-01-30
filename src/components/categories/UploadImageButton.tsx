"use client";

import { useTheme } from "@/context/ThemeContext";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
interface UploadImageButtonProps {
  categoryId: string;
  onUploadSuccess: () => void;
}

const UploadImageButton = ({
  categoryId,
  onUploadSuccess,
}: UploadImageButtonProps) => {
  const { theme } = useTheme();

  const [uploading, setUploading] = useState(false);

  // 1. Create a reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Trigger the file explorer when the button is clicked
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Handle the file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onUploadSuccess(); // Refresh the parent's list
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset for next upload
    }
  };

  return (
    <>
      {/* 4. Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <button
        onClick={handleButtonClick}
        disabled={uploading}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
          uploading ? "cursor-not-allowed opacity-50" : ""
        } ${
          theme === "dark"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        <Plus size={20} className="font-bold" />
        {uploading ? "Đang tải..." : "Mới"}
      </button>
    </>
  );
};

export default UploadImageButton;
