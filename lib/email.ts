export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.log(`[password-reset] ${email} -> ${resetUrl}`);
    return true;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Set your new password for Mahi Collection",
      html: `<p>Hello,</p><p>You requested to reset your password for Mahi Collection.</p><p><a href="${resetUrl}">Click here to set a new password</a></p><p>If you did not request this, you can ignore this email.</p>`
    })
  });

  if (!response.ok) {
    console.error("Failed to send password reset email", await response.text());
    return false;
  }

  return true;
}
