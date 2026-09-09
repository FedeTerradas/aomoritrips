import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌸 Seeding AomoriTrips catalog data...");

  // Limpiar catálogo previo si existiera
  await prisma.bookingOrder.deleteMany();
  await prisma.travelPack.deleteMany();

  const packs = [
    {
      slug: "hirosaki-sakura-dream",
      title: "Hirosaki Sakura Dream: Castillo y Cerezos en Flor",
      japaneseTitle: "弘前さくらの夢 (Hirosaki Sakura no Yume)",
      description:
        "Vive la primavera más mágica del norte de Japón. Navega en fosa de pétalos rosados por el Castillo de Hirosaki con más de 2.600 cerezos centenarios, estancia en ryokan con baños onsen y gastronomía con manzanas de Aomori.",
      heroImage:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 2890,
      seasonTag: "sakura",
      seasonLabel: "🌸 Cerezos en Flor (Abril - Mayo)",
      durationDays: 7,
      rating: 4.95,
      reviewsCount: 148,
      highlights: JSON.stringify([
        "Vuelo internacional + Shinkansen Hayabusa Gran Class",
        "Paseo en bote tradicional por el foso del Castillo de Hirosaki",
        "2 noches en Ryokan tradicional Sukayu con onsen milenario",
        "JR East Pass Tohoku 5 días ilimitado incluido",
        "Degustación de sidra artesanal y repostería de manzana Tsugaru",
      ]),
      itinerarySummary: JSON.stringify([
        { day: 1, title: "Llegada a Tokio y Shinkansen hacia Shin-Aomori" },
        { day: 2, title: "Hirosaki Park: Cerezos y picnic hanami tradicional" },
        { day: 3, title: "Artesanías Tsugaru-nuri y pueblo samurái" },
        { day: 4, title: "Traslado al Onsen Sukayu en los montes Hakkoda" },
        {
          day: 5,
          title: "Senderismo suave y vistas panorámicas del Monte Iwaki",
        },
        { day: 6, title: "Mercado Furukawa de Aomori: Nokkedon gastronómico" },
        { day: 7, title: "Retorno en Shinkansen y vuelo de regreso" },
      ]),
      isFeatured: true,
    },
    {
      slug: "nebuta-fire-festival",
      title: "Nebuta Matsuri: Gigantes de Fuego y Danza Haneto",
      japaneseTitle: "青森ねぶた祭 (Aomori Nebuta Matsuri)",
      description:
        "El festival de verano más electrizante de Japón. Conviértete en bailarín oficial Haneto con vestimenta tradicional incluida, asientos VIP reservados para el desfile de carrozas monumentales de papel washi iluminadas con fuego.",
      heroImage:
        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 3250,
      seasonTag: "nebuta",
      seasonLabel: "🏮 Festival Nebuta (2 - 7 de Agosto)",
      durationDays: 8,
      rating: 4.98,
      reviewsCount: 215,
      highlights: JSON.stringify([
        "Asiento preferencial en gradería VIP para el desfile nocturno Nebuta",
        "Alquiler de traje oficial Haneto y participación en el desfile",
        "Taller privado con un maestro artesano constructor de carrozas Nebuta",
        "Ryokan frente al mar con vista a la Bahía de Mutsu",
        "Espectáculo de taiko (tambores gigantes) en vivo",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title: "Recepción en Aomori y prueba de atuendo tradicional",
        },
        { day: 2, title: "Visita al Museo WA RASSE y noche de desfile Nebuta" },
        { day: 3, title: "Día de festival: Danza Haneto junto a los locales" },
        { day: 4, title: "Excursión a la península de Tsugaru y Cabo Tappi" },
        {
          day: 5,
          title: "Noche final: Barcos flotantes y fuegos artificiales",
        },
        { day: 6, title: "Gastronomía marina: Atún azul de Oma y mariscos" },
        { day: 7, title: "Relax en Asamushi Onsen frente a la bahía" },
        { day: 8, title: "Despedida con certificado de bailarín honorario" },
      ]),
      isFeatured: true,
    },
    {
      slug: "oirase-gorge-autumn-trek",
      title: "Oirase Gorge & Lago Towada: Sinfonía de Otoño",
      japaneseTitle: "奥入瀬渓流・十和田湖 (Oirase Keiryū - Towada-ko)",
      description:
        "La caminata otoñal más hermosa del planeta. Senderos junto a 14 cascadas cristalinas rodeadas de arces y hayas en tonos rojo, ámbar y oro. Navegación en catamarán por el cráter volcánico del Lago Towada.",
      heroImage:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 2650,
      seasonTag: "koyo",
      seasonLabel: "🍁 Follaje de Otoño (Octubre - Noviembre)",
      durationDays: 6,
      rating: 4.91,
      reviewsCount: 94,
      highlights: JSON.stringify([
        "Guía de montaña bilingüe especializado en botánica de Tohoku",
        "Hospedaje en Hoshino Resorts Oirase Keiryu Hotel",
        "Crucero privado al atardecer en el místico Lago Towada",
        "Cena Kaiseki de autor con trucha de río y carne Aomori Wagyu",
        "Pase ferroviario JR Bus Tohoku ilimitado en la ruta escénica",
      ]),
      itinerarySummary: JSON.stringify([
        { day: 1, title: "Llegada a Hachinohe y bienvenida con té macha" },
        {
          day: 2,
          title: "Trek de 9km por la garganta de Oirase y cascada Choshi",
        },
        {
          day: 3,
          title: "Navegación en el Lago Towada y santuario Towada Jinja",
        },
        { day: 4, title: "Teleférico Hakkoda Ropeway sobre el bosque dorado" },
        { day: 5, title: "Baño rotenburo al aire libre entre hojas caídas" },
        { day: 6, title: "Almuerzo de despedida en Hachinohe Yatai Village" },
      ]),
      isFeatured: true,
    },
    {
      slug: "mount-iwaki-snow-onsen",
      title: "Monte Iwaki & Nieve Profunda: El Fuji de Tsugaru",
      japaneseTitle: "岩木山・雪の秘湯 (Iwakisan - Yuki no Hitō)",
      description:
        "Paisajes de invierno puro en el norte nipón. Desciende por las laderas nevadas del Monte Iwaki, sumérgete en aguas termales humeantes rodeadas de 2 metros de nieve virgen y viaja en el tren nostálgico Tsugaru con estufa de carbón.",
      heroImage:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      priceBaseUsd: 2980,
      seasonTag: "snow",
      seasonLabel: "❄️ Nieve Profunda & Onsen (Diciembre - Marzo)",
      durationDays: 7,
      rating: 4.97,
      reviewsCount: 162,
      highlights: JSON.stringify([
        "Pase de esquí y snowshoeing guiado por los 'monstruos de nieve' de Hakkoda",
        "Paseo en el Tsugaru Stove Train asando calamares sobre carbón al rojo",
        "Estancia en ryokan centenario con baños de cedro aromático",
        "Degustación de sake de nieve galardonado de bodegas locales",
        "Equipo térmico premium provisto para todo el itinerario",
      ]),
      itinerarySummary: JSON.stringify([
        {
          day: 1,
          title: "Arribo en vuelo y traslado en minivan con tracción 4x4",
        },
        { day: 2, title: "Paseo en el mítico Tren de la Estufa de Carbón" },
        {
          day: 3,
          title: "Raquetas de nieve y figuras de hielo en Monte Hakkoda",
        },
        { day: 4, title: "Onsen termal al aire libre nevado en Dake Onsen" },
        {
          day: 5,
          title: "Tarde de sake caliente y narración de leyendas Tsugaru",
        },
        {
          day: 6,
          title: "Mercado de invierno y compras de artesanías locales",
        },
        { day: 7, title: "Regreso con traslados VIP al aeropuerto" },
      ]),
      isFeatured: true,
    },
  ];

  for (const pack of packs) {
    await prisma.travelPack.create({ data: pack });
  }

  console.log(
    `✅ Seed completado con éxito: ${packs.length} paquetes cargados.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
