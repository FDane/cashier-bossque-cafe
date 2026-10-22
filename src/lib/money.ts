export const formatMoney = (sen: number) =>
  new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(
    sen / 100,
  );
export const percentOf = (sen: number, rate: number) =>
  Math.round((sen * rate) / 100);
