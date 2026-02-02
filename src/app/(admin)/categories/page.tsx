"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderMinus, Wrench, Trash2, Plus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Blank from "@/components/common/Blank";
import CreateCategoryButton from "@/components/categories/CreateCategoryButton";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { imageSizeFormatter } from "@/lib/utils";

interface CategoryProps {
  id: string;
  name: string;
  createDate: string;
  creator: string;
  imagesQty: number;
  totalSize: number;
}

const CategoriesPage = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryProps[]>([]);

  // Edit state
  const [editingCategory, setEditingCategory] = useState<CategoryProps | null>(null);
  const [editName, setEditName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [deletingCategory, setDeletingCategory] = useState<CategoryProps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Move the fetch logic into a stable, reusable function
  const fetchCategories = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true); // Show loading state while refreshing
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tải danh sách loại sàn");
      }

      const data = await response.json();

      // Transform the data to match CategoryProps
      const transformedData: CategoryProps[] = data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        createDate: new Date(item.createdAt).toLocaleDateString("vi-VN"), // Format the date
        creator: item.creator.name, // Flatten the object to a string
        imagesQty: item.imagesQty || 0,
        totalSize: item.totalSize || 0,
      }));

      setCategories(transformedData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When the page first loads
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Keyboard shortcuts for edit modal
  useEffect(() => {
    if (!isEditModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        setEditName("");
      }
      if (e.key === "Enter" && !isUpdating) {
        e.preventDefault();
        handleEditSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditModalOpen, editName, isUpdating, editingCategory]);

  // When a new category is created (Silent refresh):
  const onCategoryCreated = () => {
    fetchCategories(true); // The user stays on the page, and the new item just "pops" into the list
  };

  // Handle edit button click
  const handleEditClick = (category: CategoryProps) => {
    setEditingCategory(category);
    setEditName(category.name);
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editingCategory || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể cập nhật loại sàn");
      }

      // Update local state
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name: editName.trim() } : cat
        )
      );

      // Close modal
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setEditName("");
    } catch (err: any) {
      console.error("Error updating category:", err);
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (category: CategoryProps) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa loại sàn");
      }

      // Remove from local state
      setCategories((prev) => prev.filter((cat) => cat.id !== deletingCategory.id));

      // Close modal
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Loại sàn" pageTitleNav="categories" />
      <div className="mb-5 flex justify-end">
        <CreateCategoryButton onSuccess={onCategoryCreated} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchCategories()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <Blank message="Hiện chưa có dữ liệu nào về loại sàn" />
      ) : (
        <div
          className={`rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"} overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}
              >
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Tên
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Hình ảnh
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Dung lượng
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Ngày tạo
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Nguời tạo
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/categories/${category.id}`}>
                        <div className="flex items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center ${
                              theme === "dark" ? "text-white" : "text-gray-600"
                            }`}
                          >
                            <FolderMinus size={50} />
                          </div>
                          <div className="ml-4">
                            <div
                              className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                            >
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {category.imagesQty}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {imageSizeFormatter(category.totalSize)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {category.createDate.slice(0, 10)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {category.creator}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(category)}
                        className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} mr-3`}
                        title="Chỉnh sửa"
                      >
                        <Wrench />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}
                        title="Xóa"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-99991 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-lg ${theme === "dark" ? "bg-gray-800/95 backdrop-blur-md" : "bg-white/95 backdrop-blur-md"}`}
          >
            <h2
              className={`mb-4 text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Chỉnh sửa loại sàn
            </h2>
            <div className="mb-4">
              <label
                className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Tên loại sàn
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Nhập tên loại sàn"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                  setEditName("");
                }}
                disabled={isUpdating}
                className={`rounded-md px-4 py-2 ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                Hủy
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isUpdating || !editName.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-99991 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-lg ${theme === "dark" ? "bg-gray-800/95 backdrop-blur-md" : "bg-white/95 backdrop-blur-md"}`}
          >
            <h2
              className={`mb-4 text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Xác nhận xóa
            </h2>
            <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Bạn có chắc chắn muốn xóa loại sàn{" "}
              <span className="font-semibold">{deletingCategory?.name}</span>?
              <br />
              <span className="text-sm text-red-500">
                Lưu ý: Tất cả hình ảnh thuộc loại sàn này cũng sẽ bị xóa.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingCategory(null);
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
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
