import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - Create a new role
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    // Only Admin can create roles
    if (session.user.role !== "Admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền tạo loại tài khoản." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên quyền không được để trống" },
        { status: 400 }
      );
    }

    // Check if role name already exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name.trim()))
      .limit(1);

    if (existingRole.length > 0) {
      return NextResponse.json(
        { error: "Tên quyền đã tồn tại" },
        { status: 400 }
      );
    }

    // Create role
    const result = await db.insert(roles).values({
      name: name.trim(),
      description: description?.trim() || null,
    });

    // Fetch the created role
    const newRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, result[0].insertId))
      .limit(1);

    return NextResponse.json(
      {
        message: "Tạo loại tài khoản thành công",
        role: newRole[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo loại tài khoản. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

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

    const isAdmin = session.user.role === "Admin";
    const allRoles = await db.select().from(roles);

    return NextResponse.json(
      {
        data: allRoles,
        permissions: {
          canCreate: isAdmin,
          canEdit: isAdmin,
          canDelete: isAdmin,
        },
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
