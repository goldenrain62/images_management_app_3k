import { redirect } from "next/navigation";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trang chủ | MySpace Admin',
  description: 'Hệ thống quản lý MySpace Admin',
};

export default function Home() {
  redirect("/images");
}
