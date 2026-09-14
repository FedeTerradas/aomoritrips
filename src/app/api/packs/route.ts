import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePackSchema } from "@/lib/validation/pack-schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const query = searchParams.get("q");

    const packs = await prisma.travelPack.findMany({
      orderBy: { createdAt: "desc" },
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreatePackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de paquete inválidos",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generar slug URL-friendly
    const baseSlug =
      data.slug ||
      data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newPack = await prisma.travelPack.create({
      data: {
        slug: uniqueSlug,
        title: data.title,
        japaneseTitle: data.japaneseTitle,
        description: data.description,
        heroImage: data.heroImage,
        priceBaseUsd: data.priceBaseUsd,
        seasonTag: data.seasonTag,
        seasonLabel: data.seasonLabel,
        durationDays: data.durationDays,
        highlights: JSON.stringify(data.highlights),
        itinerarySummary: JSON.stringify(data.itinerarySummary),
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newPack,
        highlights: data.highlights,
        itinerarySummary: data.itinerarySummary,
      },
    });
  } catch (error) {
    console.error("Error en POST /api/packs:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear el paquete turístico" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Se requiere el parámetro id" },
        { status: 400 }
      );
    }

    await prisma.travelPack.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Paquete eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error en DELETE /api/packs:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar el paquete turístico" },
      { status: 500 }
    );
  }
}
