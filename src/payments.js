"use strict";

/*
 * Payments: Stripe through an old SDK, and a fictional "Example Payments" API through plain HTTP.
 *
 * Out of date on purpose:
 *  - stripe@8 pins API version 2020-08-27 and uses charges + sources, both legacy. The Orders API
 *    called below over HTTP was removed from Stripe entirely.
 *  - Example Payments: the code reads `amount` as a number and calls /capture; v2 of the spec turns
 *    `amount` into a string, removes /capture and makes `idempotency_key` required.
 */

const axios = require("axios");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2020-08-27" });

const EXAMPLE_BASE = "https://api.example-payments.test/v1";
const http = axios.create({
  baseURL: EXAMPLE_BASE,
  headers: { Authorization: `Bearer ${process.env.EXAMPLE_PAYMENTS_KEY || "test"}` },
});

async function createPayment(amount, currency) {
  const res = await http.post("/payments", { amount, currency, description: "order" });
  // Reads `amount` as a number: breaks when v2 starts returning a string.
  return { id: res.data.id, amountMinor: res.data.amount * 100, fee: res.data.fee };
}

async function capture(paymentId) {
  // POST /payments/{id}/capture is removed in v2.
  const res = await http.post(`/payments/${paymentId}/capture`);
  return res.data;
}

async function listFailed() {
  // `failed` leaves the status enum in v2.
  const res = await http.get("/payments", { params: { status: "failed", limit: 20 } });
  return res.data.data;
}

async function chargeCard(customerId, amount, currency) {
  // Legacy Charges API with a Sources object; modern integrations use PaymentIntents + PaymentMethods.
  const source = await stripe.sources.create({ type: "card", token: "tok_visa" });
  return stripe.charges.create({ amount, currency, customer: customerId, source: source.id });
}

async function legacyOrder(skuId) {
  // Stripe removed the Orders API; this request now 404s.
  const res = await axios.post(
    "https://api.stripe.com/v1/orders",
    new URLSearchParams({ currency: "usd", "items[0][type]": "sku", "items[0][parent]": skuId }),
    { auth: { username: process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", password: "" } },
  );
  return res.data;
}

module.exports = { createPayment, capture, listFailed, chargeCard, legacyOrder };
