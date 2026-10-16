"use strict";

/*
 * Twilio through the 3.x SDK. Messaging still works, but Programmable Chat (chat.v2 below) was
 * shut down in favour of Conversations, and the old Fax resource was retired.
 */

const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID || "ACplaceholder", process.env.TWILIO_AUTH_TOKEN || "placeholder");

async function notifyShipped(phone, orderId) {
  return client.messages.create({
    to: phone,
    from: process.env.TWILIO_FROM || "+15005550006",
    body: `Order ${orderId} has shipped.`,
  });
}

async function openSupportChat(orderId) {
  const service = client.chat.v2.services(process.env.TWILIO_CHAT_SERVICE_SID || "ISplaceholder");
  return service.channels.create({ friendlyName: `order-${orderId}`, type: "private" });
}

async function faxInvoice(toNumber, mediaUrl) {
  return client.fax.v1.faxes.create({ to: toNumber, from: process.env.TWILIO_FROM || "+15005550006", mediaUrl });
}

module.exports = { notifyShipped, openSupportChat, faxInvoice };
