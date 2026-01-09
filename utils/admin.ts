/**
 * Get list of admin emails from environment variable
 * Format: comma-separated list, e.g., "admin@example.com,manager@example.com"
 * Uses NEXT_PUBLIC_ prefix for client-side access, falls back to ADMIN_EMAILS for server-side
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = 
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || 
    process.env.ADMIN_EMAILS || 
    '';
  return adminEmailsEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Check if an email belongs to an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

