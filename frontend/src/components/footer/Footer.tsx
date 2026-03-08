import { Link } from "react-router-dom";
import "./Footer.css";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section className="footer-block">
          <h3 className="footer-brand">S C E N T C R A F T</h3>
          <p className="footer-copy">
            Personalized fragrance sessions and small-batch custom perfumes made to reflect your
            style.
          </p>
        </section>

        <section className="footer-block">
          <h4>Explore</h4>
          <nav className="footer-links" aria-label="Footer navigation">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="footer-block">
          <h4>Studio</h4>
          <ul className="footer-info">
            <li>By appointment only</li>
            <li>Mon - Sat | 10:00 - 19:00</li>
            <li>ewigeflamme95@gmail.com</li>
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <small>© {year} Scent Craft. All rights reserved.</small>
          <small>Crafted scents for everyday rituals.</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
