import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Chi tiết loại sàn | MySpace Admin`,
    description: `Thông tin chi tiết loại sàn gỗ`,
  };
}

export default function CategoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
