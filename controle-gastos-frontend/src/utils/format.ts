const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 6505.4 -> "R$ 6.505,40" */
export const formatCurrency = (value: number | null | undefined): string => brl.format(Number(value) || 0);
