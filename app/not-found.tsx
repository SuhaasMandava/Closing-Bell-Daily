import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <p className="eyebrow">404</p>
      <h1>No such issue</h1>
      <p>
        That session doesn&apos;t exist — the bell hasn&apos;t rung on it yet,
        or the link is wrong.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <Link className="btn" href="/">
          ← All issues
        </Link>
      </p>
    </section>
  );
}
