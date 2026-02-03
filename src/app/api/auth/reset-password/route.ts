import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// POST - Reset user password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, oldPassword, newPassword } = body;

    // Validate required fields
    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Find user by email
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        name: users.name,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "Email không tồn tại trong hệ thống" },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Tài khoản đã bị vô hiệu hóa" },
        { status: 403 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: "Mật khẩu cũ không đúng" },
        { status: 401 }
      );
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải khác mật khẩu cũ" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      {
        message: "Đặt lại mật khẩu thành công",
        data: {
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đặt lại mật khẩu" },
      { status: 500 }
    );
  }
}
