import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const works = await db.worksDetail.findMany({
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        AwardofContract: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(works);
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json(
      { error: "Failed to fetch works" },
      { status: 500 }
    );
  }
}
