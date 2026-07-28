import { Star } from "lucide-react";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { prisma } from "@/lib/prisma";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true, mainImage: true } }
    },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Product reviews</h1>
          <p>Only logged-in customers can submit. Approve before publishing.</p>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-review-list">
          {reviews.map((review) => (
            <article key={review.id}>
              <img src={review.product.mainImage} alt={review.product.title} />
              <div className="admin-review-content">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      fill={star <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <h3>{review.product.title}</h3>
                <p>{review.comment}</p>
                <small>
                  {review.user.name} · {review.user.email} ·{" "}
                  {new Intl.DateTimeFormat("en-PK", {
                    dateStyle: "medium"
                  }).format(review.createdAt)}
                </small>
              </div>
              <div>
                <span
                  className={`status ${review.approved ? "status--delivered" : "status--pending"}`}
                >
                  {review.approved ? "Published" : "Pending"}
                </span>
                <ReviewActions
                  reviewId={review.id}
                  approved={review.approved}
                />
              </div>
            </article>
          ))}
          {!reviews.length ? (
            <div className="empty-state">No product reviews yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
