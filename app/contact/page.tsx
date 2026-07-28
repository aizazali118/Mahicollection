import {
  Mail,
  MapPin,
  MessageCircle,
  Phone
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { getStoreSettings } from "@/lib/store";

export const metadata = {
  title: "Contact Us"
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsapp = settings.whatsappNumber.replace(/\D/g, "");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">We are here to help</p>
          <h1>Contact Mahi Collection</h1>
          <p>
            Ask about sizing, stock, delivery, or an existing order. Our team
            will respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="section container contact-layout">
        <div className="contact-details">
          <p className="eyebrow">Contact details</p>
          <h2>Let’s talk</h2>
          <div className="contact-detail">
            <Phone size={20} />
            <span>
              <small>Phone</small>
              <a href={`tel:${settings.contactPhone}`}>
                {settings.contactPhone}
              </a>
            </span>
          </div>
          <div className="contact-detail">
            <Mail size={20} />
            <span>
              <small>Email</small>
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </span>
          </div>
          <div className="contact-detail">
            <MapPin size={20} />
            <span>
              <small>Location</small>
              <strong>{settings.address}</strong>
            </span>
          </div>
          <div className="contact-detail">
            <MessageCircle size={20} />
            <span>
              <small>WhatsApp</small>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                Start a conversation
              </a>
            </span>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
