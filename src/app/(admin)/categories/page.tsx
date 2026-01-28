"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderMinus, Wrench, Trash2, Plus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { CategoryProps } from "@/types/index";
import Blank from "@/components/common/Blank";
import CreateCategoryButton from "@/components/categories/CreateCategoryButton";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const CategoriesPage = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryProps[]>([]);

  // Move the fetch logic into a stable, reusable function
  const fetchCategories = useCallback(async (isSilent = false) => {
    setIsLoading(true); // Show loading state while refreshing
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();

      // Transform the data to match CategoryProps
      const transformedData: CategoryProps[] = data.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        images_qty: item.images_qty,
        size: item.size,
        createDate: new Date(item.createdAt).toLocaleDateString("vi-VN"), // Format the date
        creator: item.creator.name, // Flatten the object to a string
      }));

      setCategories(transformedData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When the page first loads
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // When a new category is created (Silent refresh):
  const onCategoryCreated = () => {
    fetchCategories(true); // The user stays on the page, and the new item just "pops" into the list
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Loại sàn" />
      <div className="flex justify-end mb-5">
        <CreateCategoryButton onSuccess={onCategoryCreated} />
      </div>

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
                    Kích cỡ tệp
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
                      {category.images_qty}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {category.size} MB
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
                        className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} mr-3`}
                      >
                        <Wrench />
                      </button>
                      <button
                        className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}
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
    </div>
  );
};

export default CategoriesPage;
