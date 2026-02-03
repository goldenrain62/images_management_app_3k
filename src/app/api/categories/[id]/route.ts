import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categories, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get a specific category with details
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

    // Fetch category with creator info
    const category = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        userId: categories.userId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        creatorName: users.name,
        creatorEmail: users.email,
      })
      .from(categories)
      .leftJoin(users, eq(categories.userId, users.id))
      .where(eq(categories.id, id))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại sàn" },
        { status: 404 }
      );
    }

    // All authenticated users can view categories
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === "Admin";
    const isOwner = category[0].userId === currentUserId;

    return NextResponse.json(
      {
        id: category[0].id,
        name: category[0].name,
        description: category[0].description,
        creator: {
          name: category[0].creatorName,
          email: category[0].creatorEmail,
        },
        createdAt: category[0].createdAt,
        updatedAt: category[0].updatedAt,
        isOwner,
        canEdit: isAdmin || isOwner,
        canDelete: isAdmin || isOwner,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy thông tin loại sàn." },
      { status: 500 }
    );
  }
}

// PUT - Update a category
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

    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên loại sàn không được để trống" },
        { status: 400 }
      );
    }

    // Check if category exists and user owns it
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại sàn" },
        { status: 404 }
      );
    }

    // Check permissions: Admin can edit any, users can only edit their own
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === "Admin";
    const isOwner = existingCategory[0].userId === currentUserId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa loại sàn này" },
        { status: 403 }
      );
    }

    // Check if new name already exists (case-insensitive comparison)
    // Only check for duplicates if the name actually changed (ignoring case)
    if (name.trim().toLowerCase() !== existingCategory[0].name.toLowerCase()) {
      const duplicateName = await db
        .select()
        .from(categories)
        .where(eq(categories.name, name.trim()))
        .limit(1);

      if (duplicateName.length > 0) {
        return NextResponse.json(
          { error: "Tên loại sàn đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Update category
    await db
      .update(categories)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(categories.id, id));

    // Fetch updated category
    const updatedCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return NextResponse.json(
      {
        message: "Cập nhật loại sàn thành công",
        category: updatedCategory[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật loại sàn." },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
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

    const { id } = await params;

    // Check if category exists and user owns it
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại sàn" },
        { status: 404 }
      );
    }

    // Check permissions: Admin can delete any, users can only delete their own
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === "Admin";
    const isOwner = existingCategory[0].userId === currentUserId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa loại sàn này" },
        { status: 403 }
      );
    }

    // Delete category (images will be handled by database cascade or separate cleanup)
    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json(
      { message: "Xóa loại sàn thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa loại sàn." },
      { status: 500 }
    );
  }
}
