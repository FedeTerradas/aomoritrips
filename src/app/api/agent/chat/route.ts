import { NextResponse } from "next/server";
import { executeTravelAgent } from "@/lib/agent/orchestrator";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const ChatRequestSchema = z.object({
  sessionToken: z.string().min(1, "Se requiere sessionToken"),
  userMessage: z.string().min(1, "El mensaje no puede estar vacío").max(1200),
  requestedSeason: z.string().optional(),
  travelersCount: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  // Rate limiting: máx 15 consultas al agente por IP por minuto
  // (cada llamada invoca LLM + DB: la más costosa de la plataforma)
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, "chat", { max: 15 });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Límite de consultas alcanzado. Espera un momento.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

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
