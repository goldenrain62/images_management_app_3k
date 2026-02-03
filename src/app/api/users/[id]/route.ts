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
        phoneNumber: users.phoneNumber,
        avatarUrl: users.avatarUrl,
        facebookUrl: users.facebookUrl,
        zaloUrl: users.zaloUrl,
        tiktokUrl: users.tiktokUrl,
        instagramUrl: users.instagramUrl,
        address: users.address,
        ward: users.ward,
        province: users.province,
        title: users.title,
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
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          facebookUrl: user.facebookUrl,
          zaloUrl: user.zaloUrl,
          tiktokUrl: user.tiktokUrl,
          instagramUrl: user.instagramUrl,
          address: user.address,
          ward: user.ward,
          province: user.province,
          title: user.title,
          role: user.roleName,
          status: user.isActive ? "Active" : "Inactive",
          isActive: user.isActive,
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

// PATCH - Update user information
export async function PATCH(
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

    // Permission check: Only Admin can update any account, others can only update their own
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === "Admin";

    if (!isAdmin && currentUserId !== userId) {
      return NextResponse.json(
        { error: "Bạn không có quyền cập nhật tài khoản này." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      gender,
      dateOfBirth,
      phoneNumber,
      facebookUrl,
      zaloUrl,
      tiktokUrl,
      instagramUrl,
      address,
      ward,
      province,
      title,
      isActive,
    } = body;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (zaloUrl !== undefined) updateData.zaloUrl = zaloUrl;
    if (tiktokUrl !== undefined) updateData.tiktokUrl = tiktokUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (address !== undefined) updateData.address = address;
    if (ward !== undefined) updateData.ward = ward;
    if (province !== undefined) updateData.province = province;
    if (title !== undefined) updateData.title = title;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    await db.update(users).set(updateData).where(eq(users.id, userId));

    return NextResponse.json(
      {
        message: "Cập nhật thông tin thành công",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật thông tin người dùng." },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
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

    // Only Admin can delete users
    const isAdmin = session.user.role === "Admin";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa tài khoản." },
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
    const existingUser = await db
      .select({
        id: users.id,
        roleId: users.roleId,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Prevent deleting Admin accounts
    if (existingUser[0].roleName === "Admin") {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản Admin" },
        { status: 403 }
      );
    }

    // Prevent deleting own account
    const currentUserId = parseInt(session.user.id);
    if (currentUserId === userId) {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản của chính mình" },
        { status: 403 }
      );
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json(
      {
        message: "Xóa tài khoản thành công",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa tài khoản." },
      { status: 500 }
    );
  }
}
