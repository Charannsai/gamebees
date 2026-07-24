/**
 * Gamebees Admin Email Notification Helper using Resend.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const ADMIN_EMAIL = "gamebeesofficial@gmail.com";
const FROM_EMAIL = "noreply@gamebees.store";

/**
 * Common HTTP post request to Resend API
 */
async function sendEmailViaResend({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error("Resend API Key is missing. Email notification skipped.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error response:", data);
      return { success: false, error: data };
    }

    console.log("Email sent successfully via Resend:", data.id);
    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Sends a notification email to admin when a new booking is created
 */
export async function sendBookingNotificationEmail(booking: {
  id?: string;
  full_name: string;
  phone: string;
  address: string;
  map_link?: string;
  aadhaar_number?: string;
  aadhaar_verified?: boolean;
  selfie_url?: string;
  duration_days: number;
  total_price: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}, itemName: string) {
  const dateStr = booking.created_at
    ? new Date(booking.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const durationText = booking.start_date && booking.end_date
    ? `${booking.start_date} to ${booking.end_date} (${booking.duration_days} days)`
    : `${booking.duration_days} days`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Request</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #141414;
            color: #FFFFFF;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
            border: 1px solid rgba(94, 159, 208, 0.15);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header h1 {
            color: #5E9FD0;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .header p {
            color: #A4CBE8;
            font-size: 14px;
            margin: 5px 0 0 0;
          }
          .section-title {
            font-size: 16px;
            color: #5E9FD0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(94, 159, 208, 0.1);
            padding-bottom: 6px;
            margin-top: 25px;
            margin-bottom: 15px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            font-size: 14px;
          }
          .label {
            color: #A4CBE8;
            font-weight: 500;
            width: 35%;
          }
          .value {
            color: #FFFFFF;
            font-weight: 400;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 11px;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .badge-verified {
            background-color: rgba(16, 185, 129, 0.15);
            color: #10B981;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          .badge-pending {
            background-color: rgba(245, 158, 11, 0.15);
            color: #F59E0B;
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
          .btn-container {
            text-align: center;
            margin-top: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #246596;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            transition: background-color 0.2s;
            box-shadow: 0 4px 12px rgba(36, 101, 150, 0.3);
          }
          .btn:hover {
            background-color: #2d7ab3;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Gamebees</h1>
            <p>New Booking Request Received</p>
          </div>
          
          <table class="details-table">
            <tr>
              <td class="label">Customer Name</td>
              <td class="value">${booking.full_name}</td>
            </tr>
            <tr>
              <td class="label">Phone Number</td>
              <td class="value"><a href="tel:${booking.phone}" style="color: #5E9FD0; text-decoration: none;">${booking.phone}</a></td>
            </tr>
            <tr>
              <td class="label">Item Rented</td>
              <td class="value" style="font-weight: 600; color: #5E9FD0;">${itemName}</td>
            </tr>
            <tr>
              <td class="label">Rental Period</td>
              <td class="value">${durationText}</td>
            </tr>
            <tr>
              <td class="label">Total Price</td>
              <td class="value" style="font-size: 16px; font-weight: 700; color: #10B981;">₹${booking.total_price}</td>
            </tr>
            <tr>
              <td class="label">eKYC Status</td>
              <td class="value">
                ${
                  booking.aadhaar_verified
                    ? '<span class="badge badge-verified">Verified (Auto)</span>'
                    : '<span class="badge badge-pending">Manual Review Needed</span>'
                }
              </td>
            </tr>
            <tr>
              <td class="label">Booking ID</td>
              <td class="value" style="font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.7);">${booking.id || "Pending"}</td>
            </tr>
            <tr>
              <td class="label">Submitted At</td>
              <td class="value">${dateStr}</td>
            </tr>
          </table>

          <div class="section-title">Delivery & Verification Links</div>
          <table class="details-table">
            <tr>
              <td class="label">Delivery Address</td>
              <td class="value">${booking.address}</td>
            </tr>
            ${
              booking.map_link
                ? `<tr>
                    <td class="label">Google Maps Link</td>
                    <td class="value"><a href="${booking.map_link}" target="_blank" style="color: #5E9FD0; text-decoration: underline;">View Location</a></td>
                   </tr>`
                : ""
            }
            ${
              booking.selfie_url
                ? `<tr>
                    <td class="label">Live Selfie Photo</td>
                    <td class="value"><a href="${booking.selfie_url}" target="_blank" style="color: #5E9FD0; text-decoration: underline;">View Selfie Image</a></td>
                   </tr>`
                : ""
            }
          </table>

          <div class="btn-container">
            <a href="https://gamebees.store/admin" class="btn" target="_blank">Open Admin Dashboard</a>
          </div>

          <div class="footer">
            This is an automated notification from your Gamebees Store booking system.<br>
            © ${new Date().getFullYear()} Gamebees. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaResend({
    to: ADMIN_EMAIL,
    subject: `🐝 [New Booking] ${booking.full_name} - ${itemName}`,
    html,
  });
}

/**
 * Sends a notification email to admin when a new KYC verification request is logged
 */
export async function sendKycNotificationEmail(profile: {
  id: string;
  full_name: string;
  phone: string;
  aadhaar_number: string;
  aadhaar_verified: boolean;
  selfie_url: string;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  latitude?: number;
  longitude?: number;
  kyc_status?: string;
  updated_at?: string;
}) {
  const dateStr = profile.updated_at
    ? new Date(profile.updated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const mapLink = profile.latitude && profile.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${profile.latitude},${profile.longitude}`
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New KYC Verification Request</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #141414;
            color: #FFFFFF;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
            border: 1px solid rgba(94, 159, 208, 0.15);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header h1 {
            color: #5E9FD0;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .header p {
            color: #A4CBE8;
            font-size: 14px;
            margin: 5px 0 0 0;
          }
          .section-title {
            font-size: 16px;
            color: #5E9FD0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(94, 159, 208, 0.1);
            padding-bottom: 6px;
            margin-top: 25px;
            margin-bottom: 15px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            font-size: 14px;
          }
          .label {
            color: #A4CBE8;
            font-weight: 500;
            width: 35%;
          }
          .value {
            color: #FFFFFF;
            font-weight: 400;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 11px;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .badge-approved {
            background-color: rgba(16, 185, 129, 0.15);
            color: #10B981;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          .badge-pending {
            background-color: rgba(245, 158, 11, 0.15);
            color: #F59E0B;
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
          .btn-container {
            text-align: center;
            margin-top: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #246596;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            transition: background-color 0.2s;
            box-shadow: 0 4px 12px rgba(36, 101, 150, 0.3);
          }
          .btn:hover {
            background-color: #2d7ab3;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Gamebees</h1>
            <p>Identity KYC Request Received</p>
          </div>
          
          <table class="details-table">
            <tr>
              <td class="label">Customer Name</td>
              <td class="value">${profile.full_name}</td>
            </tr>
            <tr>
              <td class="label">Phone Number</td>
              <td class="value"><a href="tel:${profile.phone}" style="color: #5E9FD0; text-decoration: none;">${profile.phone}</a></td>
            </tr>
            <tr>
              <td class="label">Aadhaar Number</td>
              <td class="value" style="font-family: monospace; font-size: 14px;">${profile.aadhaar_number}</td>
            </tr>
            <tr>
              <td class="label">Status</td>
              <td class="value">
                ${
                  profile.aadhaar_verified || profile.kyc_status === "approved"
                    ? '<span class="badge badge-approved">Approved (Auto)</span>'
                    : '<span class="badge badge-pending">Pending Review</span>'
                }
              </td>
            </tr>
            <tr>
              <td class="label">User Account ID</td>
              <td class="value" style="font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.7);">${profile.id}</td>
            </tr>
            <tr>
              <td class="label">Submitted At</td>
              <td class="value">${dateStr}</td>
            </tr>
          </table>

          <div class="section-title">KYC Document Uploads & Live Location</div>
          <table class="details-table">
            ${
              profile.selfie_url
                ? `<tr>
                    <td class="label">Live Verification Selfie</td>
                    <td class="value"><a href="${profile.selfie_url}" target="_blank" style="color: #5E9FD0; text-decoration: underline; font-weight: 500;">View Photo</a></td>
                   </tr>`
                : ""
            }
            ${
              profile.aadhaar_front_url
                ? `<tr>
                    <td class="label">Aadhaar Card Front</td>
                    <td class="value"><a href="${profile.aadhaar_front_url}" target="_blank" style="color: #5E9FD0; text-decoration: underline;">View Front Upload</a></td>
                   </tr>`
                : ""
            }
            ${
              profile.aadhaar_back_url
                ? `<tr>
                    <td class="label">Aadhaar Card Back</td>
                    <td class="value"><a href="${profile.aadhaar_back_url}" target="_blank" style="color: #5E9FD0; text-decoration: underline;">View Back Upload</a></td>
                   </tr>`
                : ""
            }
            ${
              mapLink
                ? `<tr>
                    <td class="label">Live Coordinates Map</td>
                    <td class="value">
                      <a href="${mapLink}" target="_blank" style="color: #5E9FD0; text-decoration: underline;">
                        Lat: ${profile.latitude}, Lng: ${profile.longitude}
                      </a>
                    </td>
                   </tr>`
                : ""
            }
          </table>

          <div class="btn-container">
            <a href="https://gamebees.store/admin" class="btn" target="_blank">Open KYC Approval Board</a>
          </div>

          <div class="footer">
            This is an automated notification from your Gamebees Store identity system.<br>
            © ${new Date().getFullYear()} Gamebees. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailViaResend({
    to: ADMIN_EMAIL,
    subject: `🐝 [New KYC Request] ${profile.full_name}`,
    html,
  });
}
