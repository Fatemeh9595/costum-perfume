import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../lib/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const family = String(formData.get("family") ?? "").trim();
    const experience = String(formData.get("experience") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const consent = formData.get("consent") === "on";

    if (password !== confirmPassword) {
      setStatusType("error");
      setStatusMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const response = await fetch(apiUrl("/api/users/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          family,
          experience,
          notes,
          consent,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Could not create account.");
      }

      const loginResponse = await fetch(apiUrl("/api/users/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = (await loginResponse.json()) as { ok?: boolean; token?: string; message?: string };

      if (!loginResponse.ok || !loginData.ok || !loginData.token) {
        throw new Error(loginData.message ?? "Account created, but automatic login failed.");
      }

      localStorage.setItem("scentcraft_token", loginData.token);
      window.dispatchEvent(new Event("scentcraft-auth-changed"));
      setStatusType("success");
      setStatusMessage("Account created and logged in successfully.");
      form.reset();
      navigate("/portal");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create account.";
      setStatusType("error");
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="register-page">
      <div className="register-shell">
        <aside className="register-hero">
          <p className="register-eyebrow">Scent Craft Member</p>
          <h2>Create Your Fragrance Profile</h2>
          <p>
            Join the studio to book sessions faster, save your favorite notes, and track your custom
            blends.
          </p>
          <ul>
            <li>Priority booking for in-studio sessions</li>
            <li>Save your scent preferences and formulas</li>
            <li>Get launch updates and seasonal collections</li>
          </ul>
        </aside>

        <article className="register-card">
          <h3>Register</h3>
          <p>Start your account in under a minute.</p>

          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input type="text" name="name" placeholder="Your name" required />
            </label>

            <label>
              Email Address
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>

            <div className="register-row">
              <label>
                Password
                <input type="password" name="password" placeholder="At least 8 characters" required />
              </label>
              <label>
                Confirm Password
                <input type="password" name="confirmPassword" placeholder="Repeat password" required />
              </label>
            </div>

            <div className="register-row">
              <label>
                Preferred Scent Family
                <select name="family" defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  <option value="floral">Floral</option>
                  <option value="fruity">Fruity</option>
                  <option value="woody">Woody</option>
                  <option value="fresh">Fresh</option>
                  <option value="oriental">Oriental</option>
                </select>
              </label>
              <label>
                Experience Level
                <select name="experience" defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  <option value="new">New to perfume</option>
                  <option value="curious">Curious explorer</option>
                  <option value="enthusiast">Fragrance enthusiast</option>
                </select>
              </label>
            </div>

            <label>
              What kind of scent are you looking for?
              <textarea
                name="notes"
                rows={4}
                placeholder="Example: warm vanilla with soft floral notes for evening wear"
              />
            </label>

            <label className="register-consent">
              <input type="checkbox" name="consent" required />I agree to the terms and privacy policy.
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
            {statusMessage ? (
              <p className={`register-status ${statusType === "error" ? "is-error" : "is-success"}`}>
                {statusMessage}
              </p>
            ) : null}
            <p className="register-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </article>
      </div>
    </section>
  );
}

export default Register;
