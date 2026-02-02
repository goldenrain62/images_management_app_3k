import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, roles, images } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// GET - Fetch all users with image counts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    // Fetch all users with role and image count
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        gender: users.gender,
        roleId: users.roleId,
        roleName: roles.name,
        imageCount: sql<number>`COALESCE(COUNT(DISTINCT ${images.id}), 0)`,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(images, eq(users.id, images.userId))
      .groupBy(users.id, users.name, users.email, users.isActive, users.gender, users.roleId, roles.name);

    // Format response
    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      role: user.roleName,
      status: user.isActive ? "Active" : "Inactive",
      images: Number(user.imageCount) || 0,
    }));

    return NextResponse.json(
      {
        data: formattedUsers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy danh sách tài khoản." },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, password, gender, roleId, isActive } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên người dùng không được để trống" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email không được để trống" },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: "Mật khẩu không được để trống" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Create user
    await db.insert(users).values({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      gender: gender !== undefined ? gender : null,
      roleId: roleId,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      {
        message: "Tạo tài khoản thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo tài khoản." },
      { status: 500 }
    );
  }
}
