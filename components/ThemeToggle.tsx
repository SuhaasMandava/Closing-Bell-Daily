"use client";

/**
 * Flips between light and dark and remembers the choice.
 *
 * Deliberately stateless: which icon shows is decided in CSS from the root
 * data-theme attribute, so the button renders correctly on the server, during
 * the pre-hydration paint, and after. No useEffect, no mismatch, no flash.
 */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const explicit = root.getAttribute("data-theme");
    const isDark =
      explicit === "dark" ||
      (!explicit &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or storage disabled — the toggle still works per-page.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
    >
      <svg
        className="to-dark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      <svg
        className="to-light"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
