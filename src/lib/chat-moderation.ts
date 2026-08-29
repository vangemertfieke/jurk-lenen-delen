/**
 * DressLoop Chat Safety & Moderation System
 * Prevents sharing phone numbers, Instagram handles, emails, URLs, and off-platform contact details.
 */

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  detectedType?: "phone" | "social" | "email" | "url" | "offplatform";
  sanitizedText: string;
}

// Phone numbers (Dutch 06, +31, numbers separated by spaces/dots/hyphens, spaced digits)
const PHONE_PATTERNS = [
  /(?:\+?31|0)[\s.-]*6[\s.-]*(?:\d[\s.-]*){8}\b/i,
  /\b06[\s.-]*(?:\d[\s.-]*){8}\b/i,
  /\b(?:\d[\s.-]*){9,12}\b/i,
  /\b(nul\s*zes|0\s*6)(\s*\d){8}\b/i,
];

// Email addresses (standard and obscured formats like name [at] gmail [dot] com)
const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
  /[a-zA-Z0-9._%+-]+\s*\[\s*(?:at|@)\s*\]\s*[a-zA-Z0-9.-]+\s*\[\s*(?:dot|\.)\s*\]\s*[a-zA-Z]{2,}/i,
  /[a-zA-Z0-9._%+-]+\s+(?:at|@)\s+[a-zA-Z0-9.-]+\s+(?:dot|\.)\s+[a-zA-Z]{2,}/i,
];

// Social media handles, Instagram, WhatsApp, Snapchat, TikTok
const SOCIAL_PATTERNS = [
  /@[\w._]{3,30}\b/i,
  /\b(?:instagram|insta|ig|snapchat|snap|tiktok|whatsapp|wa)\b[\s.:]*@?[\w._]+/i,
  /instagram\.com\/[\w._]+/i,
  /wa\.me\/\d+/i,
];

// Website links & URLs
const URL_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /\b[a-zA-Z0-9.-]+\.(?:nl|com|be|eu|org|net|de|co|app)\b/i,
];

// Phrases explicitly asking for off-platform contact
const OFF_PLATFORM_PATTERNS = [
  /\b(?:app\s*me|stuur\s+(?:een\s+)?appje|stuur\s+(?:een\s+)?wa|bel\s*me|bel\s*mij|mijn\s*nummer|mijn\s*mobiel|zoek\s*me\s*op|dm\s*me|stuur\s*(?:een\s*)?dm|stuur\s*(?:een\s*)?pb)\b/i,
];

export function validateChatMessage(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { allowed: true, sanitizedText: text };
  }

  // Check phone numbers
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Om de veiligheid van kopers en verhuurders te garanderen mogen er geen telefoonnummers gedeeld worden in de chat.",
        detectedType: "phone",
        sanitizedText: trimmed.replace(pattern, "[telefoonnummer afgeschermd]"),
      };
    }
  }

  // Check email
  for (const pattern of EMAIL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "E-mailadressen mogen niet gedeeld worden in de chat. Alle communicatie verlopen veilig via DressLoop.",
        detectedType: "email",
        sanitizedText: trimmed.replace(pattern, "[e-mailadres afgeschermd]"),
      };
    }
  }

  // Check Instagram & social handles
  for (const pattern of SOCIAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Instagram-namen of social media accounts mogen niet gedeeld worden om contact buiten het platform te voorkomen.",
        detectedType: "social",
        sanitizedText: trimmed.replace(pattern, "[social media afgeschermd]"),
      };
    }
  }

  // Check URLs
  for (const pattern of URL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Externe links mogen niet gedeeld worden in de chat.",
        detectedType: "url",
        sanitizedText: trimmed.replace(pattern, "[link afgeschermd]"),
      };
    }
  }

  // Check off-platform keywords
  for (const pattern of OFF_PLATFORM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Contact buiten DressLoop om is niet toegestaan. Zo blijven betalingen en afspraken beschermd.",
        detectedType: "offplatform",
        sanitizedText: trimmed.replace(pattern, "[contactverzoek afgeschermd]"),
      };
    }
  }

  return {
    allowed: true,
    sanitizedText: trimmed,
  };
}
