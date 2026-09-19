import { prisma } from "../prisma";
import { validateAndSanitizeInput } from "./guardrails";
import { inferenceOrchestrator } from "./inference";
import {
  toolSearchPacks,
  toolGetSeasonalForecast,
  toolCalculatePricing,
  toolCreateItineraryDraft,
  toolGenerateQuizRecommendation,
  toolGenerateGroupItinerary,
  toolAnswerCulturalQuestion,
} from "./tools";
import {
  AgentDecisionStep,
  AgentExecutionResult,
  QuizAnswers,
  GroupProfile,
} from "./types";

export interface RunAgentInput {
  sessionToken: string;
  userMessage: string;
  requestedSeason?: string;
  travelersCount?: number;
  quizAnswers?: QuizAnswers; // Para llamadas directas desde /api/quiz
  groupProfile?: GroupProfile; // Para llamadas directas desde /api/itinerary
}

interface ResilientMessage {
  id: string;
  role: string;
  content: string;
}

interface ResilientSession {
  id: string;
  sessionToken: string;
  messages: ResilientMessage[];
  preferences: {
    preferredSeason: string | null;
    groupSize: number;
  } | null;
}

const memorySessionStore = new Map<string, ResilientSession>();

async function getOrCreateResilientSession(
  input: RunAgentInput
): Promise<ResilientSession> {
  try {
    let session = await prisma.agentSession.findUnique({
      where: { sessionToken: input.sessionToken },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 10 },
        preferences: true,
      },
    });

    if (!session) {
      session = await prisma.agentSession.create({
        data: {
          sessionToken: input.sessionToken,
          preferences: {
            create: {
              preferredSeason: input.requestedSeason || null,
              groupSize: input.travelersCount || 1,
            },
          },
        },
        include: {
          messages: true,
          preferences: true,
        },
      });
    }

    return {
      id: session.id,
      sessionToken: session.sessionToken,
      messages: session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
      preferences: session.preferences
        ? {
            preferredSeason: session.preferences.preferredSeason,
            groupSize: session.preferences.groupSize || 1,
          }
        : null,
    };
  } catch (err) {
    console.warn(
      "[Orchestrator] Base de datos en modo solo lectura o no disponible, usando memoria de sesión:",
      err
    );
    let mem = memorySessionStore.get(input.sessionToken);
    if (!mem) {
      mem = {
        id: "mem_" + input.sessionToken,
        sessionToken: input.sessionToken,
        messages: [],
        preferences: {
          preferredSeason: input.requestedSeason || null,
          groupSize: input.travelersCount || 1,
        },
      };
      memorySessionStore.set(input.sessionToken, mem);
    }
    return mem;
  }
}

async function recordResilientMessage(
  sessionId: string,
  sessionToken: string,
  role: string,
  content: string,
  toolCalls?: string
) {
  try {
    if (!sessionId.startsWith("mem_")) {
      await prisma.agentMessage.create({
        data: {
          sessionId,
          role,
          content,
          toolCalls,
        },
      });
    }
  } catch (err) {
    console.warn(
      "[Orchestrator] Mensaje no persistido en DB (filesystem read-only):",
      err
    );
  }

  const mem = memorySessionStore.get(sessionToken);
  if (mem) {
    mem.messages.push({
      id: "msg_" + Date.now(),
      role,
      content,
    });
  }
}

async function recordResilientPreferences(
  sessionId: string,
  sessionToken: string,
  preferredSeason?: string,
  groupSize?: number
) {
  try {
    if (!sessionId.startsWith("mem_")) {
      await prisma.travelerPreference.upsert({
        where: { sessionId },
        update: {
          ...(preferredSeason ? { preferredSeason } : {}),
          ...(groupSize ? { groupSize } : {}),
        },
        create: {
          sessionId,
          preferredSeason: preferredSeason || null,
          groupSize: groupSize || 1,
        },
      });
    }
  } catch (err) {
    console.warn(
      "[Orchestrator] Preferencias no persistidas en DB (filesystem read-only):",
      err
    );
  }

  const mem = memorySessionStore.get(sessionToken);
  if (mem && mem.preferences) {
    if (preferredSeason) mem.preferences.preferredSeason = preferredSeason;
    if (groupSize) mem.preferences.groupSize = groupSize;
  }
}

