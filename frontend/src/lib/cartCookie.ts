export type CartItem = {
  fileName: string;
  name: string;
  priceValue: number;
  quantity: number;
};

const cartCookieKey = "scentcraft_cart";
const cartCookieMaxAgeSeconds = 60 * 60 * 24 * 30;

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.fileName === "string" &&
    typeof item.name === "string" &&
    typeof item.priceValue === "number" &&
    Number.isFinite(item.priceValue) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function readCartCookie(): CartItem[] {
  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${cartCookieKey}=`));

  if (!cookieEntry) {
    return [];
  }

  const encodedValue = cookieEntry.slice(cartCookieKey.length + 1);
  if (!encodedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(encodedValue)) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

export function writeCartCookie(items: CartItem[]) {
  const payload = encodeURIComponent(JSON.stringify(items));
  document.cookie = `${cartCookieKey}=${payload}; path=/; max-age=${cartCookieMaxAgeSeconds}; SameSite=Lax`;
}
