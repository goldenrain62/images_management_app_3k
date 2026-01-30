"use client";

import { useState } from "react";
import { Grid, List, Eye, Download, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ImageProps } from "@/types";

const ImagePage = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [images, setImages] = useState<ImageProps[]>([
    {
      id: "1",
      name: "Sàn Gỗ ShopHouse SH118",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      uploader: "John Doe",
      thumbnailUrl: "https://myspace.3khome.vn/thumbnail/san-go-shop-house-SH118-300x300.jpg",
    },
    {
      id: "2",
      name: "Sàn Gỗ ShopHouse SH300+28",
      size: "3.1 MB",
      uploadDate: "2024-01-14",
      uploader: "Jane Smith",
      thumbnailUrl: "https://myspace.3khome.vn/thumbnail/san-go-shophouse12mm-SH300-28-300x300.jpg",
    },
    {
      id: "3",
      name: "Sàn Gỗ Nam Việt F8+18",
      size: "1.8 MB",
      uploadDate: "2024-01-13",
      uploader: "Bob Johnson",
      thumbnailUrl: "https://myspace.3khome.vn/thumbnail/san-go-f8-nam-viet-f8-18-300x300.jpg",
    },
    {
      id: "4",
      name: "Sàn Gỗ Nam Việt F12-65",
      size: "4.2 MB",
      uploadDate: "2024-01-12",
      uploader: "Alice Williams",
      thumbnailUrl: "https://myspace.3khome.vn/thumbnail/F12-NamViet-65-300x300.jpg",
    },
    {
      id: "5",
      name: "Sàn Gỗ 3K Vina V8880",
      size: "2.9 MB",
      uploadDate: "2024-01-11",
      uploader: "John Doe",
      thumbnailUrl: "https://myspace.3khome.vn/thumbnail/san-go-cong-nghiep-3k-vina-V8880-300x300.jpg",
    },
    {
      id: "6",
      name: "Sàn Gỗ 3K Art Xương Cá Z8+88",
      size: "3.5 MB",
      uploadDate: "2024-01-10",
      uploader: "Jane Smith",
      thumbnailUrl: "https://myspace.3khome.vn/thumbnail/san-go-van-xuong-ca-3K-Art-Z8+88-300x300.jpg",
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Hình ảnh
        </h2>
        <div className="flex gap-3">
          <div
            className={`flex rounded-lg overflow-hidden border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
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

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className={`rounded-lg overflow-hidden shadow ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img
                  src={image.thumbnailUrl}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3
                  className={`font-medium mb-2 truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {image.name}
                </h3>
                <div
                  className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  <p>
                    {image.size} • {image.uploadDate}
                  </p>
                  <p>By {image.uploader}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } text-sm`}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    className={`p-2 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className={`p-2 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-red-400"
                        : "bg-gray-100 hover:bg-gray-200 text-red-600"
                    }`}
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
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Image
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Size
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Upload Date
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Uploader
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Actions
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
                          className="w-12 h-12 rounded object-cover"
                        />
                        <span
                          className={`ml-4 text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {image.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {image.size}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {image.uploadDate}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {image.uploader}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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

export default ImagePage;
