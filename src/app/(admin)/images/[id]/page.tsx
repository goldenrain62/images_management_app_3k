"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { imageSizeFormatter } from "@/lib/utils";

interface ImageDetail {
  id: string;
  name: string;
  size: number;
  productUrl: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  uploadedAt: string;
  uploader: {
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  };
}

const ImageDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const resolvedParams = use(params);
  const imageId = resolvedParams.id;

  const [image, setImage] = useState<ImageDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editProductUrl, setEditProductUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories for dropdown
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch image details
  const fetchImageDetails = async () => {
    if (!imageId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${imageId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không thể tải thông tin ảnh");
      }

      setImage(result);
    } catch (err: any) {
      console.error("Error loading image details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (response.ok) {
        const categoriesList = result.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }));
        setCategories(categoriesList);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Handle edit mode
  const handleEditClick = () => {
    if (image) {
      setEditName(image.name);
      setEditProductUrl(image.productUrl || "");
      setEditCategoryId(image.category.id);
      setIsEditMode(true);
    }
  };

  // Handle update submit
  const handleUpdateSubmit = async () => {
    if (!image || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          productUrl: editProductUrl.trim() || null,
          categoryId: editCategoryId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không thể cập nhật ảnh");
      }

      // Update local state with new data
      setImage(result.image);
      setIsEditMode(false);
      alert("Cập nhật ảnh thành công!");
    } catch (err: any) {
      console.error("Error updating image:", err);
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!image) return;

    // Confirmation dialog
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ảnh "${image.name}"?\n\nHành động này không thể hoàn tác.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không thể xóa ảnh");
      }

      alert("Xóa ảnh thành công!");
      router.push("/images");
    } catch (err: any) {
      console.error("Error deleting image:", err);
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (imageId) {
      fetchImageDetails();
      fetchCategories();
    }
  }, [imageId]);

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Hình ảnh"
        pageTitleNav="images"
        subPageTitle={image?.name}
      />

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchImageDetails()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : image ? (
        <div className="space-y-6">
          {/* Main Content */}
          <div
            className={`overflow-hidden rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
          >
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
              {/* Left Side - Image */}
              <div className="flex items-start justify-center">
                <div className="w-full overflow-hidden rounded-lg">
                  <img
                    src={image.imageUrl}
                    alt={image.name}
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="space-y-6">
                <h2
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  Chi tiết hình ảnh
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Tên ảnh
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`w-full rounded-md border px-3 py-2 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    ) : (
                      <p
                        className={`rounded-md border px-3 py-2 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        }`}
                      >
                        {image.name}
                      </p>
                    )}
                  </div>

                  {/* Size */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Dung lượng
                    </label>
                    <p
                      className={`rounded-md border px-3 py-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-gray-50 text-gray-900"
                      }`}
                    >
                      {imageSizeFormatter(image.size)}
                    </p>
                  </div>

                  {/* Product URL */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      URL sản phẩm
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editProductUrl}
                        onChange={(e) => setEditProductUrl(e.target.value)}
                        className={`w-full rounded-md border px-3 py-2 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        placeholder="Nhập URL sản phẩm"
                      />
                    ) : (
                      <p
                        className={`rounded-md border px-3 py-2 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        }`}
                      >
                        {image.productUrl || "Chưa có"}
                      </p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      URL ảnh
                    </label>
                    <p
                      className={`break-all rounded-md border px-3 py-2 text-sm ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-gray-50 text-gray-900"
                      }`}
                    >
                      {image.imageUrl}
                    </p>
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      URL ảnh thumbnail
                    </label>
                    <p
                      className={`break-all rounded-md border px-3 py-2 text-sm ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-gray-50 text-gray-900"
                      }`}
                    >
                      {image.thumbnailUrl}
                    </p>
                  </div>

                  {/* Category Name */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Loại sàn
                    </label>
                    {isEditMode ? (
                      <select
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                        className={`w-full rounded-md border px-3 py-2 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p
                        className={`rounded-md border px-3 py-2 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        }`}
                      >
                        {image.category.name}
                      </p>
                    )}
                  </div>

                  {/* Uploader */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Người tải lên
                    </label>
                    <p
                      className={`rounded-md border px-3 py-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-gray-50 text-gray-900"
                      }`}
                    >
                      {image.uploader.name}
                    </p>
                  </div>

                  {/* Upload Date */}
                  <div>
                    <label
                      className={`mb-1 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Ngày tải lên
                    </label>
                    <p
                      className={`rounded-md border px-3 py-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-gray-50 text-gray-900"
                      }`}
                    >
                      {new Date(image.uploadedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Edit/Save/Cancel Buttons */}
                <div className="pt-4">
                  {isEditMode ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditMode(false)}
                        disabled={isUpdating}
                        className={`flex-1 rounded-md px-4 py-2 font-medium ${
                          theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } transition-colors disabled:opacity-50`}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdateSubmit}
                        disabled={isUpdating || !editName.trim()}
                        className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUpdating ? "Đang lưu..." : "Lưu"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleEditClick}
                        disabled={isDeleting}
                        className={`flex-1 rounded-md px-4 py-2 font-medium ${
                          theme === "dark"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        } transition-colors disabled:opacity-50`}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageDetailPage;
