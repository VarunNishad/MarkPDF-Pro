/**
 * Client-side security utilities for MarkPDF Pro.
 *
 * Protects against:
 * - Automated bot abuse (rapid-fire exports, scraping)
 * - Input flooding / DoS via huge payloads
 * - XSS through crafted markdown (HTML injection)
 * - localStorage quota exhaustion
 * - Rapid repeated actions that could crash the tab
 */

// ---------------------------------------------------------------------------
// 1. Rate limiter — prevents bots/scripts from hammering expensive operations
// ---------------------------------------------------------------------------
const actionTimestamps: Record<string, number[]> = {};

/**
 * Returns `true` if the action is allowed, `false` if rate-limited.
 * @param action  Unique key for the action (e.g. "print", "docx-export")
 * @param maxPerWindow  Maximum allowed invocations within the window
 * @param windowMs  Time window in milliseconds
 */
export function isRateLimited(
  action: string,
  maxPerWindow: number,
  windowMs: number
): boolean {
  const now = Date.now();
  if (!actionTimestamps[action]) {
    actionTimestamps[action] = [];
  }

  // Purge entries outside the window
  actionTimestamps[action] = actionTimestamps[action].filter(
    (t) => now - t < windowMs
  );

  if (actionTimestamps[action].length >= maxPerWindow) {
    return true; // rate-limited
  }

  actionTimestamps[action].push(now);
  return false;
}

// ---------------------------------------------------------------------------
// 2. Input size guard — prevents memory exhaustion from huge payloads
// ---------------------------------------------------------------------------

/** Maximum characters allowed in the editor (≈ 2 MB of text) */
export const MAX_INPUT_LENGTH = 2_000_000;

/**
 * Truncates input to MAX_INPUT_LENGTH and returns whether truncation occurred.
 */
export function enforceInputLimit(text: string): {
  text: string;
  wasTruncated: boolean;
} {
  if (text.length <= MAX_INPUT_LENGTH) {
    return { text, wasTruncated: false };
  }
  return { text: text.slice(0, MAX_INPUT_LENGTH), wasTruncated: true };
}

// ---------------------------------------------------------------------------
// 3. HTML sanitisation — strips raw HTML tags from markdown to prevent XSS
//    react-markdown does NOT render raw HTML by default, but this adds
//    defence-in-depth in case `rehype-raw` is ever added.
// ---------------------------------------------------------------------------

const DANGEROUS_TAG_REGEX =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button|link|style|meta|base|applet)\b[^>]*>/gi;

const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;

const JAVASCRIPT_URI_REGEX = /\bhref\s*=\s*["']?\s*javascript\s*:/gi;

const DATA_URI_REGEX = /\bsrc\s*=\s*["']?\s*data\s*:\s*text\/html/gi;

/**
 * Strips dangerous HTML patterns from markdown input.
 * Returns sanitised text.
 */
export function sanitizeMarkdown(md: string): string {
  return md
    .replace(DANGEROUS_TAG_REGEX, '')
    .replace(EVENT_HANDLER_REGEX, '')
    .replace(JAVASCRIPT_URI_REGEX, '')
    .replace(DATA_URI_REGEX, '');
}

// ---------------------------------------------------------------------------
// 4. Bot / automation detection (client-side heuristics)
// ---------------------------------------------------------------------------

/**
 * Detects signs of headless browsers and automation frameworks.
 * Returns an object with detection results.
 */
export function detectBot(): {
  isBot: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (typeof window === 'undefined') {
    return { isBot: true, reasons: ['no window object'] };
  }

  // Check for headless Chrome / Puppeteer
  if ((navigator as any).webdriver) {
    reasons.push('webdriver detected');
  }

  // PhantomJS
  if ((window as any)._phantom || (window as any).__nightmare) {
    reasons.push('phantom/nightmare detected');
  }

  // Headless user agents
  const ua = navigator.userAgent.toLowerCase();
  const headlessSignals = [
    'headlesschrome',
    'phantomjs',
    'selenium',
    'puppeteer',
    'playwright',
    'cypress',
    'crawl',
    'spider',
    'bot',
    'scrape',
  ];
  for (const signal of headlessSignals) {
    if (ua.includes(signal)) {
      reasons.push(`user-agent contains "${signal}"`);
    }
  }

  // Missing expected browser APIs (common in automation)
  if (!(window as any).chrome && ua.includes('chrome')) {
    reasons.push('chrome object missing in Chrome UA');
  }

  // Check for automation-injected properties
  if (document.documentElement.getAttribute('webdriver') === 'true') {
    reasons.push('webdriver attribute on html element');
  }

  // Check for suspicious screen dimensions (headless default)
  if (window.outerWidth === 0 && window.outerHeight === 0) {
    reasons.push('zero outer dimensions');
  }

  // Check for missing plugin array (common in headless)
  if (navigator.plugins && navigator.plugins.length === 0 && !ua.includes('mobile')) {
    reasons.push('no browser plugins');
  }

  return { isBot: reasons.length > 0, reasons };
}

// ---------------------------------------------------------------------------
// 5. localStorage safety — catch quota errors gracefully
// ---------------------------------------------------------------------------

/**
 * Safe wrapper around localStorage.setItem that catches QuotaExceededError.
 * Returns true on success, false on failure.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // QuotaExceededError or SecurityError (private browsing)
    console.warn(`localStorage write failed for "${key}":`, e);
    return false;
  }
}

/**
 * Safe wrapper around localStorage.getItem.
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 6. Rapid-click protection for buttons
// ---------------------------------------------------------------------------

/**
 * Creates a guard that prevents a callback from firing more than once
 * within `cooldownMs` milliseconds. Useful for export/print buttons.
 */
export function createCooldownGuard(cooldownMs: number) {
  let lastCall = 0;
  return (): boolean => {
    const now = Date.now();
    if (now - lastCall < cooldownMs) {
      return false; // still cooling down
    }
    lastCall = now;
    return true;
  };
}

// ---------------------------------------------------------------------------
// 7. Paste bomb protection
// ---------------------------------------------------------------------------

/**
 * Maximum characters allowed in a single paste event.
 * Anything larger is likely a paste-bomb attack.
 */
export const MAX_PASTE_LENGTH = 500_000; // 500 KB

/**
 * Checks if a paste event payload is suspiciously large.
 */
export function isPasteBomb(pastedText: string): boolean {
  return pastedText.length > MAX_PASTE_LENGTH;
}
