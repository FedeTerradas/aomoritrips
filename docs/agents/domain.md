# Domain Documentation

## Layout

- **Model**: single-context
- **Ubiquitous vocabulary**: `CONTEXT.md` at repository root
- **Architecture Decision Records (ADRs)**: `docs/adr/`

## Consumer Rules

1. Before designing features or writing code, read `CONTEXT.md` to adopt ubiquitous domain terms.
2. When making architectural choices, check existing ADRs in `docs/adr/` and record new decisions with consecutive numbering (`docs/adr/NNN-title.md`).
3. Domain terms take precedence over generic technical names (e.g. `TravelPack`, `RyokanStay`, `ItineraryRecommendation` instead of generic `item` or `data`).
