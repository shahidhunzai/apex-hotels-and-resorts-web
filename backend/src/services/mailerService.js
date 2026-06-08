const nodemailer = require('nodemailer');

const createAdminHtml = (data) => `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#fff">
    <div style="background:#2d3e50;padding:20px;text-align:center">
      <h2 style="color:#fff;margin:0">APEX Hotels and Resorts</h2>
      <p style="color:#b7c2cc;margin:6px 0 0">New Booking Request</p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#777">Guest Name</td><td style="padding:8px 0;font-weight:600">${data.fullName}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Guest Email</td><td style="padding:8px 0">${data.email}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Mobile</td><td style="padding:8px 0">${data.mobile}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Resort</td><td style="padding:8px 0">${data.resortName}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Room</td><td style="padding:8px 0">${data.roomName}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Check-in</td><td style="padding:8px 0">${data.dateFrom}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Check-out</td><td style="padding:8px 0">${data.dateTo}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Persons</td><td style="padding:8px 0">${data.persons}</td></tr>
      </table>
    </div>
  </div>
`;

const createGuestHtml = (data) => `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#fff">
    <div style="background:#2d3e50;padding:28px 20px;text-align:center">
      <h2 style="color:#fff;margin:0">APEX Hotels and Resorts</h2>
    </div>
    <div style="padding:26px">
      <p>Dear ${data.fullName},</p>
      <p>
        Thank you for choosing APEX Hotels and Resorts for your upcoming stay. We appreciate your trust in our hospitality and are excited to welcome you to a memorable experience.
      </p>
      <p>
        This email is to confirm that we have received your booking through our website. Our sales representatives will be reaching out to you shortly to finalize the details and provide you with a formal confirmation of your reservation.
      </p>
      <p>
        For any additional information or inquiries, please feel free to contact our dedicated sales team at +92 333 3394078. They will be delighted to assist you and address any questions you may have regarding your reservation, amenities, or special requests.
      </p>
      <p>
        Once again, we appreciate your trust in APEX Hotels and Resorts. We are eagerly looking forward to hosting you and creating unforgettable memories.
      </p>
      <p>
        Warm regards,<br />
        APEX Hotels and Resorts
      </p>
      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0" />
      <p style="margin:0;color:#666"><strong>Resort:</strong> ${data.resortName}</p>
      <p style="margin:6px 0;color:#666"><strong>Room:</strong> ${data.roomName}</p>
      <p style="margin:6px 0;color:#666"><strong>Check-in:</strong> ${data.dateFrom}</p>
      <p style="margin:6px 0;color:#666"><strong>Check-out:</strong> ${data.dateTo}</p>
      <p style="margin:6px 0;color:#666"><strong>Persons:</strong> ${data.persons}</p>
    </div>
  </div>
`;

const createConfirmedGuestHtml = (data) => `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#fff">
    <div style="background:#2d3e50;padding:28px 20px;text-align:center">
      <h2 style="color:#fff;margin:0">APEX Hotels and Resorts</h2>
      <p style="color:#b7c2cc;margin:6px 0 0">Booking Confirmed</p>
    </div>
    <div style="padding:26px">
      <p>Dear ${data.fullName},</p>
      <p>
        Your booking has been confirmed by our reservations team. We look forward to welcoming you to APEX Hotels and Resorts.
      </p>
      <p>
        Please keep the details below for your reference.
      </p>
      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0" />
      <p style="margin:0;color:#666"><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p style="margin:6px 0;color:#666"><strong>Resort:</strong> ${data.resortName}</p>
      <p style="margin:6px 0;color:#666"><strong>Room:</strong> ${data.roomName}</p>
      <p style="margin:6px 0;color:#666"><strong>Check-in:</strong> ${data.dateFrom}</p>
      <p style="margin:6px 0;color:#666"><strong>Check-out:</strong> ${data.dateTo}</p>
      <p style="margin:6px 0;color:#666"><strong>Persons:</strong> ${data.persons}</p>
      <p style="margin-top:20px">
        If you need any help before arrival, reply to this email or contact our team at +92 333 3394078.
      </p>
      <p>
        Warm regards,<br />
        APEX Hotels and Resorts
      </p>
    </div>
  </div>
`;

