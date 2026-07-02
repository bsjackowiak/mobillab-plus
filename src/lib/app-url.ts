export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export function orderPublicUrl(accessToken: string): string {
  return `${getAppBaseUrl()}/zamowienie/${accessToken}`;
}

export function paymentWaitingUrl(accessToken: string): string {
  return `${getAppBaseUrl()}/platnosc/${accessToken}`;
}
