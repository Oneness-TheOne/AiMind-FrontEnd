import { NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"

const RESULT_DIR = "C:\\Honey\\Projects\\mid-term\\AiMind-AiModels\\image_to_json\\result"
const TEST_DIR = "C:\\Honey\\Projects\\mid-term\\AiMind-AiModels\\image_to_json\\test"
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"])
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
}

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const rawName = params.filename || ""
  let decodedName = rawName
  try {
    decodedName = decodeURIComponent(rawName)
  } catch {
    return new NextResponse("Invalid filename", { status: 400 })
  }
  const safeName = path.basename(decodedName)
  if (safeName !== decodedName) {
    return new NextResponse("Invalid filename", { status: 400 })
  }

  const ext = path.extname(safeName).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return new NextResponse("Unsupported file type", { status: 400 })
  }

  const url = new URL(request.url)
  const dirParam = (url.searchParams.get("dir") || "").toLowerCase()
  const baseDir = dirParam === "test" ? TEST_DIR : RESULT_DIR
  const filePath = path.join(baseDir, safeName)

  try {
    const file = await readFile(filePath)
    return new NextResponse(file, {
      headers: {
        "Content-Type": CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return new NextResponse("File not found", { status: 404 })
  }
}
