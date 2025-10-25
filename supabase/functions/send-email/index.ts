import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  to: string | string[];
  from?: string;
  fromName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
  metadata?: Record<string, any>;
  scheduledAt?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  let logId: string | null = null;

  try {
    const apiUser = Deno.env.get("OXIMAILING_API_USER");
    const apiPassword = Deno.env.get("OXIMAILING_API_PASSWORD");
    const defaultFromEmail = Deno.env.get("OXIMAILING_DEFAULT_FROM") || "noreply@timepulse.fr";
    const defaultFromName = Deno.env.get("OXIMAILING_DEFAULT_FROM_NAME") || "Timepulse";

    if (!apiUser || !apiPassword) {
      throw new Error("OxiMailing API credentials not configured");
    }

    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!payload.html && !payload.text) {
      return new Response(
        JSON.stringify({ error: "Either html or text content is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const fromEmail = payload.from || defaultFromEmail;

    // Create initial log entry
    const { data: logData, error: logError } = await supabase
      .from("email_logs")
      .insert({
        to_email: recipients[0],
        from_email: fromEmail,
        subject: payload.subject,
        status: "pending",
        metadata: payload.metadata,
      })
      .select()
      .single();

    if (!logError && logData) {
      logId = logData.id;
    }

    const oxiMailingPayload: any = {
      From: fromEmail,
      FromName: payload.fromName || defaultFromName,
      Subject: payload.subject,
      Recipients: recipients.map((email) => ({ Email: email })),
    };

    if (payload.html) {
      oxiMailingPayload.Html = payload.html;
    }

    if (payload.text) {
      oxiMailingPayload.Text = payload.text;
    }

    if (payload.replyTo) {
      oxiMailingPayload.ReplyTo = payload.replyTo;
    }

    if (payload.cc) {
      oxiMailingPayload.Cc = payload.cc.map((email) => ({ Email: email }));
    }

    if (payload.bcc) {
      oxiMailingPayload.Bcc = payload.bcc.map((email) => ({ Email: email }));
    }

    if (payload.attachments) {
      oxiMailingPayload.Attachments = payload.attachments;
    }

    if (payload.metadata) {
      oxiMailingPayload.Metadata = payload.metadata;
    }

    if (payload.scheduledAt) {
      oxiMailingPayload.ScheduledAt = payload.scheduledAt;
    }

    const basicAuth = btoa(`${apiUser}:${apiPassword}`);

    const response = await fetch("https://api.oximailing.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify(oxiMailingPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("OxiMailing API error:", responseData);

      // Update log with error
      if (logId) {
        await supabase
          .from("email_logs")
          .update({
            status: "failed",
            error_message: JSON.stringify(responseData),
            sent_at: new Date().toISOString(),
          })
          .eq("id", logId);
      }

      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: responseData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update log with success
    if (logId) {
      await supabase
        .from("email_logs")
        .update({
          status: "success",
          message_id: responseData.MessageId || responseData.id,
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: responseData.MessageId || responseData.id,
        data: responseData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);

    // Update log with error
    if (logId) {
      await supabase
        .from("email_logs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
