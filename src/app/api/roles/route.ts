import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { roles } from "@/db/schema";

// GET - Fetch all roles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    const allRoles = await db.select().from(roles);

    return NextResponse.json(
      {
        data: allRoles,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy danh sách quyền." },
      { status: 500 }
    );
  }
}
