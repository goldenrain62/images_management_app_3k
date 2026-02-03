"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import CreateUserButton from "@/components/users/CreateUserButton";
import Badge from "@/components/ui/badge/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Blank from "@/components/common/Blank";

interface UserProps {
  id: number;
  name: string;
  email: string;
  gender: boolean | null;
  role: string;
  status: "Active" | "Inactive";
  images: number;
}

const UsersPage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tải danh sách tài khoản");
      }

      const data = await response.json();
      setUsers(data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // When a new user is created
  const onUserCreated = () => {
    fetchUsers();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Tài khoản" pageTitleNav="users" />

      <div className="mb-5 flex justify-end">
        <CreateUserButton onSuccess={onUserCreated} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchUsers()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <Blank message="Hiện chưa có tài khoản nào" />
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
                    Tài khoản
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Loại tài khoản
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Trạng thái
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Ảnh đã tải lên
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
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            user.role === "Admin"
                              ? "/images/user/3khome-user-default.png"
                              : user.gender === false
                                ? "/images/user/user-02.jpg"
                                : "/images/user/user-04.jpg"
                          }
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div
                            onClick={() => router.push(`/users/${user.id}`)}
                            className={`cursor-pointer text-sm font-medium hover:underline ${theme === "dark" ? "text-white hover:text-blue-400" : "text-gray-900 hover:text-blue-600"}`}
                          >
                            {user.name}
                          </div>
                          <div
                            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        color={user.status === "Active" ? "success" : "error"}
                        size="sm"
                      >
                        {user.status === "Active" ? "Hoạt động" : "Ngưng"}
                      </Badge>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm whitespace-nowrap ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {user.images}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <Link
                        href={`/users/${user.id}`}
                        className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} mr-3 inline-block`}
                      >
                        <Eye />
                      </Link>
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

export default UsersPage;
