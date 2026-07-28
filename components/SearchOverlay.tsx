"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/money";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  mainImage: string;
  price: number;
  collection: string;
};

export function SearchOverlay({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let resetTimer: number | undefined;
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      resetTimer = window.setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 0);
    }

    return () => {
      if (resetTimer) window.clearTimeout(resetTimer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = (await response.json()) as { products: SearchResult[] };
          setResults(data.products);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true">
      <button
        className="search-overlay__backdrop"
        type="button"
        aria-label="Close search"
        onClick={onClose}
      />
      <div className="search-panel">
        <div className="search-panel__top">
          <Search size={22} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dresses, lawn, embroidered..."
            aria-label="Search products"
          />
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={22} />
          </button>
        </div>

        <div className="search-panel__body">
          {query.trim().length < 2 ? (
            <div className="search-empty">
              <p className="eyebrow">Start typing</p>
              <h3>Find your next favourite look</h3>
              <p>Search by product title or collection.</p>
            </div>
          ) : loading ? (
            <div className="search-loading">Searching...</div>
          ) : query.trim().length >= 2 && results.length ? (
            <div className="search-results">
              {results.map((product) => (
                <Link
                  href={`/product/${product.slug}`}
                  className="search-result"
                  key={product.id}
                  onClick={onClose}
                >
                  <img src={product.mainImage} alt={product.title} />
                  <span>
                    <small>{product.collection}</small>
                    <strong>{product.title}</strong>
                    <em>{formatMoney(product.price)}</em>
                  </span>
                </Link>
              ))}
              <Link
                className="text-link search-view-all"
                href={`/shop?q=${encodeURIComponent(query)}`}
                onClick={onClose}
              >
                View all search results
              </Link>
            </div>
          ) : (
            <div className="search-empty">
              <h3>No products found</h3>
              <p>Try a different title, fabric, or collection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