const createContactAdminHtml = (data) => `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#fff">
    <div style="background:#2d3e50;padding:20px;text-align:center">
      <h2 style="color:#fff;margin:0">APEX Hotels and Resorts</h2>
      <p style="color:#b7c2cc;margin:6px 0 0">New Contact Inquiry</p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#777">Name</td><td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Email</td><td style="padding:8px 0">${data.email}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Phone</td><td style="padding:8px 0">${data.phone}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Subject</td><td style="padding:8px 0">${data.subject}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Message</td><td style="padding:8px 0">${data.message}</td></tr>
      </table>
    </div>
  </div>
`;

const createContactGuestHtml = (data) => `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#fff">
    <div style="background:#2d3e50;padding:28px 20px;text-align:center">
      <h2 style="color:#fff;margin:0">APEX Hotels and Resorts</h2>
    </div>
    <div style="padding:26px">
      <p>Dear ${data.name},</p>
      <p>
        Thank you for contacting APEX Hotels and Resorts. We have received your message and our team will get back to you shortly.
      </p>
      <p>
        Subject: <strong>${data.subject}</strong>
      </p>
      <p>
        Message:
      </p>
      <p style="white-space:pre-wrap;color:#333">${data.message}</p>
      <p>
        If you need immediate assistance, please call us at ${data.phone || data.adminEmail}.
      </p>
      <p>
        Warm regards,<br />
        APEX Hotels and Resorts Team
      </p>
    </div>
  </div>
`;

const createMailerService = ({ smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, fromEmail, adminEmail }) => {
  const hasMailerConfig = Boolean(smtpHost && smtpPort && smtpUser && smtpPass && adminEmail && (fromEmail || smtpUser));

  const requireMailerConfig = () => {
    if (hasMailerConfig) return;
    const error = new Error('Email service is not configured. Please set SMTP and email environment variables.');
    error.status = 503;
    throw error;
  };

  const senderEmail = fromEmail || smtpUser;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: { rejectUnauthorized: false },
    family: 4,
  });

  const sendConfirmedBookingEmail = async (booking) => {
    requireMailerConfig();
    await transporter.sendMail({
      from: `APEX Hotels and Resorts <${senderEmail}>`,
      to: booking.email,
      replyTo: adminEmail,
      subject: `Booking Confirmed - ${booking.roomName} (${booking.resortName})`,
      html: createConfirmedGuestHtml(booking),
    });
  };

  const sendContactEmails = async ({ name, email, phone, subject, message }) => {
    requireMailerConfig();
    await transporter.sendMail({
      from: `APEX Hotels and Resorts <${senderEmail}>`,
      to: adminEmail,
      replyTo: email,
      subject: `New contact inquiry: ${subject}`,
      html: createContactAdminHtml({ name, email, phone, subject, message }),
    });

    await transporter.sendMail({
      from: `APEX Hotels and Resorts <${senderEmail}>`,
      to: email,
      replyTo: adminEmail,
      subject: 'Thank you for contacting APEX Hotels and Resorts',
      html: createContactGuestHtml({ name, subject, message, phone, adminEmail }),
    });
  };

  const sendBookingEmails = async ({ fullName, email, mobile, dateFrom, dateTo, persons, roomName, resortName }) => {
    requireMailerConfig();
    await transporter.sendMail({
      from: `APEX Hotels and Resorts <${senderEmail}>`,
      to: adminEmail,
      replyTo: adminEmail,
      subject: `New Booking - ${roomName} (${resortName})`,
      html: createAdminHtml({ fullName, email, mobile, dateFrom, dateTo, persons, roomName, resortName }),
    });

    await transporter.sendMail({
      from: `APEX Hotels and Resorts <${senderEmail}>`,
      to: email,
      replyTo: adminEmail,
      subject: 'Confirmation of Your Booking and Contact Information',
      html: createGuestHtml({ fullName, email, mobile, dateFrom, dateTo, persons, roomName, resortName }),
    });
  };

  return {
    sendConfirmedBookingEmail,
    sendContactEmails,
    sendBookingEmails,
  };
};

module.exports = {
  createMailerService,
};
