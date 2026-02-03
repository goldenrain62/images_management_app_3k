"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Eye } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Blank from "@/components/common/Blank";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CreateRoleButton from "@/components/roles/CreateRoleButton";

interface RoleProps {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const RolesPage = () => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleProps[]>([]);

  // Check if current user is Admin
  const isAdmin = session?.user?.role === "Admin";

  // View/Edit state
  const [viewingRole, setViewingRole] = useState<RoleProps | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format date to Vietnamese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fetch roles from API
  const fetchRoles = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const response = await fetch("/api/roles");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Không thể tải danh sách loại tài khoản",
        );
      }

      const data = await response.json();
      setRoles(data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // When a new role is created (Silent refresh):
  const onRoleCreated = () => {
    fetchRoles(true); // The user stays on the page, and the new item just "pops" into the list
  };

  // Keyboard shortcuts for view modal
  useEffect(() => {
    if (!isViewModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsViewModalOpen(false);
        setViewingRole(null);
        setEditName("");
        setEditDescription("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewModalOpen]);

  // Handle view button click
  const handleViewClick = (role: RoleProps) => {
    setViewingRole(role);
    setEditName(role.name);
    setEditDescription(role.description || "");
    setIsViewModalOpen(true);
  };

  // Handle update submit
  const handleUpdateSubmit = async () => {
    if (!viewingRole || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/roles/${viewingRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể cập nhật loại tài khoản");
      }

      // Update local state
      setRoles((prev) =>
        prev.map((role) =>
          role.id === viewingRole.id
            ? {
                ...role,
                name: editName.trim(),
                description: editDescription.trim() || null,
                updatedAt: new Date().toISOString(),
              }
            : role
        )
      );

      // Close modal
      setIsViewModalOpen(false);
      setViewingRole(null);
      setEditName("");
      setEditDescription("");
    } catch (err: any) {
      console.error("Error updating role:", err);
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDeleteRole = async () => {
    if (!viewingRole) return;

    const confirmDelete = confirm(
      `Bạn có chắc chắn muốn xóa loại tài khoản "${viewingRole.name}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/roles/${viewingRole.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa loại tài khoản");
      }

      // Remove from local state
      setRoles((prev) => prev.filter((role) => role.id !== viewingRole.id));

      // Close modal
      setIsViewModalOpen(false);
      setViewingRole(null);
      setEditName("");
      setEditDescription("");
    } catch (err: any) {
      console.error("Error deleting role:", err);
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Phân quyền" pageTitleNav="roles" />

      {isAdmin && (
        <div className="mb-5 flex justify-end">
          <CreateRoleButton onSuccess={onRoleCreated} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchRoles()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : roles.length === 0 ? (
        <Blank message="Hiện chưa có dữ liệu nào về loại tài khoản" />
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
                    Tên quyền
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Mô tả
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
                    Ngày cập nhật
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  ></th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center ${
                            theme === "dark" ? "text-white" : "text-gray-600"
                          }`}
                        >
                          <Shield size={30} />
                        </div>
                        <div className="ml-4">
                          <div
                            className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                          >
                            {role.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      <div className="max-w-md truncate">
                        {role.description || "..."}
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {formatDate(role.createdAt)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {formatDate(role.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleViewClick(role)}
                        className={
                          theme === "dark"
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-900"
                        }
                        title="Xem chi tiết"
                      >
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {isViewModalOpen && viewingRole && (
        <div className="fixed inset-0 z-99991 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-lg ${theme === "dark" ? "bg-gray-800/95 backdrop-blur-md" : "bg-white/95 backdrop-blur-md"}`}
          >
            <h2
              className={`mb-4 text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Chi tiết loại tài khoản
            </h2>

            {/* Role Name */}
            <div className="mb-4">
              <label
                className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Tên quyền
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={!isAdmin}
                className={`w-full rounded-md border px-3 py-2 ${
                  !isAdmin
                    ? theme === "dark"
                      ? "border-gray-600 bg-gray-900 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                    : theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                placeholder="Nhập tên quyền"
              />
            </div>

            {/* Role Description */}
            <div className="mb-4">
              <label
                className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Mô tả
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={!isAdmin}
                rows={3}
                className={`w-full rounded-md border px-3 py-2 ${
                  !isAdmin
                    ? theme === "dark"
                      ? "border-gray-600 bg-gray-900 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                    : theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                placeholder="Nhập mô tả"
              />
            </div>

            {/* Created At */}
            <div className="mb-4">
              <label
                className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Ngày tạo
              </label>
              <input
                type="text"
                value={formatDate(viewingRole.createdAt)}
                readOnly
                className={`w-full rounded-md border px-3 py-2 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-900 text-gray-400"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                } cursor-not-allowed`}
              />
            </div>

            {/* Updated At */}
            <div className="mb-4">
              <label
                className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Ngày cập nhật
              </label>
              <input
                type="text"
                value={formatDate(viewingRole.updatedAt)}
                readOnly
                className={`w-full rounded-md border px-3 py-2 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-900 text-gray-400"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                } cursor-not-allowed`}
              />
            </div>

            {/* Action Buttons */}
            <div className={`flex ${isAdmin ? "justify-between" : "justify-end"} gap-3`}>
              {isAdmin && (
                <button
                  onClick={handleDeleteRole}
                  disabled={isDeleting || isUpdating}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingRole(null);
                    setEditName("");
                    setEditDescription("");
                  }}
                  disabled={isUpdating || isDeleting}
                  className={`rounded-md px-4 py-2 ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  Hủy
                </button>
                {isAdmin && (
                  <button
                    onClick={handleUpdateSubmit}
                    disabled={isUpdating || isDeleting || !editName.trim()}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
