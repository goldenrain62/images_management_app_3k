import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categories, images, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { slugify } from "@/lib/utils";

// Generate unique image ID
async function generateImageId(categoryId: string): Promise<string> {
  const result = await db
    .select()
    .from(images)
    .where(eq(images.categoryId, categoryId));

  const count = result.length;
  return `${categoryId}_${count.toString().padStart(6, "0")}`;
}

// GET - Get all images for a category (Public - No auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: categoryId } = await params;

    // Check if category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại sàn" },
        { status: 404 },
      );
    }

    // Fetch all images for this category
    const categoryImages = await db
      .select({
        id: images.id,
        name: images.name,
        size: images.size,
        productUrl: images.productUrl,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
        createdAt: images.uploadedAt,
        uploaderName: users.name,
      })
      .from(images)
      .leftJoin(users, eq(images.userId, users.id))
      .where(eq(images.categoryId, categoryId));

    // Format response
    const formattedImages = categoryImages.map((img) => ({
      id: img.id,
      name: img.name,
      size: img.size,
      productUrl: img.productUrl,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
      createdAt: img.createdAt,
      uploader: { name: img.uploaderName },
    }));

    return NextResponse.json(
      {
        categoryName: category[0].name,
        images: formattedImages,
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

// POST - Upload new images to a category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 },
      );
    }

    const { id: categoryId } = await params;

    // Check if category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy loại sàn" },
        { status: 404 },
      );
    }

    // Check permissions: Admin can upload to any category, users can only upload to their own
    const currentUserId = parseInt(session.user.id);
    const isAdmin = session.user.role === "Admin";
    const isCategoryOwner = category[0].userId === currentUserId;

    if (!isAdmin && !isCategoryOwner) {
      return NextResponse.json(
        { error: "Bạn không có quyền tải ảnh lên loại sàn này" },
        { status: 403 },
      );
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Không có file nào được chọn" },
        { status: 400 },
      );
    }

    // Get slugified category name for folder
    const categorySlug = slugify(category[0].name);

    // Create upload directory if it doesn't exist
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "categories",
      categorySlug,
    );
    const thumbnailDir = join(
      process.cwd(),
      "public",
      "uploads",
      "thumbnails",
      categorySlug,
    );

    // Ensure directories exist
    await mkdir(uploadDir, { recursive: true });
    await mkdir(thumbnailDir, { recursive: true });

    // Process each file
    const uploadedImages = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          continue;
        }

        // Generate unique ID for this image
        const imageId = await generateImageId(categoryId);
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop() || "jpg";
        const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const fileName = `${timestamp}_${originalNameWithoutExt}.${fileExtension}`;
        const thumbnailName = `${timestamp}_${originalNameWithoutExt}_300x300.${fileExtension}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save original image
        const imagePath = join(uploadDir, fileName);
        await writeFile(imagePath, buffer);

        // Create thumbnail using sharp
        const thumbnailPath = join(thumbnailDir, thumbnailName);
        await sharp(buffer)
          .resize(300, 300, {
            fit: "cover",
            position: "center",
          })
          .toFile(thumbnailPath);

        // Prepare URLs
        const imageUrl = `/uploads/categories/${categorySlug}/${fileName}`;
        const thumbnailUrl = `/uploads/thumbnails/${categorySlug}/${thumbnailName}`;

        // Save to database
        await db.insert(images).values({
          id: imageId,
          name: file.name,
          size: file.size,
          productUrl: null,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl,
          categoryId: categoryId,
          userId: parseInt(session.user.id),
        });

        uploadedImages.push({
          id: imageId,
          name: file.name,
          size: file.size,
          imageUrl,
          thumbnailUrl,
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        continue;
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: "Không có ảnh nào được tải lên thành công" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: `Tải lên thành công ${uploadedImages.length} ảnh`,
        images: uploadedImages,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải ảnh lên." },
      { status: 500 },
    );
  }
}
