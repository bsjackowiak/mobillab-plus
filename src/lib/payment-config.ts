export type PaymentMode = "demo" | "live";
export type PaymentProvider = "payu" | "przelewy24" | "stripe";

export function getPaymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE?.toLowerCase();
  if (mode === "live") return "live";
  return "demo";
}

export function getPaymentProvider(): PaymentProvider | null {
  const provider = process.env.PAYMENT_PROVIDER?.toLowerCase();
  if (provider === "payu" || provider === "przelewy24" || provider === "stripe") {
    return provider;
  }
  return null;
}

export function isLivePaymentConfigured(): boolean {
  if (getPaymentMode() !== "live") return false;
  const provider = getPaymentProvider();
  if (provider === "payu") {
    return Boolean(
      process.env.PAYU_POS_ID &&
        process.env.PAYU_CLIENT_ID &&
        process.env.PAYU_CLIENT_SECRET &&
        process.env.PAYU_MD5_KEY,
    );
  }
  if (provider === "przelewy24") {
    return Boolean(process.env.P24_MERCHANT_ID && process.env.P24_CRC_KEY);
  }
  if (provider === "stripe") {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
  return false;
}

export type CheckoutClientConfig = {
  mode: PaymentMode;
  provider: PaymentProvider | null;
  liveReady: boolean;
};

export function getCheckoutClientConfig(): CheckoutClientConfig {
  const mode = getPaymentMode();
  const provider = getPaymentProvider();
  return {
    mode,
    provider,
    liveReady: mode === "live" && isLivePaymentConfigured(),
  };
}