export async function executeTravelAgent(
  input: RunAgentInput
): Promise<AgentExecutionResult> {
  const decisionSteps: AgentDecisionStep[] = [];
  const toolsExecuted: string[] = [];

  // 1. Guardrail de Ciberseguridad
  const guardrail = validateAndSanitizeInput(input.userMessage);
  if (!guardrail.isSafe) {
    decisionSteps.push({
      observation: "Recepción de entrada sospechosa del usuario.",
      thought: `ALERTA DE SEGURIDAD: ${guardrail.flaggedReason}. Se rechaza la ejecución para proteger el sistema.`,
      action: "BLOCK_INPUT",
      actionOutput: { reason: guardrail.flaggedReason },
    });

    return {
      reply: `⚠️ Lo sentimos, tu consulta no pudo ser procesada por motivos de seguridad: ${guardrail.flaggedReason}. En AomoriTrips nos tomamos en serio la integridad de nuestros sistemas.`,
      sessionToken: input.sessionToken,
      decisionSteps,
      toolsExecuted: [],
    };
  }

  const cleanMessage = guardrail.sanitizedInput;

  // 2. Recuperar o Inicializar Sesión y Memoria Persistente en DB (o memoria de contingencia)
  const session = await getOrCreateResilientSession(input);

  // Guardar mensaje de usuario en la memoria
  await recordResilientMessage(
    session.id,
    session.sessionToken,
    "user",
    cleanMessage
  );

  // 3. Ciclo de Decisión Agéntica (Decision Loop)
  const lower = cleanMessage.toLowerCase();

  // Paso 1: Observación
  decisionSteps.push({
    observation: `Usuario consulta: "${cleanMessage}". Historial previo: ${session.messages.length} mensajes. Preferencias previas: temporada=${session.preferences?.preferredSeason || "no definida"}.`,
    thought:
      "Analizando la intención: ¿busca recomendaciones de packs, información estacional/clima, cotización transparente, quiz de perfil o armado de itinerario grupal?",
  });

  let suggestedPacks: unknown[] = [];
  let calculatedQuote: unknown = null;
  let itineraryDraft: unknown = null;
  let responseText = "";

  // — Llamada directa: Quiz de perfil —
  if (input.quizAnswers) {
    toolsExecuted.push("generate_quiz_recommendation");
    const quizResult = toolGenerateQuizRecommendation(input.quizAnswers);

    decisionSteps.push({
      observation:
        "Se recibieron las 7 respuestas del quiz de perfil cultural del usuario.",
      thought:
        "Calculando scoring de temporada y estilo de viaje basado en las respuestas para generar recomendación personalizada.",
      action: "toolGenerateQuizRecommendation",
      actionInput: { answers: input.quizAnswers },
      actionOutput: quizResult,
    });

    const replyText = quizResult.personalizedCard;

    await recordResilientMessage(
      session.id,
      session.sessionToken,
      "assistant",
      replyText,
      JSON.stringify(toolsExecuted)
    );

    return {
      reply: replyText,
      sessionToken: session.sessionToken,
      decisionSteps,
      toolsExecuted,
      quizResult,
    };
  }

  // — Llamada directa: Itinerario grupal —
  if (input.groupProfile) {
    toolsExecuted.push("generate_group_itinerary");
    const draftItinerary = toolGenerateGroupItinerary(input.groupProfile);

    decisionSteps.push({
      observation: `Se recibió perfil de grupo: ${input.groupProfile.size} personas, ${input.groupProfile.durationDays} días, temporada ${input.groupProfile.season}.`,
      thought:
        "Generando itinerario día a día con actividades, gastronomía y alojamiento adaptados al perfil del grupo.",
      action: "toolGenerateGroupItinerary",
      actionInput: { groupProfile: input.groupProfile },
      actionOutput: {
        days: draftItinerary.days.length,
        title: draftItinerary.title,
      },
    });

    const dayLines = draftItinerary.days
      .slice(0, 3)
      .map(
        (d) =>
          `• **Día ${d.dayNumber}**: ${d.activities[0]?.title || "Exploración libre"} | 🍱 ${d.meals[1]?.restaurantName || "Almuerzo local"}`
      )
      .join("\n");

    const bd = draftItinerary.budgetBreakdown;
    const replyText = `🗺️ **${draftItinerary.title}**\n\n${dayLines}\n\n💴 **Presupuesto estimado por persona**: $${bd.totalPerPersonUsd.toLocaleString()} USD | **Total grupo**: $${bd.totalGroupUsd.toLocaleString()} USD\n\n¿Querés guardar este itinerario como tu pack personalizado y reservarlo? 🌸`;

    await recordResilientMessage(
      session.id,
      session.sessionToken,
      "assistant",
      replyText,
      JSON.stringify(toolsExecuted)
    );

    return {
      reply: replyText,
      sessionToken: session.sessionToken,
      decisionSteps,
      toolsExecuted,
      draftItinerary,
    };
  }

  // Detección de cantidad de viajeros en mensaje (ej: "2 personas", "con mi pareja")
  let detectedTravelersCount: number | undefined = input.travelersCount;
  if (!detectedTravelersCount) {
    const directPaxMatch = lower.match(
      /(\d+)\s*(?:personas?|adultos?|viajeros?|pax)/
    );
    if (directPaxMatch) {
      detectedTravelersCount = parseInt(directPaxMatch[1], 10);
    } else if (
      lower.includes("pareja") ||
      lower.includes("mi novia") ||
      lower.includes("mi novio") ||
      lower.includes("mi esposa") ||
      lower.includes("mi esposo") ||
      lower.includes("de a dos")
    ) {
      detectedTravelersCount = 2;
    } else if (
      lower.includes("solo") ||
      lower.includes("sola") ||
      lower.includes("viajo solo") ||
      lower.includes("viajo sola")
    ) {
      detectedTravelersCount = 1;
    }
  }

  // Detección de destino / palabra clave
  let detectedDestinationQuery: string | undefined = undefined;
  let detectedSeason = input.requestedSeason;

  if (
    lower.includes("hirosaki") ||
    lower.includes("samurai") ||
    lower.includes("samurái") ||
    lower.includes("cerezos") ||
    lower.includes("sakura")
  ) {
    detectedDestinationQuery = lower.includes("hirosaki")
      ? "hirosaki"
      : undefined;
    if (!detectedSeason) detectedSeason = "sakura";
  } else if (
    lower.includes("nebuta") ||
    lower.includes("festival") ||
    lower.includes("cofradía") ||
    lower.includes("cofradia")
  ) {
    detectedDestinationQuery = "nebuta";
    if (!detectedSeason) detectedSeason = "nebuta";
  } else if (
    lower.includes("hakkoda") ||
    lower.includes("sukayu") ||
    lower.includes("hito") ||
    lower.includes("hitō") ||
    lower.includes("nieve")
  ) {
    detectedDestinationQuery = lower.includes("hakkoda")
      ? "hakkoda"
      : undefined;
    if (!detectedSeason) detectedSeason = "snow";
  } else if (lower.includes("osorezan") || lower.includes("shimokita")) {
    detectedDestinationQuery = "osorezan";
    if (!detectedSeason) detectedSeason = "koyo";
  } else if (
    lower.includes("shirakami") ||
    lower.includes("oirase") ||
    lower.includes("towada") ||
    lower.includes("matagi")
  ) {
    detectedDestinationQuery = "shirakami";
    if (!detectedSeason) detectedSeason = "koyo";
  }

  // Detección estacional complementaria por meses o clima
  if (!detectedSeason) {
    if (
      lower.includes("abril") ||
      lower.includes("mayo") ||
      lower.includes("primavera")
    ) {
      detectedSeason = "sakura";
    } else if (
      lower.includes("agosto") ||
      lower.includes("verano") ||
      lower.includes("julio")
    ) {
      detectedSeason = "nebuta";
    } else if (
      lower.includes("octubre") ||
      lower.includes("noviembre") ||
      lower.includes("otoño") ||
      lower.includes("koyo")
    ) {
      detectedSeason = "koyo";
    } else if (
      lower.includes("diciembre") ||
      lower.includes("enero") ||
      lower.includes("febrero") ||
      lower.includes("marzo") ||
      lower.includes("invierno") ||
      lower.includes("ski")
    ) {
      detectedSeason = "snow";
    }
  }

  // Detección de intenciones y ejecución de herramientas (Tools)
  const asksForSeason =
    lower.includes("temporada") ||
    lower.includes("clima") ||
    lower.includes("cuando viajar") ||
    lower.includes("cuándo viajar") ||
    lower.includes("sakura") ||
    lower.includes("nebuta") ||
    lower.includes("nieve") ||
    lower.includes("otoño") ||
    lower.includes("cerezos") ||
    lower.includes("mes") ||
    lower.includes("época") ||
    lower.includes("epoca") ||
    lower.includes("fechas") ||
    lower.includes("primavera") ||
    lower.includes("verano") ||
    lower.includes("invierno");

  const asksForPricing =
    lower.includes("precio") ||
    lower.includes("cuanto cuesta") ||
    lower.includes("cuánto cuesta") ||
    lower.includes("cuanto sale") ||
    lower.includes("cuánto sale") ||
    lower.includes("cotizar") ||
    lower.includes("personas") ||
    lower.includes("descuento") ||
    lower.includes("presupuesto") ||
    lower.includes("tarifa") ||
    lower.includes("costaría") ||
    lower.includes("costaria") ||
    Boolean(detectedTravelersCount && detectedTravelersCount > 1);

  const asksForItinerary =
    lower.includes("itinerario") ||
    lower.includes("días") ||
    lower.includes("dias") ||
    lower.includes("programa") ||
    lower.includes("actividades");

  const asksForCulture =
    lower.includes("onsen") ||
    lower.includes("etiqueta") ||
    lower.includes("comida") ||
    lower.includes("gastronomía") ||
    lower.includes("vocabulario") ||
    lower.includes("japonés") ||
    lower.includes("cultura") ||
    lower.includes("costumbre");

  const asksForPacks =
    lower.includes("paquete") ||
    lower.includes("paquetes") ||
    lower.includes("pack") ||
    lower.includes("packs") ||
    lower.includes("viaje") ||
    lower.includes("viajes") ||
    lower.includes("opciones") ||
    lower.includes("opcion") ||
    lower.includes("catalogo") ||
    lower.includes("catálogo") ||
    lower.includes("tours") ||
    lower.includes("tour") ||
    lower.includes("recomiendan") ||
    lower.includes("recomiendas") ||
    lower.includes("recomendás") ||
    lower.includes("recomendas");

  const asksForQuiz =
    lower.includes("quiz") ||
    lower.includes("test") ||
    lower.includes("personalidad") ||
    lower.includes("mi japon") ||
    lower.includes("mi japón") ||
    lower.includes("diagnostico") ||
    lower.includes("diagnóstico") ||
    lower.includes("estilo de viaje");

  // Invocación Tool 1: Búsqueda de paquetes en DB
  toolsExecuted.push("search_packs");

  const packsFound = await toolSearchPacks({
    season: detectedDestinationQuery ? undefined : detectedSeason,
    query: detectedDestinationQuery,
  });
  suggestedPacks =
    packsFound.length > 0
      ? packsFound
      : detectedSeason
        ? await toolSearchPacks({ season: detectedSeason })
        : await toolSearchPacks({});
  if (suggestedPacks.length === 0) {
    suggestedPacks = await toolSearchPacks({});
  }

  decisionSteps.push({
    observation: `Se encontraron ${suggestedPacks.length} packs candidatos en la base de datos de AomoriTrips (destino='${detectedDestinationQuery || "general"}', temporada='${detectedSeason || "todas"}').`,
    thought: `Se ejecutó la herramienta search_packs con filtro de destino y temporada.`,
    action: "toolSearchPacks",
    actionInput: { season: detectedSeason, query: detectedDestinationQuery },
    actionOutput: { count: suggestedPacks.length },
  });

  // Invocación Tool 2: Si pregunta por clima / época
  if (asksForSeason) {
    toolsExecuted.push("get_seasonal_forecast");
    const seasonKey =
      detectedSeason ||
      (suggestedPacks[0] as { seasonTag?: string })?.seasonTag ||
      "sakura";
    const forecast = toolGetSeasonalForecast(seasonKey);

    decisionSteps.push({
      observation: `Usuario mostró interés en aspectos climáticos o festivos para ${seasonKey}.`,
      thought: `Invocando get_seasonal_forecast para brindar información técnica y cultural de Tohoku.`,
      action: "toolGetSeasonalForecast",
      actionInput: { season: seasonKey },
      actionOutput: forecast,
    });
  }

  // Invocación Tool 3: Si pide cotización / personas
  const count = detectedTravelersCount || session.preferences?.groupSize || 2;
  if (asksForPricing) {
    toolsExecuted.push("calculate_pricing");
    const firstPack = suggestedPacks[0] as
      { priceBaseUsd: number; seasonTag: string } | undefined;
    const base = firstPack ? firstPack.priceBaseUsd : 2890;
    const sTag = firstPack ? firstPack.seasonTag : detectedSeason || "sakura";

    calculatedQuote = toolCalculatePricing(base, count, sTag);

    decisionSteps.push({
      observation: `El usuario solicita costos para ${count} viajero(s).`,
      thought: `Calculando tarifa transparente con factores estacionales y descuentos grupales.`,
      action: "toolCalculatePricing",
      actionInput: {
        basePriceUsd: base,
        travelersCount: count,
        seasonTag: sTag,
      },
      actionOutput: calculatedQuote,
    });
  }

  // Invocación Tool 4: Si pide itinerario
  if (asksForItinerary) {
    toolsExecuted.push("create_itinerary_draft");
    const targetPack = suggestedPacks[0] as
      { title: string; durationDays: number } | undefined;
    const pTitle = targetPack
      ? targetPack.title
      : "Gran Aventura por Aomori y Tohoku";
    const pDays = targetPack ? targetPack.durationDays : 7;

    itineraryDraft = toolCreateItineraryDraft(pTitle, pDays, [
      "Onsen tradicional",
      "Castillos samurái",
      "Gastronomía Tsugaru",
    ]);

    decisionSteps.push({
      observation:
        "El usuario solicitó conocer la distribución de días del viaje.",
      thought:
        "Generando borrador de itinerario día por día con traslados en Shinkansen y hospedaje en Ryokan.",
      action: "toolCreateItineraryDraft",
      actionInput: { packTitle: pTitle, durationDays: pDays },
      actionOutput: itineraryDraft,
    });
  }

  let culturalResponse = null;
  if (asksForCulture) {
    toolsExecuted.push("answer_cultural_question");
    culturalResponse = toolAnswerCulturalQuestion(cleanMessage);

    decisionSteps.push({
      observation:
        "El usuario solicitó información cultural sobre costumbres, gastronomía o festivales.",
      thought:
        "Recurriendo a conocimientos de la cultura del norte de Japón y modales locales.",
      action: "toolAnswerCulturalQuestion",
      actionInput: { topic: cleanMessage },
      actionOutput: culturalResponse,
    });
  }

  // 4. Síntesis y Redacción de Respuesta (Multi-objetivo: Temporada + Cotización + Itinerario + Catálogo + Quiz)
  interface PackItem {
    id: string;
    slug: string;
    title: string;
    japaneseTitle?: string;
    priceBaseUsd: number;
    seasonTag: string;
    seasonLabel: string;
    durationDays: number;
    rating?: number;
    highlights?: string[];
  }

  const allSuggested = (suggestedPacks || []) as PackItem[];
  const chosenPack = allSuggested[0] || undefined;
  const alternatePacks = allSuggested.slice(1, 4);

  const responseSections: string[] = [];

  if (asksForQuiz) {
    toolsExecuted.push("generate_quiz_recommendation");
    responseSections.push(
      `🌸 **Diagnóstico Cultural de Viaje: 'Mi Japón'** (Test Interactivo)\n\n` +
        `Diseñamos un test interactivo de 7 preguntas para cruzar tus preferencias de anime, gastronomía tradicional, ritmo de viaje y clima con las rutas secretas de Tohoku.\n\n` +
        `Al completarlo, descubrís tu arquetipo de viajero oficial y tu guía anime:\n` +
        `• **🌸 Sakura (Poeta Contemplativo)**: Amantes de la contemplación floral, templos zen y jardines feudales en Hirosaki.\n` +
        `• **🏮 Haruto (Espíritu Festivo)**: Viajeros con alta energía atraídos por el festival de fuego Nebuta Matsuri y los mercados nocturnos.\n` +
        `• **🍃 Explorador Matagi**: Amantes del trekking en bosques vírgenes UNESCO (Shirakami-Sanchi) y la mística del Monte Osorezan.\n` +
        `• **❄️ Buscador Onsen**: Quienes anhelan el silencio curativo de los baños termales milenarios bajo la nieve en Sukayu Onsen.\n\n` +
        `👉 Podés realizar el test en cualquier momento desde [🌸 Mi Japón](/quiz) para obtener tu tarjeta personalizada.`
    );
  }

  if (asksForSeason) {
    const sKey = detectedSeason || chosenPack?.seasonTag || "sakura";
    const f = toolGetSeasonalForecast(sKey);
    let seasonSection =
      `🌸 **Recomendación Estacional para Aomori (${f.season})**:\n\n${f.highlight}\n\n` +
      `- 🌡️ **Temperatura típica**: ${f.tempRange}\n` +
      `- 📅 **Mejor momento**: ${f.bestMonths}\n` +
      `- 🎒 **Consejo de equipaje**: ${f.packingTips.join(", ")}.\n\n` +
      `Te recomendamos especialmente nuestra expedición principal: **${chosenPack?.title || "Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru"}** (${chosenPack?.durationDays || 7} días · Desde $${(chosenPack?.priceBaseUsd || 2890).toLocaleString()} USD).`;

    if (alternatePacks.length > 0) {
      seasonSection +=
        `\n\n🎒 **Otras expediciones afines para esta temporada**:\n` +
        alternatePacks
          .map(
            (p) =>
              `• **${p.title}** (${p.seasonLabel} · ${p.durationDays} días — Desde $${p.priceBaseUsd.toLocaleString()} USD)`
          )
          .join("\n");
    }

    seasonSection += `\n\n💡 *¿Querés saber qué viaje se adapta mejor a tu personalidad? Te invitamos a hacer nuestro [🌸 Test Cultural 'Mi Japón'](/quiz).*`;

    responseSections.push(seasonSection);
  }

  if (asksForPricing && calculatedQuote) {
    const q = calculatedQuote as {
      travelersCount: number;
      pricePerPersonUsd: number;
      subtotalUsd: number;
      taxesAndTransfersUsd: number;
      grandTotalUsd: number;
      groupDiscountApplied: string;
    };
    let pricingSection =
      `💴 **Cotización Transparente AomoriTrips** (Sin cargos ocultos para ${q.travelersCount} persona${q.travelersCount > 1 ? "s" : ""}):\n\n` +
      `- **Expedición seleccionada**: ${chosenPack?.title || "Hirosaki Samurái: Cerezos Ocultos"}\n` +
      `- **Cantidad de viajeros**: ${q.travelersCount} persona(s)\n` +
      `- **Precio por persona**: $${q.pricePerPersonUsd.toLocaleString()} USD (descuento aplicado: ${q.groupDiscountApplied})\n` +
      `- **Subtotal experiencias y Ryokan**: $${q.subtotalUsd.toLocaleString()} USD\n` +
      `- **Tasas e impuestos de prefectura**: $${q.taxesAndTransfersUsd.toLocaleString()} USD\n` +
      `- **TOTAL FINAL GARANTIZADO**: **$${q.grandTotalUsd.toLocaleString()} USD**\n\n` +
      `Todos los paquetes incluyen vuelo internacional, JR East Tohoku Pass ilimitado, Ryokan tradicional con aguas termales y guía bilingüe.`;

    if (alternatePacks.length > 0) {
      pricingSection +=
        `\n\n✨ **Alternativas que también podés cotizar**:\n` +
        alternatePacks
          .map(
            (p) =>
              `• **${p.title}** (${p.durationDays} días) — Tarifa base: $${p.priceBaseUsd.toLocaleString()} USD/persona`
          )
          .join("\n");
    }

    responseSections.push(pricingSection);
  }

  if (
    asksForPacks &&
    !asksForSeason &&
    !asksForPricing &&
    !asksForItinerary &&
    allSuggested.length > 0
  ) {
    let packsSection =
      `🗾 **Catálogo de Expediciones de AomoriTrips**:\n\n` +
      `Contamos con ${allSuggested.length} expediciones diseñadas para vivir el norte de Japón con máxima autenticidad:\n\n`;

    packsSection += allSuggested
      .map(
        (p) =>
          `• **${p.title}** (${p.seasonLabel} · ${p.durationDays} días · Desde $${p.priceBaseUsd.toLocaleString()} USD)\n` +
          `  _Aspectos destacados_: ${p.highlights && p.highlights.length > 0 ? p.highlights.slice(0, 3).join(", ") : "Aguas termales onsen, tren bala Shinkansen y Ryokan histórico"}`
      )
      .join("\n\n");

    packsSection +=
      `\n\nTodos los paquetes incluyen vuelos, pase JR Shinkansen, estancia en Ryokan tradicional y guía especializado.\n\n` +
      `🌸 *¿No sabés cuál elegir? Te recomendamos hacer nuestro [Test Cultural 'Mi Japón'](/quiz) para descubrir tu ruta ideal.*`;

    responseSections.push(packsSection);
  }

  if (asksForItinerary && itineraryDraft) {
    const it = itineraryDraft as {
      itineraryName: string;
      durationDays: number;
      days: { day: number; title: string; activity: string }[];
    };
    const dayLines = it.days
      .slice(0, 4)
      .map((d) => `• **Día ${d.day}**: ${d.title}\n  _${d.activity}_`)
      .join("\n\n");
    responseSections.push(
      `🗺️ **Propuesta de Itinerario (${it.itineraryName} - ${it.durationDays} Días)**:\n\n${dayLines}\n\n*(Puedes ver el desglose completo en la vista del paquete o solicitar ajustes según tus intereses).*`
    );
  }

  if (asksForCulture && culturalResponse) {
    responseSections.push(
      `${culturalResponse.emoji} **Cultura de Aomori - ${culturalResponse.category}**:\n\n${culturalResponse.answer}\n\nDescubre más detalles en nuestra [Guía Cultural](/cultura).`
    );
  }

  // 4. Síntesis y Redacción de Respuesta mediante el Inference Seam
  let inferenceSource: AgentExecutionResult["inferenceSource"] = undefined;

  if (responseSections.length > 0) {
    responseText = responseSections.join("\n\n---\n\n");
    inferenceSource = {
      provider: "fallback-rules",
      model: "aomori-tools-v1",
      latencyMs: 10,
    };
  } else {
    // Consulta abierta o conversacional: delegar al Inference Orchestrator
    const promptMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content: `Eres Aomori Sensei (青森の先生), el sabio, hospitalario y experto guía de viajes de AomoriTrips.
Tu misión es asesorar a los viajeros sobre la prefectura de Aomori y la región de Tohoku (Japón) con la máxima calidez y hospitalidad japonesa (omotenashi).
Proporciona respuestas detalladas, completas, bien estructuradas e inspiradoras (nunca escuetas ni monosilábicas).

Catálogo oficial de expediciones en AomoriTrips:
1. 🌸 Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru (Primavera / Sakura · 7 días · Desde $2.890 USD) - Castillo feudal, foso de pétalos rosados Hanaikada, residencias samurái y ceremonia del té.
2. 🏮 Nebuta Matsuri: Acceso a Cofradías y Talleres de Maestros (Verano / Nebuta · 6 días · Desde $3.390 USD) - Carrozas monumentales de papel iluminadas por fuego, danza colectiva Haneto con yukata y acceso a talleres.
3. 🍁 Shirakami-Sanchi & Oirase: Expedición al Bosque Primario UNESCO (Otoño / Koyo · 8 días · Desde $2.790 USD) - Follaje rojo y dorado en 14 cascadas de Oirase, senderismo con cazadores Matagi y navegación en el Lago Towada.
4. 🍁 Osorezan & Acantilados de Shimokita: El Japón Místico Inexplorado (Otoño / Koyo · 7 días · Desde $3.450 USD) - El monte sagrado de los espíritus Osorezan, aguas termales sulfurosas y cata del atún azul de Oma.
5. 🍁 Ruta Volcánica Hakkoda (Otoño / Koyo · 5 días · Desde $1.850 USD) - Senderismo por turberas humeantes y baños termales de alta montaña.
6. ❄️ Hitō Secretos de Hakkoda: Termas Milenarias en la Nieve Profunda (Invierno / Snow · 7 días · Desde $2.980 USD) - Sukayu Onsen con el milenario baño Senninburo, árboles congelados 'Monstruos de Nieve' y Tren con Estufa de Carbón.

Herramientas disponibles:
- 🌸 Quiz Cultural 'Mi Japón' (/quiz): test interactivo de 7 preguntas para diagnosticar el viaje ideal según gustos de anime, comida, ritmo y clima.
- 🗺️ Armador de Itinerario (/itinerary-builder): diseño a medida para grupos.
- 🎫 Vouchers offline con QR firmado criptográficamente con HMAC.

Instrucciones de estilo:
- Habla en español con calidez, respeto y entusiasmo por Tohoku.
- Usa emojis sutiles y evocadores (⛩️, 🌸, 🏮, 🍁, ❄️, 🍱, 🍵).
- Cuando sugieras viajes, menciona al menos 2 o 3 opciones del catálogo con sus precios y diferenciales.
- Invita siempre al viajero a descubrir su perfil en el Quiz (/quiz) si aún no tiene definida su época de viaje.`,
      },
    ];

    for (const msg of session.messages.slice(-5)) {
      if (msg.role === "user" || msg.role === "assistant") {
        promptMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }
    promptMessages.push({ role: "user", content: cleanMessage });

    const inferenceResult = await inferenceOrchestrator.runInference(
      promptMessages,
      { temperature: 0.4, maxTokens: 800 }
    );

    responseText = inferenceResult.text;
    inferenceSource = {
      provider: inferenceResult.provider,
      model: inferenceResult.model,
      latencyMs: inferenceResult.latencyMs,
    };

    decisionSteps.push({
      observation: `Respuesta sintetizada con éxito mediante motor: ${inferenceResult.provider} (${inferenceResult.model}).`,
      thought: `Inferencia ejecutada en ${inferenceResult.latencyMs}ms con el contrato InferenceProvider.`,
      action: "INFERENCE_SYNTHESIS",
      actionInput: {
        provider: inferenceResult.provider,
        model: inferenceResult.model,
      },
      actionOutput: { latencyMs: inferenceResult.latencyMs },
    });
  }

  // 5. Actualizar la Memoria Persistente (Tolerante a fallos de filesystem en Vercel)
  await recordResilientMessage(
    session.id,
    session.sessionToken,
    "assistant",
    responseText,
    JSON.stringify(toolsExecuted)
  );

  if (detectedSeason || detectedTravelersCount) {
    await recordResilientPreferences(
      session.id,
      session.sessionToken,
      detectedSeason,
      count
    );
  }

  return {
    reply: responseText,
    sessionToken: session.sessionToken,
    decisionSteps,
    toolsExecuted,
    suggestedPacks,
    calculatedQuote,
    itineraryDraft,
    inferenceSource,
    inferredPreferences: {
      preferredSeason: detectedSeason || undefined,
      groupSize: count,
    },
  };
}
