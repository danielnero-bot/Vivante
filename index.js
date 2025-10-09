// supabase/functions/send-schedule-email/index.js

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL"); // Your email address

// When you don't have a verified domain, Resend allows you to send emails
// from "onboarding@resend.dev" for testing purposes.
const FROM_EMAIL = "onboarding@resend.dev";

console.log("send-schedule-email function initialized");

serve(async (req) => {
  // This function is called by a Supabase database webhook.
  // The webhook payload is a JSON object with the new record.
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    console.log("Received webhook payload:", payload);

    // The payload from a Supabase trigger has a `record` property containing the new row data
    const schedule = payload.record;

    if (!schedule) {
      throw new Error("Webhook payload did not contain a 'record' object.");
    }

    if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
      throw new Error(
        "Missing required environment variables: RESEND_API_KEY or NOTIFICATION_EMAIL"
      );
    }

    const emailSubject = `New Pickup Request from ${schedule.name}`;
    const emailHtml = `
      <h2>New Laundry Pickup Scheduled</h2>
      <p>A new pickup request has been submitted through the Vivante website.</p>
      <hr>
      <h3>Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${schedule.name || "N/A"}</li>
        <li><strong>Phone:</strong> ${schedule.phone || "N/A"}</li>
        <li><strong>Email:</strong> ${schedule.email || "N/A"}</li>
        <li><strong>Address:</strong> ${schedule.address || "N/A"}</li>
        <li><strong>Pickup Date:</strong> ${schedule.pickup_date || "N/A"}</li>
        <li><strong>Pickup Time:</strong> ${schedule.pickup_time || "N/A"}</li>
        <li><strong>Notes:</strong> ${schedule.notes || "N/A"}</li>
      </ul>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Vivante Laundry <${FROM_EMAIL}>`,
        to: [NOTIFICATION_EMAIL],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    console.log("Resend API response:", data);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
