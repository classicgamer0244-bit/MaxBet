/**
 * Payments via Flutterwave — direct server-side integration.
 *
 * MaxBet now holds its own Flutterwave credentials. All charges, status
 * checks, and webhook verification happen here, with no intermediary service.
 *
 * ## Env vars required
 *   FLUTTERWAVE_SECRET_KEY   — your Flutterwave secret key (sk_…)
 *   FLUTTERWAVE_PUBLIC_KEY   — your Flutterwave public key (FLWPUBK…)
 *   FLUTTERWAVE_WEBHOOK_HASH — the webhook secret hash set in the FLW dashboard
 *
 * ## The id model
 *
 * Flutterwave accepts an arbitrary `tx_ref`, so our own `dep_…` reference IS
 * the gateway reference — no second id to mint and join on.
 * `gatewayTransactionId` holds Flutterwave's numeric transaction id once a
 * charge completes, purely for support lookups.
 */

const FLW_BASE = "https://api.flutterwave.com/v3";
const REQUEST_TIMEOUT_MS = 20_000;

export class PaymentsServiceError extends Error {
  body: unknown = null;
}

/** A misconfiguration — missing env vars. Retrying cannot help. */
export class PaymentsServiceConfigError extends PaymentsServiceError {}

function requireConfig(): { secretKey: string; publicKey: string } {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  const publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
  if (!secretKey) throw new PaymentsServiceConfigError("FLUTTERWAVE_SECRET_KEY is not configured.");
  if (!publicKey) throw new PaymentsServiceConfigError("FLUTTERWAVE_PUBLIC_KEY is not configured.");
  return { secretKey, publicKey };
}

/** Maps Flutterwave's status vocabulary onto ours. Unknown statuses stay
 * PENDING — an unknown status must never be read as either "credit" or "fail".
 * MISMATCH maps to PENDING: the customer was debited but a check disagreed —
 * left open for manual resolution rather than silently losing their money. */
export function toTransactionStatus(status: string): "PENDING" | "SUCCESS" | "FAILED" {
  const s = status.trim().toUpperCase();
  if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "COMPLETED") return "SUCCESS";
  if (s === "FAILED" || s === "CANCELLED" || s === "CANCELED" || s === "DECLINED" || s === "ERROR") return "FAILED";
  return "PENDING";
}

export const isMismatch = (status: string): boolean =>
  status.trim().toUpperCase() === "MISMATCH";

