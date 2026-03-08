import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../../lib/api";
import { readCartCookie, writeCartCookie } from "../../lib/cartCookie";
import type { CartItem } from "../../lib/cartCookie";
import "./Portal.css";

function Portal() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setCartItems(readCartCookie());

    const token = localStorage.getItem("scentcraft_token");
    if (!token) {
      return;
    }

    let ignore = false;
    async function loadProfileCart() {
      try {
        const response = await fetch(apiUrl("/api/users/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user?: { name?: string; cartItems?: CartItem[] } };
        if (ignore) {
          return;
        }

        const profileCart = Array.isArray(data.user?.cartItems) ? data.user.cartItems : [];
        const profileName = typeof data.user?.name === "string" ? data.user.name.trim() : "";
        setUserName(profileName);
        setCartItems(profileCart);
        writeCartCookie(profileCart);
        window.dispatchEvent(new Event("scentcraft-cart-changed"));
      } catch {
        // Keep cookie cart as fallback when server read fails.
      }
    }

    void loadProfileCart();
    return () => {
      ignore = true;
    };
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + item.priceValue * item.quantity, 0),
    [cartItems],
  );

  return (
    <section className="portal-page">
      <div className="portal-card">
        <h2>{userName ? `Welcome to your portal "${userName}"` : "Welcome to your portal"}</h2>
        <p>You are logged in successfully.</p>
        <div className="portal-cart">
          <h3>My Cart ({cartCount})</h3>
          {cartItems.length === 0 ? (
            <p className="portal-cart-empty">No items selected yet.</p>
          ) : (
            <>
              <ul className="portal-cart-list">
                {cartItems.map((item) => (
                  <li key={item.fileName} className="portal-cart-item">
                    <span className="portal-cart-item-main">
                      <img
                        src={`/perfume taste/${encodeURIComponent(item.fileName)}`}
                        alt={item.name}
                        className="portal-cart-item-image"
                        loading="lazy"
                      />
                      <span>{item.name}</span>
                    </span>
                    <span>
                      x{item.quantity} - ${item.priceValue * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="portal-cart-total">Total: ${cartTotalPrice}</p>
              <Link to="/payment" className="portal-payment-button">
                Go to payment
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Portal;
