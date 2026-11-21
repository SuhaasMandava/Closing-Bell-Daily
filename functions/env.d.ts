// lib/quotes.ts passes Next's `next: { revalidate }` fetch option; it's a no-op
// on Workers, but the type has to exist for this folder's own type-check.
interface RequestInit {
  next?: unknown;
}
