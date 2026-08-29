/**
 * DressLoop Chat Safety & Moderation System
 * Comprehensive, strict safety rules preventing sharing or asking for:
 * - Phone numbers & WhatsApp
 * - Social media (Instagram, Facebook, Snapchat, LinkedIn, TikTok, Pinterest, X/Twitter, BeReal)
 * - Email addresses
 * - Full names & last names
 * - Website URLs & links
 * - Off-platform contact requests & external payment methods (Tikkie, cash, bank transfer)
 */

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  detectedType?: "phone" | "social" | "email" | "url" | "offplatform" | "payment" | "fullname";
  sanitizedText: string;
}

// 1. Phone numbers (06, +31, spaced digits, spelled-out digits, requests for phone numbers/WhatsApp)
const PHONE_PATTERNS = [
  /(?:\+?31|0)[\s.-]*6[\s.-]*(?:\d[\s.-]*){8}\b/i,
  /\b06[\s.-]*(?:\d[\s.-]*){8}\b/i,
  /\b(?:\d[\s.-]*){9,12}\b/i,
  /\b(nul\s*zes|0\s*6)(\s*\d){8}\b/i,
  /\b(?:wat\s+is\s+je\s+(?:06|nummer|tel|telefoonnummer|mobiel)|geef\s+je\s+(?:06|nummer|tel|telefoonnummer)|mag\s+ik\s+je\s+(?:06|nummer|tel|telefoonnummer)|stuur\s+je\s+(?:06|nummer|tel|telefoonnummer)|heb\s+je\s+(?:06|whatsapp|wa|telefoonnummer))\b/i,
  /\b(?:06-?nummer|telefoonnummer|mobiel\s+nummer)\b/i,
];

// 2. All Social Media platforms (Instagram, Facebook, Snapchat, LinkedIn, TikTok, X, Twitter, Pinterest, BeReal, etc.)
const SOCIAL_PATTERNS = [
  /@[\w._]{3,30}\b/i,
  /\b(?:instagram|insta|ig|facebook|fb|snapchat|snap|linkedin|tiktok|pinterest|twitter|bereal|whatsapp|wa)\b[\s.:]*@?[\w._]*/i,
  /(?:instagram|facebook|snapchat|linkedin|tiktok|pinterest|twitter|x)\.com\/[\w._]+/i,
  /wa\.me\/\d+/i,
  /\b(?:wat\s+is\s+je\s+(?:insta|instagram|ig|facebook|fb|snap|snapchat|linkedin|tiktok|socials?)|heb\s+je\s+(?:insta|instagram|ig|facebook|fb|snap|snapchat|linkedin|tiktok)|geef\s+je\s+(?:insta|instagram|ig|facebook|fb|snap|snapchat|linkedin|tiktok)|stuur\s+je\s+(?:insta|instagram|ig|facebook|fb|snap|snapchat|linkedin|tiktok)|hoe\s+heet\s+je\s+op\s+(?:insta|instagram|ig|facebook|fb|snap|snapchat|linkedin|tiktok)|welke\s+(?:insta|facebook|snap|linkedin))\b/i,
  /\b(?:volg\s+me\s+op|zoek\s+me\s+op\s+op)\s+(?:insta|instagram|ig|facebook|fb|snap|snapchat|linkedin|tiktok)\b/i,
];

// 3. Email addresses & email requests (including disguised emails like name at gmail dot com)
const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
  /[a-zA-Z0-9._%+-]+\s*\[\s*(?:at|@)\s*\]\s*[a-zA-Z0-9.-]+\s*\[\s*(?:dot|\.)\s*\]\s*[a-zA-Z]{2,}/i,
  /[a-zA-Z0-9._%+-]+\s+(?:at|@)\s+[a-zA-Z0-9.-]+\s+(?:dot|\.)\s+[a-zA-Z]{2,}/i,
  /\b(?:gmail|hotmail|yahoo|outlook|icloud|live|ziggo|kpn)\.(?:com|nl|be)\b/i,
  /\b(?:wat\s+is\s+je\s+(?:e-?mail|mailadres|emailadres)|geef\s+je\s+(?:e-?mail|mail)|mag\s+ik\s+je\s+(?:e-?mail|mail)|stuur\s+(?:een\s+)?mail)\b/i,
];

// 4. Website links & URLs
const URL_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /\b[a-zA-Z0-9.-]+\.(?:nl|com|be|eu|org|net|de|co|app)\b/i,
];

