import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { readCartCookie } from "../../lib/cartCookie";
import type { CartItem } from "../../lib/cartCookie";
import "./Navbar.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
];

const guestLinks = [
  { to: "/register", label: "Register" },
  { to: "/login", label: "Login" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("scentcraft_token")));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("scentcraft-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("scentcraft-auth-changed", syncAuthState);
    };
  }, []);

  useEffect(() => {
    const syncCartState = () => {
      setCartItems(readCartCookie());
    };

    syncCartState();
    window.addEventListener("storage", syncCartState);
    window.addEventListener("focus", syncCartState);
    window.addEventListener("scentcraft-cart-changed", syncCartState);

    return () => {
      window.removeEventListener("storage", syncCartState);
      window.removeEventListener("focus", syncCartState);
      window.removeEventListener("scentcraft-cart-changed", syncCartState);
    };
  }, []);

  useEffect(() => {
    setIsCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!cartDropdownRef.current) {
        return;
      }

      if (!cartDropdownRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    if (!isCartOpen) {
      return;
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCartOpen]);

  const handleLogout = () => {
    localStorage.removeItem("scentcraft_token");
    window.dispatchEvent(new Event("scentcraft-auth-changed"));
    navigate("/");
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + item.priceValue * item.quantity, 0),
    [cartItems],
  );

  return (
    <>
      <div className="top-ribbon">Design a scent that feels like you.</div>
      <header className="site-header">
        <div className="container nav-wrapper">
          <h1 className="brand">S C E N T C R A F T</h1>
          <nav className="nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated
              ? guestLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                  >
                    {link.label}
                  </NavLink>
                ))
              : (
                <button type="button" className="nav-link nav-button" onClick={handleLogout}>
                  Logout
                </button>
              )}
            <div className="nav-cart" ref={cartDropdownRef}>
              <button
                type="button"
                className="nav-cart-button"
                aria-label={`Shopping cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
                aria-expanded={isCartOpen}
                aria-controls="navbar-cart-dropdown"
                onClick={() => setIsCartOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-cart-icon">
                  <path
                    d="M8 7V6a4 4 0 0 1 8 0v1m-9 0h10a1 1 0 0 1 1 1l-1 11a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8a1 1 0 0 1 1-1Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {cartCount > 0 ? <span className="nav-cart-count">{cartCount}</span> : null}
              </button>
              {isCartOpen ? (
                <div id="navbar-cart-dropdown" className="nav-cart-dropdown" role="dialog" aria-label="My cart">
                  <p className="nav-cart-title">My Cart ({cartCount})</p>
                  {cartItems.length === 0 ? (
                    <p className="nav-cart-empty">No items selected yet.</p>
                  ) : (
                    <>
                      <ul className="nav-cart-list">
                        {cartItems.map((item) => (
                          <li key={item.fileName} className="nav-cart-item">
                            <span>{item.name}</span>
                            <span>
                              x{item.quantity} - ${item.priceValue * item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="nav-cart-total">Total: ${cartTotalPrice}</p>
                    </>
                  )}
                  <Link to="/portal" className="nav-cart-link" onClick={() => setIsCartOpen(false)}>
                    Open Cart Page
                  </Link>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Navbar;
