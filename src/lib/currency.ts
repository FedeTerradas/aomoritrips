/**
 * Módulo de Divisas y Conversión Dinámica para AomoriTrips
 * Soporta USD, JPY, EUR y ARS con persistencia en LocalStorage y perfil de usuario.
 */

export type SupportedCurrency = "USD" | "JPY" | "EUR" | "ARS";

export interface CurrencyConfig {
  rate: number; // Tasa de cambio frente a 1 USD
  symbol: string;
  suffix: string;
  locale: string;
}

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  USD: { rate: 1, symbol: "$", suffix: "USD", locale: "en-US" },
  JPY: { rate: 155, symbol: "¥", suffix: "JPY", locale: "ja-JP" },
  EUR: { rate: 0.92, symbol: "€", suffix: "EUR", locale: "de-DE" },
  ARS: { rate: 1350, symbol: "$", suffix: "ARS", locale: "es-AR" },
};

export interface FormattedPrice {
  amount: number;
  formatted: string;
  symbol: string;
  suffix: string;
}

/**
 * Convierte un monto base en USD a la divisa preferida y lo formatea.
 */
export function formatCurrencyPrice(
  amountUsd: number,
  currencyCode: string = "USD"
): FormattedPrice {
  const code: SupportedCurrency =
    currencyCode in CURRENCY_CONFIGS
      ? (currencyCode as SupportedCurrency)
      : "USD";

  const cfg = CURRENCY_CONFIGS[code];
  const converted = Math.round(amountUsd * cfg.rate);

  return {
    amount: converted,
    formatted: `${cfg.symbol}${converted.toLocaleString(cfg.locale)}`,
    symbol: cfg.symbol,
    suffix: cfg.suffix,
  };
}
