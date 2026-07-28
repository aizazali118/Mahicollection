import { DeleteButton } from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Customer support</p>
          <h1>Contact messages</h1>
          <p>Messages submitted through the Contact Us page.</p>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-message-list">
          {messages.map((message) => (
            <article key={message.id}>
              <header>
                <div>
                  <h3>{message.subject || "Store enquiry"}</h3>
                  <p>
                    <strong>{message.name}</strong> ·{" "}
                    <a href={`mailto:${message.email}`}>{message.email}</a>
                    {message.phone ? (
                      <>
                        {" "}
                        · <a href={`tel:${message.phone}`}>{message.phone}</a>
                      </>
                    ) : null}
                  </p>
                </div>
                <small>
                  {new Intl.DateTimeFormat("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(message.createdAt)}
                </small>
              </header>
              <p>{message.message}</p>
              <DeleteButton
                endpoint={`/api/admin/messages/${message.id}`}
                label="Delete message"
              />
            </article>
          ))}
          {!messages.length ? (
            <div className="empty-state">No contact messages yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