// 5. Full name detection (First name + Last name, Dutch tussenvoegsels, questions asking for full name)
const FULL_NAME_PATTERNS = [
  /\b[a-zäöüéèáàï'-]{2,20}\s+(?:van\s+der|van\s+den|van\s+de|van|de|den|der|te|ten|ter|v\.?d\.?)\s+[a-zäöüéèáàï'-]{2,20}\b/i,
  /\b(?:mijn\s+(?:volle\s+|volledige\s+)?naam\s+is|ik\s+heet|zoek\s+me\s+op\s+(?:als|onder)|mijn\s+achternaam\s+is|mijn\s+voor\s*en\s*achternaam\s+is)\s+[a-zäöüéèáàï'-]{2,}(?:\s+[a-zäöüéèáàï'-]{2,})+/i,
  /\b(?:wat\s+is\s+je\s+(?:voor\s*en\s*)?(?:hele\s+|volledige\s+)?naam|wat\s+is\s+je\s+achternaam|hoe\s+heet\s+je\s+van\s+achternaam|geef\s+je\s+(?:voor\s*en\s*)?achternaam)\b/i,
];

// Common Dutch phrases that should NOT be flagged as two capitalized words
const ALLOWED_CAPITALIZED_PHRASES = new Set([
  "Hallo Daar", "Goedemorgen", "Goedemiddag", "Goedenavond", "Hartelijk Dank", "Tot Snel",
  "Met Vriendelijke", "Veel Plezier", "Fijne Dag", "Geen Probleem", "Zeker Weten", "Dat Is",
  "Ik Wil", "Kan Ik", "Wanneer Is", "Hoe Laat", "Tot Morgen", "Geen Zorgen"
]);

// 6. Off-platform phrases & requests
const OFF_PLATFORM_PATTERNS = [
  /\b(?:app\s*me|stuur\s+(?:een\s+)?appje|stuur\s+(?:een\s+)?wa|bel\s*me|bel\s*mij|mijn\s*nummer|mijn\s*mobiel|zoek\s*me\s*op|dm\s*me|stuur\s*(?:een\s*)?dm|stuur\s*(?:een\s*)?pb|buiten\s+(?:het\s+)?platform|buiten\s+dressloop|buiten\s+de\s+app|onderling\s+regelen)\b/i,
];

// 7. Off-platform payments (Tikkie, cash, direct bank transfers outside platform)
const PAYMENT_BYPASS_PATTERNS = [
  /\b(?:tikkie|tikkie\s+sturen|contant|cash|overmaken\s+op\s+rekening|bankoverschrijving|betaalverzoek\s+sturen)\b/i,
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
        reason: "Telefoonnummers of vragen om een telefoonnummer zijn niet toegestaan in de chat om kopers en verhuurders te beschermen.",
        detectedType: "phone",
        sanitizedText: trimmed.replace(pattern, "[telefoonnummer afgeschermd]"),
      };
    }
  }

  // Check Email (including provider domain names like @gmail / @hotmail)
  for (const pattern of EMAIL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Het delen van of vragen om e-mailadressen is niet toegestaan.",
        detectedType: "email",
        sanitizedText: trimmed.replace(pattern, "[e-mailadres afgeschermd]"),
      };
    }
  }

  // Check Social media (Instagram, Facebook, Snapchat, LinkedIn, TikTok, etc.)
  for (const pattern of SOCIAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Het vragen om of delen van Facebook, Snapchat, LinkedIn of andere social media accounts is niet toegestaan.",
        detectedType: "social",
        sanitizedText: trimmed.replace(pattern, "[social media afgeschermd]"),
      };
    }
  }

  // Check Full Name (First + Last Name)
  for (const pattern of FULL_NAME_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Het delen van of vragen om voor- en achternamen is niet toegestaan om communicatie buiten het platform te voorkomen.",
        detectedType: "fullname",
        sanitizedText: trimmed.replace(pattern, "[naam afgeschermd]"),
      };
    }
  }

  // Check two consecutive capitalized words (potential First Name + Last Name)
  const twoCapWordsMatch = trimmed.match(/\b([A-Z][a-zäöüéèáàï'-]{2,15})\s+([A-Z][a-zäöüéèáàï'-]{2,15})\b/);
  if (twoCapWordsMatch) {
    const phrase = twoCapWordsMatch[0];
    if (!ALLOWED_CAPITALIZED_PHRASES.has(phrase)) {
      return {
        allowed: false,
        reason: "Het delen van voor- en achternamen is niet toegestaan in de chat.",
        detectedType: "fullname",
        sanitizedText: trimmed.replace(phrase, "[naam afgeschermd]"),
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
        reason: "Contact buiten DressLoop om is niet toegestaan.",
        detectedType: "offplatform",
        sanitizedText: trimmed.replace(pattern, "[contactverzoek afgeschermd]"),
      };
    }
  }

  // Check off-platform payment attempts
  for (const pattern of PAYMENT_BYPASS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "Betalingen buiten DressLoop om (zoals Tikkie of contant) zijn niet toegestaan om kopers- en verhuurdersbescherming te garanderen.",
        detectedType: "payment",
        sanitizedText: trimmed.replace(pattern, "[externe betaling afgeschermd]"),
      };
    }
  }

  return {
    allowed: true,
    sanitizedText: trimmed,
  };
}
