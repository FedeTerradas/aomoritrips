import { InferenceProvider, InferenceMessage, InferenceResult } from "./types";

/**
 * Adaptador de Fallback Determinístico Local
 * Garantiza cero caídas en producción o entornos aislados sin conectividad ni claves API.
 */
export class DeterministicFallbackAdapter implements InferenceProvider {
  readonly id = "fallback-rules" as const;
  readonly displayName = "Motor Determinístico Aomori (Reglas Expertas)";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generate(messages: InferenceMessage[]): Promise<InferenceResult> {
    const startTime = Date.now();
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const text = this.synthesizeReply(lastUserMessage);

    return {
      text,
      provider: this.id,
      model: "aomori-rules-v2",
      latencyMs: Date.now() - startTime,
    };
  }

  private synthesizeReply(userQuery: string): string {
    const q = userQuery.toLowerCase();

    if (
      q.includes("sakura") ||
      q.includes("cerezo") ||
      q.includes("primavera") ||
      q.includes("hirosaki")
    ) {
      return (
        "🌸 **Recomendación Estacional: Primavera en Hirosaki (Sakura)**\n\n" +
        "La floración en el Parque del Castillo de Hirosaki cuenta con más de 2.600 cerezos. Te recomendamos la expedición *Hirosaki Samurái: Cerezos Ocultos y Casas de Té Clanes Tsugaru* (desde $2.890 USD todo incluido).\n\n" +
        "Incluye hospedaje en Ryokan con aguas termales, vuelo internacional y pase JR East Tohoku Pass ilimitado."
      );
    }

    if (
      q.includes("nebuta") ||
      q.includes("verano") ||
      q.includes("festival")
    ) {
      return (
        "🏮 **Recomendación Estacional: Verano y Festival Nebuta**\n\n" +
        "El Nebuta Matsuri en agosto deslumbra con colosales carrozas de papel iluminadas por fuego y desfiles de danzantes Haneto. Nuestro paquete *Festival de Fuego Nebuta Matsuri* incluye asientos VIP reservados y vestimenta tradicional para participar en la procesión."
      );
    }

    if (
      q.includes("nieve") ||
      q.includes("invierno") ||
      q.includes("hakkoda") ||
      q.includes("sukayu")
    ) {
      return (
        "❄️ **Recomendación Estacional: Invierno Profundo en Hakkoda y Sukayu Onsen**\n\n" +
        "En los Montes Hakkoda podrás contemplar los legendarios 'Monstruos de Nieve' (Juhyo) y sumergirte en el milenario baño termal de madera Senninburo en Sukayu Onsen bajo más de 4 metros de nieve pura."
      );
    }

    if (q.includes("itinerario") || q.includes("días") || q.includes("dias")) {
      return (
        "🗺️ **Propuesta de Itinerario Esencial por Tohoku (7 Días)**:\n\n" +
        "• **Día 1**: Llegada a Shin-Aomori vía Hayabusa Shinkansen y check-in en Ryokan histórico.\n" +
        "• **Día 2**: Castillo de Hirosaki, barrio de residencias samurái y ceremonia del té matcha.\n" +
        "• **Día 3**: Travesía por el Lago Towada y caminata fotográfica en la Garganta de Oirase.\n" +
        "• **Día 4**: Ascenso en teleférico a los Montes Hakkoda y baño onsen tradicional.\n" +
        "• **Día 5 a 7**: Mercados pesqueros de Nokkedon y taller artesanal de faroles Nebuta.\n\n" +
        "¿Te gustaría que personalicemos las actividades o calculemos la tarifa para tu grupo?"
      );
    }

    return (
      "¡Konnichiwa! Soy tu **Sensei de viajes de AomoriTrips** (青森の先生) ⛩️.\n\n" +
      "Puedo ayudarte a planificar tu travesía por el norte profundo de Japón sin barreras de idioma ni complicaciones logísticas.\n\n" +
      "Contamos con expediciones exclusivas a Hirosaki, los Montes Hakkoda, el Lago Towada y el sagrado Monte Osorezan. ¿Deseas cotizar para un grupo, armar un itinerario o descubrir la mejor época para viajar?"
    );
  }
}
