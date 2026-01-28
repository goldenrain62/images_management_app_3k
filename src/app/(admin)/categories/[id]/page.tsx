"use client";

import { use, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Eye, Download, Trash2 } from "lucide-react";
import { ImageProps } from "@/types";
import UploadImageButton from "@/components/categories/UploadImageButton";
import Blank from "@/components/common/Blank";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { imageSizeFormatter } from "@/lib/utils";

const DetailedCategoryPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Unwrap the promise to get the actual ID
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;

  const [categoryName, setCategoryName] = useState<string>("");
  const [images, setImages] = useState<ImageProps[]>([]);

  const loadImages = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}/images`);
      const result = await response.json();

      if (!response.ok) throw new Error("Failed to load images");

      setCategoryName(result.name);

      const transformedData: ImageProps[] = result.images.map((item: any) => ({
        id: item._id,
        name: item.name,
        size: imageSizeFormatter(item.size),
        imageUrl: item.imageUrl,
        thumbnailUrl: item.thumbnailUrl,
        uploadDate: new Date(item.createdAt).toLocaleDateString("vi-VN").slice(0, 10),
        uploader: item.uploader.name,
      }));

      setImages(transformedData);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect hooks
  useEffect(() => {
    loadImages();
  }, [categoryId]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Loại sàn" subPageTitle={categoryName} />

      <div className="mb-5 flex justify-end">
        <UploadImageButton
          categoryId={categoryId}
          onUploadSuccess={loadImages}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : images.length === 0 ? (
        <Blank message="Hiện chưa có ảnh nào" />
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
                    Ảnh
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
                    Ngày tải
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Người tải
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
                {images.map((image) => (
                  <tr
                    key={image.id}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={image.thumbnailUrl}
                          alt={image.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <span
                          className={`ml-4 text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {image.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {image.size}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {image.uploadDate}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {image.uploader}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          className={
                            theme === "dark"
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-900"
                          }
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className={
                            theme === "dark"
                              ? "text-green-400 hover:text-green-300"
                              : "text-green-600 hover:text-green-900"
                          }
                        >
                          <Download size={18} />
                        </button>
                        <button
                          className={
                            theme === "dark"
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-900"
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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

export default DetailedCategoryPage;
