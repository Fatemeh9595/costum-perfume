import "./Contact.css";

function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-overlay">
        <header className="contact-hero">
          <h2>Contact Us</h2>
          <p>We&apos;d love to hear from you. Feel free to drop us a message.</p>
        </header>

        <div className="contact-grid">
          <article className="contact-card">
            <h3>Get in Touch</h3>
            <form className="contact-form">
              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email Address" />
              <input type="tel" placeholder="Phone Number (optional)" />
              <textarea rows={6} placeholder="Your Message" />
              <button type="submit">Send Message</button>
            </form>
          </article>

          <article className="contact-card">
            <h3>Contact Information</h3>
            <ul className="contact-info-list">
              <li>
                <span className="contact-icon" aria-hidden="true">
                  📍
                </span>
                <div>
                  <strong>123 Perfume Lane</strong>
                  <span>Rome, Italy</span>
                </div>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true">
                  ☎
                </span>
                <div>
                  <strong>(+39) 3515361710</strong>
                </div>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true">
                  ✉
                </span>
                <div>
                  <strong>ewigeflamme95@gmail.com</strong>
                </div>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true">
                  ⏰
                </span>
                <div>
                  <strong>Working Hours</strong>
                  <span>Mon - Fri, 9 AM to 6 PM</span>
                </div>
              </li>
            </ul>

         </article>
        </div>
      </div>
    </section>
  );
}

export default Contact;
