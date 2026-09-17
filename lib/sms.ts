const BASE_URL = "https://sms.txtaro.com/api/v1/sms/send";

function requireApiKey(): string {
  const key = process.env.TXTARO_API_KEY;
  if (!key) throw new Error("TXTARO_API_KEY is not configured.");
  return key;
}

/** Converts a local Ghanaian number ("0245123456") plus its country code
 * ("+233") into the E.164 format Txtaro expects ("+233245123456"). */
export function toE164(localPhone: string, countryCode: string): string {
  const digits = localPhone.replace(/\D/g, "");
  const local = digits.startsWith("0") ? digits.slice(1) : digits;
  return `+${countryCode.replace(/\D/g, "")}${local}`;
}

export async function sendSms(internationalPhone: string, message: string): Promise<void> {
  await fetch(BASE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${requireApiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      to: internationalPhone,
      message,
      sender_id: process.env.TXTARO_SENDER_ID ?? "MaxBet",
    }),
  });
}
