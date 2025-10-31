import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tpl = await db.tenderTermTemplate.findUnique({ where: { id } });
    if (!tpl) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(tpl);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, content, isActive } = body as {
      name?: string;
      description?: string | null;
      content?: string;
      isActive?: boolean;
    };

    if (!name || !content) {
      return NextResponse.json(
        { message: "Name and content are required" },
        { status: 400 }
      );
    }

    const updated = await db.tenderTermTemplate.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        content,
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await db.tenderTermTemplate.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error partially updating template:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.tenderTermTemplate.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


