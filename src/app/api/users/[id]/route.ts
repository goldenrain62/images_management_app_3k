import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch a single user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    // Fetch user with role
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        gender: users.gender,
        dateOfBirth: users.dateOfBirth,
        isActive: users.isActive,
        roleId: users.roleId,
        roleName: roles.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const user = userResult[0];

    return NextResponse.json(
      {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          role: user.roleName,
          status: user.isActive ? "Active" : "Inactive",
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy thông tin người dùng." },
      { status: 500 }
    );
  }
}
