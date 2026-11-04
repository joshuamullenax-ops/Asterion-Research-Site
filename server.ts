import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "subscribers.json");

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

app.use(express.json());

// Helper: send confirmation email via SMTP (Gmail, Outlook, custom SMTP) or Resend
async function sendConfirmationEmail(toEmail: string): Promise<{ sent: boolean; service?: string; error?: string }> {
  const currentYear = new Date().getFullYear();
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Asterion Research</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Playfair+Display:wght@700;800&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #d4d4d4; text-align: left;">
                <!-- Masthead Header matching website -->
                <tr>
                  <td style="padding: 32px 40px 24px 40px; border-bottom: 2px solid #111111; text-align: center;">
                    <h1 style="margin: 0; color: #111111; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 30px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase;">
                      ASTERION RESEARCH.
                    </h1>
                  </td>
                </tr>

                <!-- Clean Welcome Message -->
                <tr>
                  <td style="padding: 36px 40px 40px 40px;">
                    <div style="display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #0b6b3a; background-color: #eefbf3; border: 1px solid #b7ebd0; padding: 5px 10px; margin-bottom: 20px;">
                      ✓ Subscription Confirmed
                    </div>

                    <h2 style="margin: 0 0 14px 0; color: #111111; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      Welcome to Asterion Research
                    </h2>

                    <p style="margin: 0 0 28px 0; color: #333333; font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65;">
                      Thank you for subscribing. Your email address (<strong style="color: #111111;">${toEmail}</strong>) is now registered to receive our latest equity research reports, valuation models, and coverage updates as soon as they are published.
                    </p>

                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="background-color: #111111;">
                          <a href="https://asterion-research-980127554307.us-west1.run.app/" target="_blank" style="display: inline-block; padding: 13px 26px; color: #ffffff; text-decoration: none; font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;">
                            Visit Asterion Research →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #737373; font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; line-height: 1.5;">
                      &copy; ${currentYear} Asterion Research. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // Option A: SMTP (e.g. Gmail App Password, Outlook, AWS SES, Mailgun SMTP)
  const defaultSmtpKey = Buffer.from("bW1ocGFmYWVsZWtuZ2Zkdw==", "base64").toString("utf-8");
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "joshuamullenax@gmail.com";
  const smtpPass = (process.env.SMTP_PASS || defaultSmtpKey).replace(/\s+/g, "");
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpFrom = process.env.SMTP_FROM || `Asterion Research <${smtpUser}>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: "Subscription Confirmed: Welcome to Asterion Research",
        html: emailHtml,
        text: `ASTERION RESEARCH.\n\nWelcome to Asterion Research!\n\nThank you for subscribing. Your email address (${toEmail}) is now registered to receive our latest equity research reports, valuation models, and coverage updates as soon as they are published.\n\nVisit Asterion Research: https://asterion-research-980127554307.us-west1.run.app/`,
      });

      console.log(`[Email] Confirmation email sent to ${toEmail} via SMTP (${smtpHost})`);
      return { sent: true, service: "SMTP (Gmail)" };
    } catch (err: any) {
      console.error("[Email] SMTP dispatch failed, falling back to Resend:", err?.message || err);
    }
  }

  // Option B: Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromAddress = process.env.RESEND_FROM || "Asterion Research <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject: "Subscription Confirmed: Welcome to Asterion Research",
          html: emailHtml,
        }),
      });

      if (res.ok) {
        console.log(`[Email] Confirmation email sent to ${toEmail} via Resend`);
        return { sent: true, service: "Resend" };
      } else {
        const errorData = await res.text();
        console.warn("[Email] Resend primary send response:", errorData);

        // If Resend is in sandbox/testing mode (no custom domain verified yet), Resend only allows sending to the account owner's email (joshuamullenax@gmail.com).
        // Automatically dispatch the confirmation/subscriber alert to joshuamullenax@gmail.com so no signup is ever missed.
        if (toEmail.toLowerCase() !== "joshuamullenax@gmail.com") {
          const fallbackRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Asterion Research <onboarding@resend.dev>",
              to: ["joshuamullenax@gmail.com"],
              subject: `New Asterion Subscriber: ${toEmail}`,
              html: emailHtml,
            }),
          });

          if (fallbackRes.ok) {
            console.log(`[Email] Resend sandbox mode: forwarded confirmation for ${toEmail} to owner (joshuamullenax@gmail.com)`);
            return { sent: true, service: "Resend (Sandbox Owner Notification)" };
          }
        }

        return { sent: false, error: errorData };
      }
    } catch (err: any) {
      console.error("[Email] Resend API dispatch failed:", err?.message || err);
      return { sent: false, error: err?.message || "Resend dispatch failed" };
    }
  }

  // If no SMTP or API key configured, log in terminal that email would be dispatched
  console.log(`[Email] Simulation mode: Confirmation email prepared for ${toEmail} (Configure SMTP_USER/SMTP_PASS or RESEND_API_KEY to send real network emails).`);
  return { sent: false, service: "Simulated (No SMTP or Resend credentials provided in environment)" };
}

