export interface ProductItem {
  id: string;
  name: string;
  category?: string;
  price: number | string;
  price_3_days?: number;
  price_extra_day?: number;
  image_url?: string;
  image_urls?: string[];
  description?: string;
  quantity?: number;
  [key: string]: any;
}

/**
 * Checks if a category string represents a Console.
 * Strictly checks the category value without looking at the product name.
 */
export function isConsoleCategory(category?: string): boolean {
  const cat = (category || "").toLowerCase().trim();
  return (
    cat === "console" ||
    cat === "consoles" ||
    cat.includes("console") ||
    cat === "ps5" ||
    cat === "playstation" ||
    cat === "xbox" ||
    cat === "nintendo"
  );
}

/**
 * Checks if a category string represents an Accessory or other non-console gear.
 * Strictly checks the category value without looking at the product name.
 */
export function isAccessoryCategory(category?: string): boolean {
  return !isConsoleCategory(category);
}

/**
 * Sorts products strictly by category such that Consoles are displayed first,
 * then Accessories and any other categories.
 */
export function sortProductsConsoleFirst<T extends { category?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const isAConsole = isConsoleCategory(a.category);
    const isBConsole = isConsoleCategory(b.category);

    if (isAConsole && !isBConsole) return -1;
    if (!isAConsole && isBConsole) return 1;

    // Secondary sort: alphabetical by category
    const catA = (a.category || "").toLowerCase();
    const catB = (b.category || "").toLowerCase();
    return catA.localeCompare(catB);
  });
}

/**
 * Gets all unique categories from the product list, ordered with Consoles first,
 * then Accessories and other categories.
 */
export function getAvailableCategories<T extends { category?: string }>(items: T[]): string[] {
  const categoriesSet = new Set<string>();
  items.forEach((item) => {
    if (item.category && item.category.trim()) {
      categoriesSet.add(item.category.trim());
    }
  });

  const categories = Array.from(categoriesSet);
  return categories.sort((a, b) => {
    const isAConsole = isConsoleCategory(a);
    const isBConsole = isConsoleCategory(b);
    if (isAConsole && !isBConsole) return -1;
    if (!isAConsole && isBConsole) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Filters items strictly by the category field.
 * If filter is "all", returns all items sorted console-first.
 * If filter matches a specific category or "consoles" / "accessories", filters strictly by item.category.
 */
export function filterProductsByCategory<T extends { category?: string }>(
  items: T[],
  filter: string
): T[] {
  const sorted = sortProductsConsoleFirst(items);
  if (!filter || filter.toLowerCase() === "all") {
    return sorted;
  }

  const normalizedFilter = filter.toLowerCase().trim();

  if (normalizedFilter === "consoles" || normalizedFilter === "console") {
    return sorted.filter((item) => isConsoleCategory(item.category));
  }

  if (normalizedFilter === "accessories" || normalizedFilter === "accessory") {
    return sorted.filter((item) => isAccessoryCategory(item.category));
  }

  // Exact or matching category string
  return sorted.filter((item) => {
    const cat = (item.category || "").toLowerCase().trim();
    return cat === normalizedFilter;
  });
}
