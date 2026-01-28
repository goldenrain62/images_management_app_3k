import { NextResponse, NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { slugify } from "@/lib/utils";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;
    const customName = formData.get("name") as string;

    // 1. Fetch Category to get its name for the folder path
    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    const categorySlug = slugify(categoryDoc.name);

    // 2. Define Paths
    const catRelDir = `/uploads/categories/${categorySlug}`;
    const thumbRelDir = `/uploads/thumbnails/${categorySlug}`;
    const catAbsDir = path.join(process.cwd(), "public", catRelDir);
    const thumbAbsDir = path.join(process.cwd(), "public", thumbRelDir);

    // 3. Create Folders
    if (!fs.existsSync(catAbsDir)) await mkdir(catAbsDir, { recursive: true });
    if (!fs.existsSync(thumbAbsDir)) await mkdir(thumbAbsDir, { recursive: true });

    // 4. Get File Size (in bytes)
    const fileSize = file.size;

    // 4. Prepare Filenames
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/\s+/g, "_");
    const nameWithoutExt = path.parse(safeFileName).name;
    const ext = path.parse(safeFileName).ext;

    // Original: 1738000000-file.jpg
    const finalFileName = `${timestamp}-${safeFileName}`; 

    // Thumbnail: 1738000000-file-300x300.jpg
    const thumbFileName = `${timestamp}-${nameWithoutExt}-300x300${ext}`;
    

    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Save Original
    await writeFile(path.join(catAbsDir, finalFileName), buffer);

    // 6. Save Thumbnail (300x300 Square)
    await sharp(buffer)
      .resize(300, 300, { fit: "cover" })
      .toFormat("jpeg")
      .toFile(path.join(thumbAbsDir, thumbFileName));

    // 7. Save to MongoDB
    const newImage = await Image.create({
      name: customName || file.name,
      size: fileSize,
      imageUrl: `${catRelDir}/${finalFileName}`,
      thumbnailUrl: `${thumbRelDir}/${thumbFileName}`,
      category: categoryId,
      uploader: (session.user as any).id,
    });

    return NextResponse.json({ success: true, data: newImage });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) return NextResponse.json({ error: "Filename/URL already exists" }, { status: 400 });
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
