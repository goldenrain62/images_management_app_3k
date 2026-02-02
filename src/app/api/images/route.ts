import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { images, users, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch all images for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 },
      );
    }

    // Fetch all images for the authenticated user with uploader and category info
    const userImages = await db
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
      .where(eq(images.userId, parseInt(session.user.id)));

    // Format response
    const formattedImages = userImages.map((img) => ({
      id: img.id,
      name: img.name,
      size: img.size,
      productUrl: img.productUrl,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
      uploadedAt: img.uploadedAt,
      uploader: {
        name: img.uploaderName,
        email: img.uploaderEmail,
      },
      category: {
        id: img.categoryId,
        name: img.categoryName,
      },
    }));

    return NextResponse.json(
      {
        data: formattedImages,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy danh sách ảnh." },
      { status: 500 },
    );
  }
}
