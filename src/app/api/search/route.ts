import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categories, images } from "@/db/schema";
import { like, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Vui lòng đăng nhập." },
        { status: 401 },
      );
    }

    const q = req.nextUrl.searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ categories: [], images: [] });
    }

    const pattern = `%${q}%`;

    const [categoryResults, imageResults] = await Promise.all([
      db
        .select({
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(like(categories.name, pattern))
        .limit(5),

      db
        .select({
          id: images.id,
          name: images.name,
          thumbnailUrl: images.thumbnailUrl,
          categoryName: categories.name,
        })
        .from(images)
        .leftJoin(categories, eq(images.categoryId, categories.id))
        .where(like(images.name, pattern))
        .limit(5),
    ]);

    return NextResponse.json({
      categories: categoryResults,
      images: imageResults,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tìm kiếm." },
      { status: 500 },
    );
  }
}
