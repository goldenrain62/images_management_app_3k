"use client";

import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import Switch from "../form/switch/Switch";
import CalendarDatePicker from "../form/CalendarDatePicker";
import Badge from "../ui/badge/Badge";

interface User {
  id: number;
  name: string;
  email: string;
  gender: boolean | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  facebookUrl: string | null;
  zaloUrl: string | null;
  tiktokUrl: string | null;
  instagramUrl: string | null;
  title: string | null;
  role: string;
  isActive: boolean;
}

interface UserInfoCardProps {
  user: User;
  canChangeStatus: boolean;
  canEdit: boolean;
  onUpdate?: () => void;
}

export default function UserInfoCard({ user, canChangeStatus, canEdit, onUpdate }: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();

  // Form state
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth || "",
    phoneNumber: user.phoneNumber || "",
    facebookUrl: user.facebookUrl || "",
    zaloUrl: user.zaloUrl || "",
    tiktokUrl: user.tiktokUrl || "",
    instagramUrl: user.instagramUrl || "",
    title: user.title || "",
    isActive: user.isActive,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth || "",
        phoneNumber: user.phoneNumber || "",
        facebookUrl: user.facebookUrl || "",
        zaloUrl: user.zaloUrl || "",
        tiktokUrl: user.tiktokUrl || "",
        instagramUrl: user.instagramUrl || "",
        title: user.title || "",
        isActive: user.isActive,
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể cập nhật thông tin");
      }

      setSuccess(true);
      setTimeout(() => {
        closeModal();
        if (onUpdate) {
          onUpdate();
        }
      }, 1000);
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display (DD/MM/YYYY) - Vietnam format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "...";
    try {
      // Convert to Date object and extract components
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "...";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      return "...";
    }
  };

  // Get gender display
  const getGenderDisplay = (gender: boolean | null) => {
    if (gender === null) return "...";
    return gender ? "Nữ" : "Nam";
  };

  // Get gender value for select
  const getGenderValue = (gender: boolean | null) => {
    if (gender === null) return "";
    return gender ? "female" : "male";
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
            Thông Tin Cá Nhân
          </h4>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Họ Tên
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Ngày Sinh
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(user.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Giới Tính
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getGenderDisplay(user.gender)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                SĐT
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.phoneNumber || "..."}
              </p>
            </div>

            <div></div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Loại tài khoản
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    user.role === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role}
                </span>
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Trạng Thái
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <Badge color={user.isActive ? "success" : "error"} size="sm">
                  {user.isActive ? "Hoạt động" : "Ngưng"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={openModal}
            className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Sửa
          </button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Cập Nhật Thông Tin Cá Nhân
            </h4>
            <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
              Cập nhật thông tin để làm mới hồ sơ.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-400">
                Cập nhật thành công!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  Mạng Xã Hội
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, facebookUrl: e.target.value })
                      }
                      placeholder="https://www.facebook.com/username"
                    />
                  </div>

                  <div>
                    <Label>Zalo</Label>
                    <Input
                      type="text"
                      value={formData.zaloUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, zaloUrl: e.target.value })
                      }
                      placeholder="https://zalo.me/username"
                    />
                  </div>

                  <div>
                    <Label>Tiktok</Label>
                    <Input
                      type="text"
                      value={formData.tiktokUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, tiktokUrl: e.target.value })
                      }
                      placeholder="https://www.tiktok.com/@username"
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input
                      type="text"
                      value={formData.instagramUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, instagramUrl: e.target.value })
                      }
                      placeholder="https://www.instagram.com/username"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  Thông Tin Cá Nhân
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Họ Tên</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Ngày Sinh</Label>
                    <CalendarDatePicker
                      defaultValue={formData.dateOfBirth}
                      placeholder="Chọn ngày sinh"
                      onChange={(date) =>
                        setFormData({ ...formData, dateOfBirth: date })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Giới Tính</Label>
                    <Select
                      options={[
                        { value: "male", label: "Nam" },
                        { value: "female", label: "Nữ" },
                      ]}
                      placeholder="Chọn giới tính"
                      defaultValue={getGenderValue(formData.gender)}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          gender: value === "female" ? true : false,
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>SĐT</Label>
                    <Input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Trạng Thái</Label>
                    <div className="pt-2">
                      <Switch
                        label="Kích hoạt"
                        defaultChecked={formData.isActive}
                        color="green"
                        disabled={!canChangeStatus}
                        onChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Chức Vụ</Label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
