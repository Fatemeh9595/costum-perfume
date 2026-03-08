import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import PerfumeCard from "../../components/perfume-card/PerfumeCard";
import { apiUrl } from "../../lib/api";
import { readCartCookie, writeCartCookie } from "../../lib/cartCookie";
import type { CartItem } from "../../lib/cartCookie";
import "./Shop.css";

type TasteType = "fruity" | "herbal" | "floral";

type PerfumeTaste = {
  fileName: string;
  name: string;
  description: string;
  tasteType: TasteType;
  priceValue: number;
};

function Shop() {
  const [items, setItems] = useState<PerfumeTaste[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tasteFilter, setTasteFilter] = useState<"all" | TasteType>("all");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPerfumes() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(apiUrl("/api/shop-perfumes"), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load perfumes (${response.status})`);
        }
        const data = (await response.json()) as PerfumeTaste[];
        setItems(data);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        setLoadError("Could not load shop perfumes from database.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPerfumes();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setCartItems(readCartCookie());
    setIsCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!isCartHydrated) {
      return;
    }

    writeCartCookie(cartItems);
    window.dispatchEvent(new Event("scentcraft-cart-changed"));
    const token = localStorage.getItem("scentcraft_token");
    if (!token) {
      return;
    }

    void fetch(apiUrl("/api/users/cart"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cartItems }),
    });
  }, [cartItems, isCartHydrated]);

  useEffect(() => {
    if (!isCartHydrated) {
      return;
    }

    if (cartItems.length > 0) {
      return;
    }

    const token = localStorage.getItem("scentcraft_token");
    if (!token) {
      return;
    }

    let ignore = false;
    async function loadCartFromProfile() {
      try {
        const response = await fetch(apiUrl("/api/users/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user?: { cartItems?: CartItem[] } };
        if (ignore) {
          return;
        }

        const profileCart = Array.isArray(data.user?.cartItems) ? data.user.cartItems : [];
        if (profileCart.length > 0) {
          setCartItems(profileCart);
          writeCartCookie(profileCart);
        }
      } catch {
        // Keep cookie cart as source of truth when profile fetch fails.
      }
    }

    void loadCartFromProfile();
    return () => {
      ignore = true;
    };
  }, [cartItems.length, isCartHydrated]);

  const filteredPerfumes = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return items.filter((perfume) => {
      const floralKeywordMatch =
        perfume.name.toLowerCase().includes("floral") || perfume.description.toLowerCase().includes("floral");
      const matchesSearch =
        normalized.length === 0 ||
        perfume.name.toLowerCase().includes(normalized) ||
        perfume.description.toLowerCase().includes(normalized);
      const matchesTaste =
        tasteFilter === "all" ||
        perfume.tasteType === tasteFilter ||
        (tasteFilter === "floral" && floralKeywordMatch);
      const matchesPrice = maxPrice === null || perfume.priceValue <= maxPrice;
      return matchesSearch && matchesTaste && matchesPrice;
    });
  }, [items, maxPrice, searchTerm, tasteFilter]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const cards = document.querySelectorAll<HTMLElement>(".shop-grid [data-reveal-card]");
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filteredPerfumes, isLoading]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(queryInput);
    const parsedMaxPrice = Number(maxPriceInput);
    setMaxPrice(Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0 ? parsedMaxPrice : null);
  };

  const handleAddToCart = (perfume: PerfumeTaste) => {
    setCartItems((previousItems) => {
      const existing = previousItems.find((item) => item.fileName === perfume.fileName);
      if (existing) {
        return previousItems.map((item) =>
          item.fileName === perfume.fileName ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...previousItems,
        {
          fileName: perfume.fileName,
          name: perfume.name,
          priceValue: perfume.priceValue,
          quantity: 1,
        },
      ];
    });
  };

  return (
    <section className="page shop-page">
      <h2>Shop</h2>
      <p>Browse perfume taste products and choose your favorite blend.</p>
      <form className="shop-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search perfume taste..."
          value={queryInput}
          onChange={(event) => setQueryInput(event.target.value)}
          aria-label="Search perfume taste"
        />
        <select
          value={tasteFilter}
          onChange={(event) => setTasteFilter(event.target.value as "all" | TasteType)}
          aria-label="Filter by taste"
        >
          <option value="all">All tastes</option>
          <option value="fruity">Fruity</option>
          <option value="herbal">Herbal</option>
          <option value="floral">Floral</option>
        </select>
        <input
          type="number"
          min={0}
          placeholder="Max price ($)"
          value={maxPriceInput}
          onChange={(event) => setMaxPriceInput(event.target.value)}
          aria-label="Filter by maximum price"
        />
        <button type="submit">Apply</button>
      </form>

      {isLoading ? <p className="shop-empty">Loading perfumes...</p> : null}
      {!isLoading && loadError ? <p className="shop-empty">{loadError}</p> : null}
      {!isLoading && !loadError && filteredPerfumes.length === 0 ? (
        <p className="shop-empty">No perfumes found. Try another keyword.</p>
      ) : null}

      <div className="shop-grid">
        {filteredPerfumes.map((perfume, index) => (
          <PerfumeCard
            key={perfume.fileName}
            imageSrc={`/perfume taste/${encodeURIComponent(perfume.fileName)}`}
            name={perfume.name}
            description={perfume.description}
            price={`$${perfume.priceValue}`}
            revealDelayMs={(index % 4) * 70}
            onBuy={() => handleAddToCart(perfume)}
          />
        ))}
      </div>
    </section>
  );
}

export default Shop;
