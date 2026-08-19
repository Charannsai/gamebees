export interface CartItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  price_3_days?: number;
  price_extra_day?: number;
  image_url?: string;
  duration?: number; // rental duration in days chosen by the customer
}

const CART_KEY = "gamebees-cart";
export const CART_PROMO_KEY = "gamebees-cart-promo";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("gamebees-cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existingIndex = cart.findIndex((entry) => entry.id === item.id);
  if (existingIndex >= 0) {
    // Update existing item with chosen duration
    const updated = [...cart];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...item,
      duration: item.duration ?? updated[existingIndex].duration ?? 3,
    };
    saveCart(updated);
  } else {
    saveCart([...cart, { ...item, duration: item.duration ?? 3 }]);
  }
}

export function updateCartItemDuration(id: string, duration: number) {
  const cart = getCart();
  const updated = cart.map((item) => (item.id === id ? { ...item, duration } : item));
  saveCart(updated);
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((item) => item.id !== id));
}

export function clearCart() {
  saveCart([]);
}

export function getCartPromoCode() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(CART_PROMO_KEY) || "";
}

export function setCartPromoCode(code: string) {
  if (typeof window === "undefined") return;
  if (code.trim()) sessionStorage.setItem(CART_PROMO_KEY, code.trim().toUpperCase());
  else sessionStorage.removeItem(CART_PROMO_KEY);
}

export function clearCartPromoCode() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CART_PROMO_KEY);
}

export { CART_KEY };
