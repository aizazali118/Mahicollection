export const metadata = {
  title: "Privacy Policy"
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <h2>Information we collect</h2>
      <p>
        We collect information you provide when creating an account, placing an
        order, submitting a review, using a coupon, or contacting our team. This
        may include your name, email address, phone number, delivery address,
        city, account credentials, and order notes.
      </p>
      <h2>How we use information</h2>
      <p>
        Information is used to process and confirm orders, deliver products,
        provide customer support, manage customer accounts, prevent misuse, and
        improve the Mahi Collection shopping experience.
      </p>
      <h2>Sharing and storage</h2>
      <p>
        We only share necessary order details with service providers involved
        in hosting, database storage, file storage, communication, and delivery.
        We do not sell customer information.
      </p>
      <h2>Your choices</h2>
      <p>
        You may contact us to request correction or deletion of your account
        information, subject to order, tax, fraud-prevention, and legal record
        requirements.
      </p>
    </PolicyPage>
  );
}

function PolicyPage({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="page-hero page-hero--small">
        <div className="container">
          <p className="eyebrow">Mahi Collection</p>
          <h1>{title}</h1>
        </div>
      </section>
      <article className="section container policy-content">{children}</article>
    </>
  );
}
