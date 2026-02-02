"use client";

import { useTheme } from "@/context/ThemeContext";
import { Plus, Upload, X } from "lucide-react";
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  // Create a reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger the file explorer when the button is clicked
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle the file selection (multiple files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Validate file types
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} không phải là file ảnh`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError(`${file.name} quá lớn. Kích thước tối đa là 10MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    setError(null);
  };

  // Upload all selected files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();

    // Append all files
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setProgress(`Đang tải lên ${selectedFiles.length} ảnh...`);

      const res = await fetch(`/api/categories/${categoryId}/images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setProgress("");
        setSelectedFiles([]);
        onUploadSuccess(); // Refresh the parent's list
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setError(data.error || "Tải lên thất bại");
        setProgress("");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Đã xảy ra lỗi khi tải ảnh lên");
      setProgress("");
    } finally {
      setUploading(false);
    }
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Upload Button */}
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
        {uploading ? "Đang tải..." : "Chọn ảnh"}
      </button>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div
          className={`mt-4 rounded-lg border-2 p-4 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3
              className={`text-sm font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Đã chọn {selectedFiles.length} ảnh
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Xóa tất cả
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Progress Message */}
          {progress && (
            <div className="mb-3 rounded-md bg-blue-50 p-2 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {progress}
            </div>
          )}

          {/* File List */}
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between rounded-md p-2 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {file.name}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
              uploading || selectedFiles.length === 0
                ? "cursor-not-allowed bg-gray-400"
                : theme === "dark"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <Upload size={18} />
            {uploading
              ? "Đang tải lên..."
              : `Tải lên ${selectedFiles.length} ảnh`}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadImageButton;
