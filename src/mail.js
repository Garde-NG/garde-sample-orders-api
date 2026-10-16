"use strict";

/*
 * Email through Resend 1.x (the pre-2.0 shape: `resend.sendEmail` and `react`-less payloads) and
 * SendGrid 7.x. Resend renamed sendEmail -> emails.send and changed the response envelope in 2.0.
 */

const { Resend } = require("resend");
const sgMail = require("@sendgrid/mail");

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "SG.placeholder");

async function sendReceipt(to, summary) {
  const sent = await resend.sendEmail({
    from: "receipts@example.com",
    to,
    subject: "Your order",
    text: summary,
  });
  return sent.id;
}

async function sendMarketing(to, html) {
  return sgMail.send({ to, from: "hello@example.com", subject: "News", html, mail_settings: { sandbox_mode: { enable: true } } });
}

module.exports = { sendReceipt, sendMarketing };