async function flwFetch<T>(path: string, init: RequestInit): Promise<T> {
  const { secretKey } = requireConfig();

  let res: Response;
  try {
    res = await fetch(`${FLW_BASE}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    throw new PaymentsServiceError(`Flutterwave request failed (network) for ${path}: ${detail}`);
  }

  const text = await res.text();

  if (!res.ok) {
    let detail = text.slice(0, 200);
    let parsedBody: unknown = null;
    try {
      const parsed = JSON.parse(text) as { message?: unknown };
      parsedBody = parsed;
      if (parsed?.message) detail = String(parsed.message);
    } catch { /* Not JSON */ }

    const failure = new PaymentsServiceError(
      `Flutterwave ${path} failed (HTTP ${res.status}): ${detail}`
    );
    failure.body = parsedBody;
    throw failure;
  }

  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new PaymentsServiceError(
      `Flutterwave returned non-JSON for ${path} (HTTP ${res.status}): ${text.slice(0, 200)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Inline checkout (card + browser-side MoMo modal)
// ---------------------------------------------------------------------------

/** What the browser needs to open the Flutterwave Inline modal. */
export interface CheckoutConfig {
  publicKey: string;
  tx_ref: string;
  /** MAJOR units. */
  amount: number;
  currency: string;
  paymentOptions: string;
  customer: { email: string; name?: string; phone_number?: string };
  customizations: { title?: string; description?: string };
  meta: Record<string, string | number>;
}

export interface InitiateInput {
  reference: string;
  amountMinor: number;
  customer: { email: string; name?: string; phone?: string };
  channel?: "mobile_money" | "card" | "any";
  metadata?: Record<string, string | number>;
}

/**
 * Builds the checkout config the browser needs to open the Flutterwave modal.
 * No network call — the public key comes straight from env.
 */
export function createCheckout(input: InitiateInput): CheckoutConfig {
  const { publicKey } = requireConfig();
  const amountMajor = input.amountMinor / 100;

  const paymentOptions =
    input.channel === "card"
      ? "card"
      : input.channel === "mobile_money"
      ? "mobilemoneyghana"
      : "card,mobilemoneyghana";

  return {
    publicKey,
    tx_ref: input.reference,
    amount: amountMajor,
    currency: "GHS",
    paymentOptions,
    customer: {
      email: input.customer.email,
      name: input.customer.name,
      phone_number: input.customer.phone,
    },
    customizations: { title: "MaxBet", description: `Deposit ${input.reference}` },
    meta: { ...input.metadata },
  };
}

// ---------------------------------------------------------------------------
// Server-side Ghana MoMo charge
// ---------------------------------------------------------------------------

/** v3 Ghana wire values — legacy branding, not current brand names. */
export type MomoNetworkCode = "MTN" | "VODAFONE" | "TIGO";

export interface MomoChargeInput {
  reference: string;
  amountMinor: number;
  network: MomoNetworkCode;
  phone: string;
  otp?: string;
  voucher?: string;
  providerRef?: string | null;
  customer: { email: string; name?: string };
  metadata?: Record<string, string | number>;
  clientIp?: string;
  redirectUrl?: string;
}

export interface MomoChargeResult {
  ok: boolean;
  action?: "redirect" | "await_approval" | "otp_required";
  redirectUrl?: string | null;
  instruction?: string | null;
  provider?: string;
  providerRef?: string | null;
  error?: string;
  gateway?: unknown;
}

/**
 * Starts a Ghana Mobile Money charge server-side via Flutterwave v3.
 *
 * `ok: true` means the charge was accepted for authorisation — never that
 * money moved. Only checkPaymentStatus() may decide that.
 */
export async function createMomoCharge(input: MomoChargeInput): Promise<MomoChargeResult> {
  const amountMajor = input.amountMinor / 100;

  const body: Record<string, unknown> = {
    tx_ref: input.reference,
    amount: amountMajor,
    currency: "GHS",
    network: input.network,
    email: input.customer.email,
    fullname: input.customer.name,
    phone_number: input.phone,
    ...(input.otp ? { otp: input.otp } : {}),
    ...(input.voucher ? { voucher: input.voucher } : {}),
    ...(input.clientIp ? { client_ip: input.clientIp } : {}),
    ...(input.redirectUrl ? { redirect_url: input.redirectUrl } : {}),
    meta: input.metadata ?? {},
  };

  // OTP retry: re-authorize the existing charge rather than starting a new one.
  if (input.providerRef) body.flw_ref = input.providerRef;

  let raw: unknown;
  try {
    raw = await flwFetch<unknown>("/charges?type=mobile_money_ghana", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw err;
  }

  const resp = raw as {
    status?: string;
    message?: string;
    data?: {
      id?: number;
      flw_ref?: string;
      status?: string;
      auth_mode?: string;
      redirect?: string;
      processor_response?: string;
    };
    meta?: { authorization?: { redirect?: string; mode?: string; validate_instructions?: string } };
  };

  const authMode = resp.meta?.authorization?.mode ?? resp.data?.auth_mode;
  const redirectUrl = resp.meta?.authorization?.redirect ?? resp.data?.redirect ?? null;

  // The captcha-verification flow (auth_mode "redirect") replies with just
  // `{ status: "success", meta: { authorization: { mode: "redirect", ... } } }`
  // — no `data` object at all, so no `data.status` to check. Treat a valid
  // redirect authorization as OK on its own; every other path still requires
  // the usual data.status PENDING/SUCCESS.
  const dataStatus = resp.data?.status?.toUpperCase();
  const hasRedirectAuth = authMode === "redirect" && Boolean(redirectUrl);
  const isOk =
    resp.status === "success" && (dataStatus === "PENDING" || dataStatus === "SUCCESS" || hasRedirectAuth);

  if (!isOk) {
    return {
      ok: false,
      error: resp.message ?? resp.data?.processor_response ?? "The network declined the payment.",
      gateway: raw,
    };
  }

  let action: MomoChargeResult["action"] = "await_approval";
  if (authMode === "redirect" && redirectUrl) action = "redirect";
  else if (authMode === "otp" || authMode === "validate") action = "otp_required";

  return {
    ok: true,
    action,
    redirectUrl: redirectUrl ?? null,
    instruction: resp.meta?.authorization?.validate_instructions ?? null,
    provider: "flutterwave",
    providerRef: resp.data?.flw_ref ? String(resp.data.flw_ref) : null,
    gateway: raw,
  };
}

// ---------------------------------------------------------------------------
// Payment status verification
// ---------------------------------------------------------------------------

export interface PaymentStatusResult {
  status: string;
  transactionId: number | null;
  amountMajor: number | null;
  raw: unknown;
}

/**
 * Server-to-server confirmation of a deposit's outcome.
 *
 * This is the ONLY thing allowed to decide that money arrived. The webhook is
 * treated purely as a hint to come and ask — verify, don't trust.
 */
export async function checkPaymentStatus(
  reference: string,
  amountMinor: number,
  _gateway: { provider?: string | null; providerRef?: string | null } = {}
): Promise<PaymentStatusResult> {
  const raw = await flwFetch<{
    status?: string;
    data?: Array<{
      id?: number;
      status?: string;
      amount?: number;
      currency?: string;
      tx_ref?: string;
    }>;
  }>(`/transactions?tx_ref=${encodeURIComponent(reference)}`, { method: "GET" });

  const txn = raw.data?.[0];

  if (!txn) {
    // No record at Flutterwave yet — still pending.
    return { status: "PENDING", transactionId: null, amountMajor: null, raw };
  }

  const flwStatus = txn.status ?? "pending";
  const mapped = toTransactionStatus(flwStatus);

  // Amount mismatch check — the gateway confirmed a charge but for a different
  // amount. Left as MISMATCH so a human can investigate rather than silently
  // crediting the wrong figure.
  if (mapped === "SUCCESS" && typeof txn.amount === "number") {
    const expectedMajor = amountMinor / 100;
    if (Math.abs(txn.amount - expectedMajor) > 0.01) {
      return { status: "MISMATCH", transactionId: txn.id ?? null, amountMajor: txn.amount, raw };
    }
  }

  return {
    status: mapped === "SUCCESS" ? "SUCCESS" : mapped === "FAILED" ? "FAILED" : flwStatus,
    transactionId: txn.id ?? null,
    amountMajor: typeof txn.amount === "number" ? txn.amount : null,
    raw,
  };
}

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------

/**
 * Verifies the `verif-hash` header Flutterwave sends with every webhook.
 * Returns true only when the header matches FLUTTERWAVE_WEBHOOK_HASH exactly.
 */
export function verifyWebhookSignature(providedHash: string | null): boolean {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!expected || !providedHash) return false;
  // Constant-time comparison to prevent timing attacks.
  const a = Buffer.from(providedHash);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  const { timingSafeEqual } = require("node:crypto") as typeof import("node:crypto");
  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Helpers — kept for call-site compatibility
// ---------------------------------------------------------------------------

export function gatewayRefFrom(txn: {
  gatewayTransactionId?: string | null;
  gatewayRaw?: unknown;
}): { provider?: string; providerRef?: string } {
  return {
    provider: "flutterwave",
    ...(txn.gatewayTransactionId ? { providerRef: txn.gatewayTransactionId } : {}),
  };
}

/** Always false now — there is only one gateway and it cannot be "retired". */
export function isRetiredProviderError(_err: unknown): boolean {
  return false;
}
