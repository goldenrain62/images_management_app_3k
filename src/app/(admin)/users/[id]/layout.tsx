import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // You can fetch user data here to customize the title
  // const user = await fetchUser(id);

  return {
    title: `Chi tiết tài khoản | MySpace Admin`,
    description: `Thông tin chi tiết tài khoản`,
  };
}

export default function UserDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
