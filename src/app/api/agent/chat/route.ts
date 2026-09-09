import { NextResponse } from "next/server";
import { executeTravelAgent } from "@/lib/agent/orchestrator";
import { z } from "zod";

const ChatRequestSchema = z.object({
  sessionToken: z.string().min(1, "Se requiere sessionToken"),
  userMessage: z.string().min(1, "El mensaje no puede estar vacío").max(1200),
  requestedSeason: z.string().optional(),
  travelersCount: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de solicitud inválidos",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await executeTravelAgent(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error en POST /api/agent/chat:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del orquestador agéntico" },
      { status: 500 }
    );
  }
}
