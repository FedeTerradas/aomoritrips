import { NextResponse } from "next/server";
import { executeTravelAgent } from "@/lib/agent/orchestrator";
import { prisma } from "@/lib/prisma";
import { GroupProfile } from "@/lib/agent/types";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const save = searchParams.get("save") === "true";

    const body = await req.json();
    const { sessionToken, groupProfile } = body as {
      sessionToken: string;
      groupProfile: GroupProfile;
    };

    if (!sessionToken || !groupProfile) {
      return NextResponse.json(
        { success: false, error: "Missing sessionToken or groupProfile" },
        { status: 400 }
      );
    }

    const result = await executeTravelAgent({
      sessionToken,
      userMessage: "itinerary",
      groupProfile,
    });

    if (!result.draftItinerary) {
      return NextResponse.json(
        { success: false, error: "No itinerary draft returned" },
        { status: 500 }
      );
    }

    let customPackId: string | undefined;

    if (save) {
      const customPack = await prisma.customPack.create({
        data: {
          sessionToken,
          title: result.draftItinerary.title,
          groupSize: groupProfile.size,
          groupType: groupProfile.type,
          durationDays: groupProfile.durationDays,
          season: groupProfile.season,
          itineraryJson: JSON.stringify(result.draftItinerary.days),
          budgetPerPersonUsd:
            result.draftItinerary.budgetBreakdown.totalPerPersonUsd,
          totalBudgetUsd: result.draftItinerary.budgetBreakdown.totalGroupUsd,
          status: "draft",
        },
      });
      customPackId = customPack.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        draftItinerary: result.draftItinerary,
        agentReply: result.reply,
        customPackId,
      },
    });
  } catch (error: any) {
    console.error("Itinerary API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
