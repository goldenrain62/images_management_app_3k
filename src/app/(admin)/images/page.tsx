"use client";

import { useState, useEffect, useCallback } from "react";
import { Grid, List, Eye, Download, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ImageProps } from "@/types";
import { imageSizeFormatter } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Blank from "@/components/common/Blank";
import ImageViewer from "@/components/common/ImageViewer";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";

const ImagePage = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [images, setImages] = useState<ImageProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Fetch images from API
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/images");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tải danh sách hình ảnh");
      }

      const data = await response.json();

      // Transform the data to match ImageProps
      const transformedData: ImageProps[] = data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        size: imageSizeFormatter(item.size),
        uploadDate: new Date(item.uploadedAt).toLocaleDateString("vi-VN"),
        uploader: item.uploader.name,
        imageUrl: item.imageUrl,
        thumbnailUrl: item.thumbnailUrl,
        categoryId: item.category.id,
        categoryName: item.category.name,
      }));

      setImages(transformedData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching images:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load images on mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Open image viewer
  const openImageViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  // Download image
  const handleDownload = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Không thể tải xuống ảnh. Vui lòng thử lại.");
    }
  };

  // Delete image
  const handleDelete = async (
    imageId: string,
    categoryId: string,
    imageName: string,
  ) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ảnh "${imageName}"?\n\nHành động này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/categories/${categoryId}/images/${imageId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Reload images after successful deletion
        fetchImages();
      } else {
        alert(data.error || "Không thể xóa ảnh. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Đã xảy ra lỗi khi xóa ảnh. Vui lòng thử lại.");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Hình ảnh" pageTitleNav="images" />
      <div className="mb-6 flex items-center justify-end">
        <div className="flex gap-3">
          <div
            className={`flex overflow-hidden rounded-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? (theme === "dark" ? "bg-gray-700" : "bg-gray-200") : ""}`}
            >
              <Grid
                size={20}
                className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
              />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? (theme === "dark" ? "bg-gray-700" : "bg-gray-200") : ""}`}
            >
              <List
                size={20}
                className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchImages()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <LoadingSpinner />
      ) : images.length === 0 ? (
        <Blank message="Hiện chưa có hình ảnh nào" />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`overflow-hidden rounded-lg shadow ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Link href={`/images/${image.id}`}>
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={image.thumbnailUrl}
                    alt={image.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/images/${image.id}`}>
                  <h3
                    className={`mb-2 truncate font-medium hover:underline ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {image.name}
                  </h3>
                </Link>
                <div
                  className={`mb-3 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  <p>
                    {image.size} • {image.uploadDate}
                  </p>
                  <p>By {image.uploader}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openImageViewer(index)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } text-sm`}
                    title="Xem ảnh"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(image.imageUrl, image.name)}
                    className={`rounded p-2 ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Tải xuống"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(image.id, image.categoryId!, image.name)
                    }
                    className={`rounded p-2 ${
                      theme === "dark"
                        ? "bg-gray-700 text-red-400 hover:bg-gray-600"
                        : "bg-gray-100 text-red-600 hover:bg-gray-200"
                    }`}
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                    Dung lượng
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
                {images.map((image, index) => (
                  <tr
                    key={image.id}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/images/${image.id}`}>
                        <div className="flex items-center">
                          <img
                            src={image.thumbnailUrl}
                            alt={image.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <span
                            className={`ml-4 text-sm font-medium hover:underline ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                          >
                            {image.name}
                          </span>
                        </div>
                      </Link>
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
                          onClick={() => openImageViewer(index)}
                          className={
                            theme === "dark"
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-900"
                          }
                          title="Xem ảnh"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(image.imageUrl, image.name)
                          }
                          className={
                            theme === "dark"
                              ? "text-green-400 hover:text-green-300"
                              : "text-green-600 hover:text-green-900"
                          }
                          title="Tải xuống"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              image.id,
                              image.categoryId!,
                              image.name,
                            )
                          }
                          className={
                            theme === "dark"
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-900"
                          }
                          title="Xóa"
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

      {/* Image Viewer Modal */}
      {viewerOpen && (
        <ImageViewer
          images={images}
          currentIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default ImagePage;
