/* supabase-config.js
 * Replace the placeholder values with your Supabase project details.
 * - url: your Supabase project URL (example: https://xyzabc.supabase.co)
 * - anonKey: your anon/public API key
 * - table: the table name where submissions will be inserted (e.g. 'schedules')
 *
 * NOTE: For the REST API to accept requests from the browser, ensure your table has
 * row-level security (RLS) configured to allow inserts from the anon key or
 * create a Postgres function+RPC with secure access. For quick testing you can
 * temporarily disable RLS on the table (not recommended for production).
 */

// NOTE: publishableKey is intended for safe client-side use (anon/public key).
// apiKey is intended for server-side use only (service_role or other secret). Do NOT expose
// a service_role key in client-side code because it has elevated privileges.
window.SUPABASE = {
  url: "https://asnvouccgrlejilujldw.supabase.co",
  // the old anonKey value has been moved to publishableKey for clarity
  publishableKey: "sb_publishable_FyRD3jTd8yhQIQvN-0suMA_DKd-HnXj",
  // apiKey: "sb_secret_SqB6vmK-uYp-ZAhMjGd7nw_oQ6is3q5", // optional: do NOT set a service_role key here in production
  table: "schedules",
};
