import { SettingsForm } from "@/components/admin/SettingsForm";
import { getStoreSettings } from "@/lib/store";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Configuration</p>
          <h1>Store settings</h1>
          <p>Update contact, social, WhatsApp, delivery, and brand content.</p>
        </div>
      </div>
      <SettingsForm
        initial={{
          announcement: settings.announcement,
          contactPhone: settings.contactPhone,
          contactEmail: settings.contactEmail,
          address: settings.address,
          facebook: settings.facebook,
          instagram: settings.instagram,
          tiktok: settings.tiktok,
          whatsappNumber: settings.whatsappNumber,
          currency: settings.currency,
          shippingFlatRate: Number(settings.shippingFlatRate),
          freeShippingThreshold: Number(settings.freeShippingThreshold),
          about: settings.about
        }}
      />
    </div>
  );
}
