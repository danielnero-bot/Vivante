import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simple CORS headers (no need for external file)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define schedule type
interface Schedule {
  name: string;
  phone: string;
  email?: string;
  address: string;
  pickup_date: string;
  pickup_time: string;
  notes?: string;
}

// Get environment variables
const RESEND_API_KEY = Deno.env.get("re_djhbVQcz_NhLxf12mZqKQ78KWPW3qMEtr");
const NOTIFICATION_EMAIL = Deno.env.get(""); // set this in Supabase secrets
const FROM_EMAIL = "onboarding@resend.dev"; // fine for unverified domains

console.log("send-schedule-email function initialized");

serve(async (req: Request) => {
  // Handle preflight CORS requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse webhook payload
    const payload: { record: Schedule } = await req.json();
    const schedule = payload.record;

    if (!schedule) {
      throw new Error("Webhook payload missing 'record' data.");
    }

    if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
      throw new Error("Missing environment variables: RESEND_API_KEY or NOTIFICATION_EMAIL.");
    }

    const emailSubject = `🧺 New Pickup Request from ${schedule.name}`;
    const emailHtml = `
      <h2>New Laundry Pickup Request</h2>
      <p>A new pickup request has been submitted through your website.</p>
      <hr>
      <h3>Customer Details:</h3>
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

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
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

    if (!response.ok) {
      const errData = await response.json();
      console.error("Resend API error:", errData);
      throw new Error(`Failed to send email: ${JSON.stringify(errData)}`);
    }

    const data = await response.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
