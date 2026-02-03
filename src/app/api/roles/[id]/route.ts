import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get a specific role
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

    // Fetch role
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, parseInt(id)))
      .limit(1);

    if (role.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại tài khoản" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "Admin";

    return NextResponse.json(
      {
        ...role[0],
        permissions: {
          canEdit: isAdmin,
          canDelete: isAdmin,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy thông tin loại tài khoản." },
      { status: 500 }
    );
  }
}

// PUT - Update a role
export async function PUT(
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

    // Only Admin can update roles
    if (session.user.role !== "Admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền cập nhật loại tài khoản." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên quyền không được để trống" },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, parseInt(id)))
      .limit(1);

    if (existingRole.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại tài khoản" },
        { status: 404 }
      );
    }

    // Check if new name already exists (case-insensitive comparison)
    // Only check for duplicates if the name actually changed (ignoring case)
    if (name.trim().toLowerCase() !== existingRole[0].name.toLowerCase()) {
      const duplicateName = await db
        .select()
        .from(roles)
        .where(eq(roles.name, name.trim()))
        .limit(1);

      if (duplicateName.length > 0) {
        return NextResponse.json(
          { error: "Tên quyền đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Update role
    await db
      .update(roles)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(roles.id, parseInt(id)));

    // Fetch updated role
    const updatedRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, parseInt(id)))
      .limit(1);

    return NextResponse.json(
      {
        message: "Cập nhật loại tài khoản thành công",
        role: updatedRole[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật loại tài khoản." },
      { status: 500 }
    );
  }
}

// DELETE - Delete a role
export async function DELETE(
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

    // Only Admin can delete roles
    if (session.user.role !== "Admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền xóa loại tài khoản." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if role exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, parseInt(id)))
      .limit(1);

    if (existingRole.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại tài khoản" },
        { status: 404 }
      );
    }

    // Delete role
    await db.delete(roles).where(eq(roles.id, parseInt(id)));

    return NextResponse.json(
      { message: "Xóa loại tài khoản thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa loại tài khoản." },
      { status: 500 }
    );
  }
}
