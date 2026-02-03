import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// POST - Reset user password
export async function POST(
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

    // Only Admin can reset passwords
    if (session.user.role !== "Admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền reset mật khẩu." },
        { status: 403 }
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

    // Check if user exists and get their role
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleName: roles.name,
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

    // Prevent resetting Admin passwords
    if (user.roleName === "Admin") {
      return NextResponse.json(
        { error: "Không thể reset mật khẩu của tài khoản Admin." },
        { status: 403 }
      );
    }

    // Prevent resetting own password
    const currentUserId = parseInt(session.user.id);
    if (currentUserId === userId) {
      return NextResponse.json(
        { error: "Không thể reset mật khẩu của chính mình." },
        { status: 403 }
      );
    }

    // Hash the new password
    const newPassword = "@0123456789@";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    return NextResponse.json(
      {
        message: "Reset mật khẩu thành công",
        data: {
          newPassword: newPassword,
          userName: user.name,
          userEmail: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi reset mật khẩu." },
      { status: 500 }
    );
  }
}
