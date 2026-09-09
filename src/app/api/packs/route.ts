import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const query = searchParams.get("q");

    const packs = await prisma.travelPack.findMany({
      orderBy: { rating: "desc" },
    });

    const filtered = packs.filter((p) => {
      if (season && season !== "all" && p.seasonTag !== season) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.seasonLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const parsed = filtered.map((p) => ({
      ...p,
      highlights: JSON.parse(p.highlights) as string[],
      itinerarySummary: JSON.parse(p.itinerarySummary) as {
        day: number;
        title: string;
      }[],
    }));

    return NextResponse.json({
      success: true,
      count: parsed.length,
      data: parsed,
    });
  } catch (error) {
    console.error("Error en GET /api/packs:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar los paquetes turísticos" },
      { status: 500 }
    );
  }
}
