import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Chi tiết hình ảnh | MySpace Admin`,
    description: `Thông tin chi tiết hình ảnh`,
  };
}

export default function ImageDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