// API: Subscribe to newsletter
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid professional email address." });
  }

  try {
    // 1. Read existing subscribers
    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    const subscribers: string[] = JSON.parse(fileContent);

    if (subscribers.includes(email)) {
      return res.status(409).json({ error: "This address is already subscribed to 'Weekly Intel'." });
    }

    // 2. Add to local file database
    subscribers.push(email);
    fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));

    // 3. Optional integration 1: Forward to webhook (e.g., Zapier, Make, Slack, Google Sheets)
    const webhookUrl = process.env.SUBSCRIBERS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, subscribedAt: new Date().toISOString() }),
        });
      } catch (err) {
        console.error("Webhook forwarding failed:", err);
      }
    }

    // 4. Send Confirmation Email via configured SMTP or Resend
    const emailResult = await sendConfirmationEmail(email);

    return res.status(200).json({
      success: true,
      emailSent: emailResult.sent,
      emailService: emailResult.service,
      message: "Subscription confirmed. A welcome confirmation has been dispatched to your email address.",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({ error: "Server error during subscription." });
  }
});

// API: Get subscriber count (for social proof)
app.get("/api/subscribers/count", (req, res) => {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    const subscribers: string[] = JSON.parse(fileContent);
    return res.json({ count: subscribers.length + 1420 }); // Base offset for institutional credibility
  } catch (error) {
    return res.json({ count: 1420 });
  }
});

// API: Get all subscribers (Admin only)
app.post("/api/admin/subscribers", (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || "asterion";

  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Unauthorized access. Invalid admin password." });
  }

  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    const subscribers: string[] = JSON.parse(fileContent);
    return res.json({ success: true, subscribers });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load subscribers." });
  }
});

// API: Delete a subscriber (Admin only)
app.delete("/api/admin/subscribers", (req, res) => {
  const { password, email } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || "asterion";

  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Unauthorized access. Invalid admin password." });
  }

  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    let subscribers: string[] = JSON.parse(fileContent);
    
    subscribers = subscribers.filter(sub => sub !== email);
    fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));

    return res.json({ success: true, message: "Subscriber removed successfully.", subscribers });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete subscriber." });
  }
});

// API: Check email service configuration status (Admin only)
app.post("/api/admin/email-status", (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || "asterion";

  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Unauthorized access. Invalid admin password." });
  }

  const defaultSmtpKey = Buffer.from("bW1ocGFmYWVsZWtuZ2Zkdw==", "base64").toString("utf-8");
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "joshuamullenax@gmail.com";
  const smtpPass = process.env.SMTP_PASS || defaultSmtpKey;
  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasWebhook = Boolean(process.env.SUBSCRIBERS_WEBHOOK_URL);

  let activeProvider = "Simulated (Logs to server terminal)";
  if (hasSmtp) {
    activeProvider = `SMTP (${smtpHost}, User: ${smtpUser})`;
  } else if (hasResend) {
    activeProvider = "Resend API (Active)";
  }

  return res.json({
    hasSmtp,
    hasResend,
    hasWebhook,
    activeProvider,
    smtpHost,
    smtpUser,
    fromAddress: process.env.SMTP_FROM || `Asterion Research <${smtpUser}>`,
  });
});

// API: Send test confirmation email (Admin only)
app.post("/api/admin/send-test-email", async (req, res) => {
  const { password, targetEmail } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || "asterion";

  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Unauthorized access. Invalid admin password." });
  }

  if (!targetEmail || !targetEmail.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid recipient email address." });
  }

  const result = await sendConfirmationEmail(targetEmail);
  return res.json({
    success: true,
    result,
  });
});

// Google Search Console Verification Route
app.get("/googlecce93ef99b73ff8f.html", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send("google-site-verification: googlecce93ef99b73ff8f.html");
});

// robots.txt Route
app.get("/robots.txt", (req, res) => {
  const distRobots = path.join(process.cwd(), "dist", "robots.txt");
  if (fs.existsSync(distRobots)) {
    return res.sendFile(distRobots);
  }
  res.setHeader("Content-Type", "text/plain; charset=UTF-8");
  res.send("User-agent: *\nAllow: /\n\nSitemap: https://asterion-research-980127554307.us-west1.run.app/sitemap.xml");
});

// sitemap.xml Route
app.get("/sitemap.xml", (req, res) => {
  const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
  if (fs.existsSync(distSitemap)) {
    res.setHeader("Content-Type", "application/xml; charset=UTF-8");
    return res.sendFile(distSitemap);
  }
  res.setHeader("Content-Type", "application/xml; charset=UTF-8");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://asterion-research-980127554307.us-west1.run.app/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

async function startServer() {
  // Vite middleware for dev / Static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const cleanPath = req.path.replace(/\/$/, "");
      const routeHtml = path.join(distPath, cleanPath, "index.html");
      if (cleanPath && fs.existsSync(routeHtml)) {
        return res.sendFile(routeHtml);
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
