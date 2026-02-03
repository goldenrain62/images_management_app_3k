import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loại sàn gỗ | MySpace Admin',
  description: 'Quản lý danh mục loại sàn gỗ',
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
