import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categories, users, images } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Generate a random 6-character ID for category
async function generateCategoryId(): Promise<string> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories);

  const count = result[0]?.count || 0;

  // Generate ID as count + 1, padded to 6 digits
  const categoryId = (count).toString().padStart(6, "0");
  return categoryId;
}

// POST - Create a new category
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, description } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Tên loại sàn không được để trống" },
        { status: 400 },
      );
    }

    // Check if category name already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name.trim()))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: "Tên loại sàn đã tồn tại" },
        { status: 400 },
      );
    }

    // Generate unique ID based on category count
    let categoryId = await generateCategoryId();
    let attempts = 0;
    const maxAttempts = 100;

    // Ensure the ID is unique (in case categories were deleted)
    while (attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (existing.length === 0) break;

      // If ID exists, increment and try again
      const currentNum = parseInt(categoryId);
      categoryId = (currentNum + 1).toString().padStart(6, "0");
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: "Không thể tạo ID duy nhất. Vui lòng thử lại." },
        { status: 500 },
      );
    }

    // Create category
    await db.insert(categories).values({
      id: categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      userId: parseInt(session.user.id),
    });

    // Fetch the created category
    const newCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    return NextResponse.json(
      {
        message: "Tạo loại sàn thành công",
        category: newCategory[0],
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo loại sàn. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// GET - Fetch all categories with creator information
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 },
      );
    }

    // Fetch all categories for the authenticated user with creator info
    const userCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        userId: categories.userId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        creatorName: users.name,
        creatorEmail: users.email,
        imagesQty: sql<number>`COALESCE(COUNT(DISTINCT ${images.id}), 0)`,
        totalSize: sql<number>`COALESCE(SUM(${images.size}), 0)`,
      })
      .from(categories)
      .leftJoin(users, eq(categories.userId, users.id))
      .leftJoin(images, eq(categories.id, images.categoryId))
      .where(eq(categories.userId, parseInt(session.user.id)))
      .groupBy(
        categories.id,
        categories.name,
        categories.description,
        categories.userId,
        categories.createdAt,
        categories.updatedAt,
        users.name,
        users.email,
      );

    // Transform data to match the expected format
    const formattedCategories = userCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      creator: {
        name: cat.creatorName,
        email: cat.creatorEmail,
      },
      imagesQty: Number(cat.imagesQty) || 0,
      totalSize: Number(cat.totalSize) || 0,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return NextResponse.json(
      {
        data: formattedCategories,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy danh sách loại sàn." },
      { status: 500 },
    );
  }
}
