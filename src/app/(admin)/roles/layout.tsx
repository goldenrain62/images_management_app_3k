import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phân quyền | MySpace Admin',
  description: 'Quản lý vai trò và phân quyền người dùng',
};

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
