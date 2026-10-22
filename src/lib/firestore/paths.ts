export const businessPath = (businessId: string) => `businesses/${businessId}`;
export const paths = {
  business: (b: string) => businessPath(b),
  categories: (b: string) => `${businessPath(b)}/categories`,
  products: (b: string) => `${businessPath(b)}/products`,
  modifierGroups: (b: string) => `${businessPath(b)}/modifierGroups`,
  inventory: () => "inventory",
  stockMovements: (b: string) => `${businessPath(b)}/stockMovements`,
  orders: (b: string) => `${businessPath(b)}/orders`,
  customers: (b: string) => `${businessPath(b)}/customers`,
  dailyStats: (b: string) => `${businessPath(b)}/dailyStats`,
  cashAdjustments: (b: string) => `${businessPath(b)}/cashAdjustments`,
  cashCounts: (b: string) => `${businessPath(b)}/cashCounts`,
  shifts: (b: string) => `${businessPath(b)}/shifts`,
  settings: (b: string) => `${businessPath(b)}/settings`,
  counters: (b: string) => `${businessPath(b)}/counters`,
};
