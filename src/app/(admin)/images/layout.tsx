import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hình ảnh | MySpace Admin',
  description: 'Quản lý thư viện hình ảnh',
};

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
