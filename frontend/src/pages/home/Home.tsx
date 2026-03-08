import { useEffect } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const scentImages = Array.from({ length: 18 }, (_, index) => `/scents/scent${index + 1}.avif`);

function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".home [data-reveal]");
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
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      <section
        className="hero-section"
        style={{ backgroundImage: "url('/overall/pic11.webp')" }}
        aria-label="Design your own signature perfume"
      >
        <div className="hero-overlay">
          <div className="hero-content container">
            <h2 data-reveal>Design Your Signature Perfume</h2>
            <p data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
              Blend a scent that matches your personality, mood, and style.
            </p>
            <Link
              to="/register"
              className="cta-dark"
              data-reveal
              style={{ "--reveal-delay": "220ms" } as CSSProperties}
            >
              Book Session
            </Link>
          </div>
        </div>
      </section>

      <section className="split-section container">
        <div className="split-copy" data-reveal="left">
          <h3 data-reveal>Studio Blending Session</h3>
          <p data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            Visit Scent Craft for a guided, hands-on perfume workshop. You will explore notes,
            compare accords, and create a blend that is uniquely yours in a private appointment.
          </p>
          <Link
            to="/register"
            className="cta-light"
            data-reveal
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
          >
            Book Session
          </Link>
        </div>
        <div className="split-image" data-reveal="right">
          <img src="/overall/pic4.jpg" alt="DIY perfume workshop experience" data-reveal="zoom" />
        </div>
      </section>

      <section className="split-section split-reverse container">
        <div className="split-image" data-reveal="left">
          <img src="/overall/pic2.jpg" alt="Made-to-order perfume" data-reveal="zoom" />
        </div>
        <div className="split-copy" data-reveal="right">
          <h3 data-reveal>Custom Orders Online</h3>
          <p data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            Build your fragrance profile online and we will craft it for delivery. It is a thoughtful
            gift for birthdays, weddings, and special occasions.
          </p>
          <Link
            to="/contact"
            className="cta-light"
            data-reveal
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
          >
            Start Request
          </Link>
        </div>
      </section>

      <section className="bottle-section container">
        <h3 data-reveal>Pick Your Bottle</h3>
        <p data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
          Choose the bottle design that best fits your final blend.
        </p>
        <p data-reveal style={{ "--reveal-delay": "140ms" } as CSSProperties}>
          Sizes available: 15ml, 30ml, and 50ml.
        </p>
        <div className="bottle-strip" data-reveal="zoom" style={{ "--reveal-delay": "200ms" } as CSSProperties}>
          <img src="/overall/pic8.avif" alt="Perfume bottle options" />
        </div>
      </section>

      <section className="scent-section container">
        <h3 data-reveal>Select Your Notes</h3>
        <p data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
          Explore ingredients and choose the notes you want in your fragrance story.
        </p>
        <div className="scent-grid">
          {scentImages.map((image, index) => (
            <figure
              key={image}
              className="scent-card"
              data-reveal="zoom"
              style={{ "--reveal-delay": `${(index % 6) * 50}ms` } as CSSProperties}
            >
              <img src={image} alt={`Scent option ${index + 1}`} loading="lazy" />
            </figure>
          ))}
        </div>
        <div className="scent-feature-overlay" aria-label="Workshop highlights">
          <article className="scent-feature-card" data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
            <h4>Explore</h4>
            <p>Discover how top, heart, and base notes shape a balanced perfume.</p>
          </article>
          <article className="scent-feature-card" data-reveal style={{ "--reveal-delay": "140ms" } as CSSProperties}>
            <h4>Blend</h4>
            <p>Work with premium ingredients to build a scent profile you truly love.</p>
          </article>
          <article className="scent-feature-card" data-reveal style={{ "--reveal-delay": "200ms" } as CSSProperties}>
            <h4>Take Home</h4>
            <p>Leave with your own custom perfume, made in-studio by your own hands.</p>
          </article>
        </div>
        <div className="scent-feature" data-reveal="zoom" style={{ "--reveal-delay": "120ms" } as CSSProperties}>
          <img src="/overall/pic12.webp" alt="Custom perfume ingredients and bottles" loading="lazy" />
        </div>
      </section>
    </div>
  );
}

export default Home;
