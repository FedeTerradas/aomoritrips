import { prisma } from "../prisma";

export interface SearchPacksParams {
  season?: string;
  maxBudgetUsd?: number;
  query?: string;
}

export async function toolSearchPacks(params: SearchPacksParams) {
  const allPacks = await prisma.travelPack.findMany({
    orderBy: { rating: "desc" },
  });

  return allPacks
    .filter((pack) => {
      if (
        params.season &&
        params.season !== "all" &&
        pack.seasonTag.toLowerCase() !== params.season.toLowerCase()
      ) {
        return false;
      }
      if (params.maxBudgetUsd && pack.priceBaseUsd > params.maxBudgetUsd) {
        return false;
      }
      if (params.query) {
        const q = params.query.toLowerCase();
        const matchTitle = pack.title.toLowerCase().includes(q);
        const matchDesc = pack.description.toLowerCase().includes(q);
        const matchSeason = pack.seasonLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSeason) return false;
      }
      return true;
    })
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      japaneseTitle: p.japaneseTitle,
      priceBaseUsd: p.priceBaseUsd,
      seasonTag: p.seasonTag,
      seasonLabel: p.seasonLabel,
      durationDays: p.durationDays,
      rating: p.rating,
      highlights: JSON.parse(p.highlights) as string[],
    }));
}

export function toolGetSeasonalForecast(seasonTag: string) {
  const seasonData: Record<
    string,
    {
      season: string;
      tempRange: string;
      highlight: string;
      packingTips: string[];
      bestMonths: string;
    }
  > = {
    sakura: {
      season: "Primavera - Cerezos en Flor (Sakura)",
      tempRange: "8°C a 17°C",
      highlight:
        "Túnel de cerezos y foso rosado del Castillo de Hirosaki. Época ideal para paseos en bote y picnics Hanami.",
      packingTips: [
        "Chaqueta media para la tarde",
        "Calzado cómodo para caminar",
        "Cámara con lente angular",
      ],
      bestMonths: "Finales de Abril a primera semana de Mayo",
    },
    nebuta: {
      season: "Verano - Festival de Gigantes de Fuego Nebuta",
      tempRange: "22°C a 29°C (cálido y festivo)",
      highlight:
        "Desfile nocturno de carrozas monumentales de papel iluminadas por fuego y danza colectiva Haneto.",
      packingTips: [
        "Ropa liviana de algodón",
        "Yukata o traje tradicional Haneto",
        "Protector solar y abanico sensu",
      ],
      bestMonths: "2 al 7 de Agosto (fechas inamovibles)",
    },
    koyo: {
      season: "Otoño - Follaje Rojo y Dorado (Koyo)",
      tempRange: "7°C a 16°C",
      highlight:
        "Garganta de Oirase y senderismo entre 14 cascadas doradas. Navegación en catamarán por el cráter del Lago Towada.",
      packingTips: [
        "Capas de abrigo (polar / cortavientos)",
        "Calzado de trekking impermeable",
        "Termo para té caliente",
      ],
      bestMonths: "Mediados de Octubre a principios de Noviembre",
    },
    snow: {
      season: "Invierno - Nieve en Polvo y Onsen Nevado",
      tempRange: "-6°C a 2°C (nieve profunda de calidad mundial)",
      highlight:
        "Baños termales humeantes al aire libre rodeados de nieve (Sukayu Onsen) y el nostálgico Tren de la Estufa de Carbón.",
      packingTips: [
        "Parka térmica impermeable",
        "Botas con suela antideslizante para hielo",
        "Guantes térmicos y gorro de lana",
      ],
      bestMonths: "Diciembre a Marzo",
    },
  };

  const key = seasonTag.toLowerCase();
  return seasonData[key] || seasonData["sakura"];
}

export function toolCalculatePricing(
  basePriceUsd: number,
  travelersCount: number,
  seasonTag: string
) {
  let seasonFactor = 1.0;
  if (seasonTag === "nebuta") seasonFactor = 1.15; // Temporada pico máxima
  if (seasonTag === "sakura") seasonFactor = 1.1;
  if (seasonTag === "snow") seasonFactor = 1.05;

  let groupDiscount = 0;
  if (travelersCount >= 4)
    groupDiscount = 0.1; // 10% dto para grupos
  else if (travelersCount >= 2) groupDiscount = 0.05; // 5% dto parejas

  const pricePerPerson = Math.round(
    basePriceUsd * seasonFactor * (1 - groupDiscount)
  );
  const subtotal = pricePerPerson * travelersCount;
  const taxesAndTransfers = Math.round(subtotal * 0.08); // Tasas e impuestos de Japón
  const grandTotalUsd = subtotal + taxesAndTransfers;

  return {
    travelersCount,
    pricePerPersonUsd: pricePerPerson,
    seasonFactor,
    groupDiscountApplied: `${groupDiscount * 100}%`,
    subtotalUsd: subtotal,
    taxesAndTransfersUsd: taxesAndTransfers,
    grandTotalUsd,
    guaranteedNoHiddenFees: true,
  };
}

export function toolCreateItineraryDraft(
  packTitle: string,
  durationDays: number,
  specialInterests: string[] = []
) {
  const days = [];
  for (let i = 1; i <= durationDays; i++) {
    if (i === 1) {
      days.push({
        day: 1,
        title: "Arribo a Japón y Conexión Shinkansen Hayabusa a Shin-Aomori",
        activity:
          "Recepción por asistente bilingüe de AomoriTrips, entrega de JR Pass Tohoku y traslado en Shinkansen Gran Class.",
        accommodation: "Check-in en Ryokan tradicional seleccionado.",
      });
    } else if (i === durationDays) {
      days.push({
        day: i,
        title: "Ceremonia de Despedida y Retorno",
        activity:
          "Último baño onsen matutino, compras de souvenirs de manzana Tsugaru en el mercado A-Factory y Shinkansen de regreso.",
        accommodation: "Vuelo de retorno garantizado.",
      });
    } else {
      const interestNote =
        specialInterests.length > 0
          ? ` (Adaptado a tus intereses: ${specialInterests.join(", ")})`
          : "";
      days.push({
        day: i,
        title: `Exploración Profunda de Aomori - Día ${i}${interestNote}`,
        activity: `Excursión inmersiva vinculada a ${packTitle}, almuerzo tradicional Kaiseki y visita a talleres de artesanos locales.`,
        accommodation: "Noche en Ryokan con aguas termales naturales onsen.",
      });
    }
  }

  return {
    itineraryName: `Itinerario Exclusivo: ${packTitle}`,
    durationDays,
    days,
  };
}
