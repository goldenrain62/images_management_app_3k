import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categories, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

// DELETE - Delete a specific image
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 }
      );
    }

    const { id: categoryId, imageId } = await params;

    // Check if image exists
    const image = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (image.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy ảnh" },
        { status: 404 }
      );
    }

    // Check if image belongs to the specified category
    if (image[0].categoryId !== categoryId) {
      return NextResponse.json(
        { error: "Ảnh không thuộc loại sàn này" },
        { status: 400 }
      );
    }

    // Check if user owns the image
    if (image[0].userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa ảnh này" },
        { status: 403 }
      );
    }

    // Delete files from filesystem
    try {
      if (image[0].imageUrl) {
        const imagePath = join(process.cwd(), "public", image[0].imageUrl);
        await unlink(imagePath).catch(() => {});
      }

      if (image[0].thumbnailUrl) {
        const thumbnailPath = join(
          process.cwd(),
          "public",
          image[0].thumbnailUrl
        );
        await unlink(thumbnailPath).catch(() => {});
      }
    } catch (fileError) {
      console.error("Error deleting files:", fileError);
      // Continue even if file deletion fails
    }

    // Delete from database
    await db.delete(images).where(eq(images.id, imageId));

    return NextResponse.json(
      { message: "Xóa ảnh thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa ảnh." },
      { status: 500 }
    );
  }
}
