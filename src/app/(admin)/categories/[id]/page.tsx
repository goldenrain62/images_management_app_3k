"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Eye, Download, Trash2 } from "lucide-react";
import { ImageProps } from "@/types";
import UploadImageButton from "@/components/categories/UploadImageButton";
import Blank from "@/components/common/Blank";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ImageViewer from "@/components/common/ImageViewer";
import { imageSizeFormatter } from "@/lib/utils";
import Link from "next/link";

const DetailedCategoryPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [isloading, setisloading] = useState<boolean>(false);
  const [error, seterror] = useState<string | null>(null);

  // unwrap the promise to get the actual id
  const resolvedparams = use(params);
  const categoryid = resolvedparams.id;

  const [categoryname, setcategoryname] = useState<string>(searchParams.get("name") || "");
  const [images, setimages] = useState<ImageProps[]>([]);
  const [vieweropen, setvieweropen] = useState(false);
  const [viewerindex, setviewerindex] = useState(0);
  const LoadImages = async () => {
    if (!categoryid) return;

    setisloading(true);
    seterror(null);

    try {
      const response = await fetch(`/api/categories/${categoryid}/images`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "không thể tải danh sách ảnh");
      }

      setcategoryname(result.categoryName);

      const transformeddata: ImageProps[] = result.images.map((item: any) => ({
        id: item.id,
        name: item.name,
        size: imageSizeFormatter(item.size),
        imageUrl: item.imageUrl,
        thumbnailUrl: item.thumbnailUrl,
        uploadDate: new Date(item.createdAt).toLocaleDateString("vi-VN"),
        uploader: item.uploader.name,
      }));

      setimages(transformeddata);
    } catch (err: any) {
      console.error("error loading images:", err);
      seterror(err.message);
    } finally {
      setisloading(false);
    }
  };

  // open image viewer
  const OpenImageViewer = (index: number) => {
    setviewerindex(index);
    setvieweropen(true);
  };

  // download image
  const handledownload = async (imageurl: string, imagename: string) => {
    try {
      const response = await fetch(imageurl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = imagename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("download failed:", error);
      alert("không thể tải xuống ảnh. vui lòng thử lại.");
    }
  };

  // delete image
  const handledelete = async (imageid: string, imagename: string) => {
    // confirmation dialog
    const confirmed = window.confirm(
      `bạn có chắc chắn muốn xóa ảnh "${imagename}"?\n\nhành động này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/categories/${categoryid}/images/${imageid}`,
        {
          method: "delete",
        },
      );

      const data = await response.json();

      if (response.ok) {
        // reload images after successful deletion
        LoadImages();
      } else {
        alert(data.error || "không thể xóa ảnh. vui lòng thử lại.");
      }
    } catch (error) {
      console.error("delete failed:", error);
      alert("đã xảy ra lỗi khi xóa ảnh. vui lòng thử lại.");
    }
  };

  // useeffect hooks
  useEffect(() => {
    if (categoryid) {
      LoadImages();
    }
  }, [categoryid]);

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Loại sàn"
        pageTitleNav="categories"
        subPageTitle={categoryname}
      />

      <div className="mb-5 flex justify-end">
        <UploadImageButton
          categoryId={categoryid}
          onUploadSuccess={LoadImages}
        />
      </div>

      {/* error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={() => LoadImages()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            thử lại
          </button>
        </div>
      )}

      {isloading ? (
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
                    Ngày tải lên
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
                          onClick={() => OpenImageViewer(index)}
                          className={
                            theme === "dark"
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-900"
                          }
                          title="xem ảnh"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handledownload(image.imageUrl, image.name)
                          }
                          className={
                            theme === "dark"
                              ? "text-green-400 hover:text-green-300"
                              : "text-green-600 hover:text-green-900"
                          }
                          title="tải xuống"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handledelete(image.id, image.name)}
                          className={
                            theme === "dark"
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-900"
                          }
                          title="xóa"
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

      {/* image viewer modal */}
      {vieweropen && (
        <ImageViewer
          images={images}
          currentIndex={viewerindex}
          onClose={() => setvieweropen(false)}
        />
      )}
    </div>
  );
};

export default DetailedCategoryPage;
