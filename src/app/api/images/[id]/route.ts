import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { images, users, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

// GET - Get a specific image with details
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

    // Fetch image with uploader and category info
    const image = await db
      .select({
        id: images.id,
        name: images.name,
        size: images.size,
        productUrl: images.productUrl,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
        uploadedAt: images.uploadedAt,
        uploaderName: users.name,
        uploaderEmail: users.email,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(images)
      .leftJoin(users, eq(images.userId, users.id))
      .leftJoin(categories, eq(images.categoryId, categories.id))
      .where(eq(images.id, id))
      .limit(1);

    if (image.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy ảnh" },
        { status: 404 }
      );
    }

    // Check if user owns this image
    const imageData = await db
      .select({ userId: images.userId })
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (imageData[0].userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập ảnh này" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        id: image[0].id,
        name: image[0].name,
        size: image[0].size,
        productUrl: image[0].productUrl,
        imageUrl: image[0].imageUrl,
        thumbnailUrl: image[0].thumbnailUrl,
        uploadedAt: image[0].uploadedAt,
        uploader: {
          name: image[0].uploaderName,
          email: image[0].uploaderEmail,
        },
        category: {
          id: image[0].categoryId,
          name: image[0].categoryName,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy thông tin ảnh." },
      { status: 500 }
    );
  }
}

// PUT - Update an image
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
    const { name, productUrl, categoryId } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên ảnh không được để trống" },
        { status: 400 }
      );
    }

    // Check if image exists and user owns it
    const existingImage = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (existingImage.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy ảnh" },
        { status: 404 }
      );
    }

    if (existingImage[0].userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa ảnh này" },
        { status: 403 }
      );
    }

    // Check if productUrl already exists (if provided and changed)
    if (productUrl && productUrl.trim() && productUrl.trim() !== existingImage[0].productUrl) {
      const duplicateUrl = await db
        .select()
        .from(images)
        .where(eq(images.productUrl, productUrl.trim()))
        .limit(1);

      if (duplicateUrl.length > 0) {
        return NextResponse.json(
          { error: "URL sản phẩm đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Verify category exists
    if (categoryId) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json(
          { error: "Loại sàn không tồn tại" },
          { status: 400 }
        );
      }
    }

    // Update image
    await db
      .update(images)
      .set({
        name: name.trim(),
        productUrl: productUrl?.trim() || null,
        categoryId: categoryId || existingImage[0].categoryId,
      })
      .where(eq(images.id, id));

    // Fetch updated image
    const updatedImage = await db
      .select({
        id: images.id,
        name: images.name,
        size: images.size,
        productUrl: images.productUrl,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
        uploadedAt: images.uploadedAt,
        uploaderName: users.name,
        uploaderEmail: users.email,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(images)
      .leftJoin(users, eq(images.userId, users.id))
      .leftJoin(categories, eq(images.categoryId, categories.id))
      .where(eq(images.id, id))
      .limit(1);

    return NextResponse.json(
      {
        message: "Cập nhật ảnh thành công",
        image: {
          id: updatedImage[0].id,
          name: updatedImage[0].name,
          size: updatedImage[0].size,
          productUrl: updatedImage[0].productUrl,
          imageUrl: updatedImage[0].imageUrl,
          thumbnailUrl: updatedImage[0].thumbnailUrl,
          uploadedAt: updatedImage[0].uploadedAt,
          uploader: {
            name: updatedImage[0].uploaderName,
            email: updatedImage[0].uploaderEmail,
          },
          category: {
            id: updatedImage[0].categoryId,
            name: updatedImage[0].categoryName,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật ảnh." },
      { status: 500 }
    );
  }
}

// DELETE - Delete an image
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

    // Check if image exists
    const image = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (image.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy ảnh" },
        { status: 404 }
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
    await db.delete(images).where(eq(images.id, id));

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
