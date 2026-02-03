import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý tài khoản | MySpace Admin',
  description: 'Quản lý người dùng và tài khoản trong hệ thống',
  // You can also customize icons per page if needed:
  // icons: {
  //   icon: '/users-icon.png',
  // },
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
