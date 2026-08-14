/**
 * Shown automatically by Next while an article route is loading — e.g. a
 * slow connection on first load. Shape mirrors the real article layout
 * (eyebrow, meta, title, stat row, body lines) so it doesn't jump when the
 * content swaps in.
 */
export default function ArticleLoading() {
  return (
    <div className="article" aria-busy="true" aria-label="Loading issue">
      <div className="skeleton-line skeleton-eyebrow" />
      <div className="skeleton-line skeleton-meta" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-title short" />
      <div className="skeleton-line skeleton-summary" />

      <div className="stats compact" style={{ marginTop: "1.5rem" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="stat skeleton-stat" key={i}>
            <div className="skeleton-line skeleton-stat-label" />
            <div className="skeleton-line skeleton-stat-value" />
          </div>
        ))}
      </div>

      <div className="skeleton-body">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="skeleton-line skeleton-body-line" key={i} />
        ))}
      </div>
    </div>
  );
}
