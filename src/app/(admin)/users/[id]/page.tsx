"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";

const DetailedUserPage = () => {
  return (
    <div>
      <PageBreadcrumb
        pageTitle="Tài khoản"
        subPageTitle="Thông tin tài khoản"
        pageTitleNav="users"
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
};

export default DetailedUserPage;
