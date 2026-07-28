"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
};

export function ReviewSection({
  productId,
  reviews,
  loggedIn
}: {
  productId: string;
  reviews: Review[];
  loggedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment })
    });
    const data = (await response.json()) as { error?: string; message?: string };
    setSubmitting(false);

    if (!response.ok) {
      setMessage(data.error || "Could not submit your review.");
      return;
    }

    setComment("");
    setMessage(
      data.message ||
        "Thank you. Your review will appear after admin approval."
    );
  }

  return (
    <section className="reviews-section">
      <div className="reviews-summary">
        <p className="eyebrow">Customer Reviews</p>
        <h2>Thoughts from the Mahi community</h2>
        <div className="review-average">
          <strong>{average ? average.toFixed(1) : "New"}</strong>
          <span>
            <span className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={17}
                  fill={star <= Math.round(average) ? "currentColor" : "none"}
                />
              ))}
            </span>
            {reviews.length
              ? `Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""}`
              : "Be the first to review this product"}
          </span>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.length ? (
          reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill={star <= review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p>{review.comment}</p>
              <footer>
                <strong>{review.user.name}</strong>
                <span>
                  {new Intl.DateTimeFormat("en-PK", {
                    dateStyle: "medium"
                  }).format(new Date(review.createdAt))}
                </span>
              </footer>
            </article>
          ))
        ) : (
          <div className="empty-review">
            No approved reviews yet. Share your experience after logging in.
          </div>
        )}
      </div>

      <div className="review-form-wrap">
        <h3>Write a review</h3>
        {loggedIn ? (
          <form onSubmit={submit} className="review-form">
            <label>
              Your rating
              <span className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    aria-label={`${star} stars`}
                  >
                    <Star
                      size={23}
                      fill={star <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </span>
            </label>
            <label>
              Your review
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={10}
                maxLength={1000}
                required
                placeholder="Tell us about the fit, fabric, and your experience."
              />
            </label>
            <button
              className="button button-dark"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            {message ? <p className="form-message">{message}</p> : null}
          </form>
        ) : (
          <p>
            Please <Link href="/login">log in</Link> to add a product review.
          </p>
        )}
      </div>
    </section>
  );
}
