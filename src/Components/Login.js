import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "../CSS_stylesheets/login.module.css";

export default function Login({ toggleForm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(email);
    console.log(password);
  }

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.loginHeading}>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className={styles.loginLabel}>
          Email
        </label>
        <input
          className={styles.loginInput}
          type="email"
          id="email"
          name="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className={styles.loginLabel}>
          Password
        </label>
        <input
          className={styles.loginInput}
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.loginCheckboxContainer}>
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="showPassword">Show Password</label>
        </div>

        <a href="#" className={styles.loginLink}>
          Forgot password?
        </a>

        <button type="submit" className={styles.loginButton}>
          Log In
        </button>

        <button
          type="button"
          className={`${styles.loginButton} ${styles.loginSecondaryButton}`}
          onClick={() => toggleForm("register")}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
