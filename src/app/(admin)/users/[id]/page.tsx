"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import DeleteUserButton from "@/components/users/DeleteUserButton";
import ResetPasswordButton from "@/components/users/ResetPasswordButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface User {
  id: number;
  name: string;
  email: string;
  gender: boolean | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  facebookUrl: string | null;
  zaloUrl: string | null;
  tiktokUrl: string | null;
  instagramUrl: string | null;
  address: string | null;
  ward: string | null;
  province: string | null;
  title: string | null;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: string;
}

const DetailedUserPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  // Fetch user data
  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tải thông tin người dùng");
      }

      const data = await response.json();
      setUser(data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  // Permission logic
  const currentUserRole = session?.user?.role;
  const currentUserId = session?.user?.id;
  const isAdmin = currentUserRole === "Admin";
  const isViewingOwnProfile = currentUserId === userId;
  const isViewingAdminProfile = user?.role === "Admin";

  // Determine if DeleteUserButton should be shown
  // Show if: current user is Admin AND viewing another user's profile AND that user is not Admin
  const showDeleteButton = isAdmin && !isViewingOwnProfile && !isViewingAdminProfile;

  // Determine if toggle should be changeable
  // Changeable if: Admin viewing another non-admin user
  const canChangeStatus = isAdmin && !isViewingOwnProfile && !isViewingAdminProfile;

  // Determine if user can edit this profile
  // Can edit if: Admin (can edit any account) OR viewing own profile
  const canEdit = isAdmin || isViewingOwnProfile;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div>
        <PageBreadcrumb
          pageTitle="Tài khoản"
          subPageTitle="Thông tin tài khoản"
          pageTitleNav="users"
        />
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">
            {error || "Không tìm thấy người dùng"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Tài khoản"
        subPageTitle="Thông tin tài khoản"
        pageTitleNav="users"
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard user={user} canChangeStatus={canChangeStatus} canEdit={canEdit} onUpdate={fetchUser} />
          <UserAddressCard user={user} canEdit={canEdit} onUpdate={fetchUser} />

          {showDeleteButton && (
            <div className="flex justify-end gap-3">
              <ResetPasswordButton userId={userId} />
              <DeleteUserButton userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedUserPage;
