import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../lib/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const response = await fetch(apiUrl("/api/users/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; token?: string };
      if (!response.ok || !data.ok || !data.token) {
        throw new Error(data.message ?? "Could not log in.");
      }

      localStorage.setItem("scentcraft_token", data.token);
      window.dispatchEvent(new Event("scentcraft-auth-changed"));
      setStatusType("success");
      setStatusMessage(data.message ?? "Logged in successfully.");
      form.reset();
      navigate("/portal");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not log in.";
      setStatusType("error");
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-shell">
        <aside className="login-hero">
          <p className="login-eyebrow">Scent Craft Member</p>
          <h2>Welcome Back</h2>
          <p>Log in to manage bookings, save your scent profile, and access your custom blends.</p>
        </aside>

        <article className="login-card">
          <h3>Login</h3>
          <p>Sign in with your account details.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email Address
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>

            <label>
              Password
              <input type="password" name="password" placeholder="Your password" required />
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </button>

            {statusMessage ? (
              <p className={`login-status ${statusType === "error" ? "is-error" : "is-success"}`}>
                {statusMessage}
              </p>
            ) : null}

            <p className="login-switch">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </form>
        </article>
      </div>
    </section>
  );
}

export default Login;
