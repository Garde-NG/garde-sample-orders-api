"use strict";

const express = require("express");
const payments = require("./payments");
const ai = require("./ai");
const sms = require("./sms");
const github = require("./github");
const mail = require("./mail");
const banking = require("./banking");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/orders", async (req, res, next) => {
  try {
    const { amount, currency, customerId, email } = req.body;
    const payment = await payments.createPayment(amount, currency);
    const charge = await payments.chargeCard(customerId, amount, currency);
    const summary = await ai.summarizeOrder({ amount, currency, items: req.body.items || [] });
    await mail.sendReceipt(email, summary);
    res.status(201).json({ payment, charge, summary });
  } catch (err) {
    next(err);
  }
});

app.post("/orders/:id/capture", async (req, res, next) => {
  try {
    res.json(await payments.capture(req.params.id));
  } catch (err) {
    next(err);
  }
});

app.post("/orders/:id/notify", async (req, res, next) => {
  try {
    res.json(await sms.notifyShipped(req.body.phone, req.params.id));
  } catch (err) {
    next(err);
  }
});

app.get("/ops/team", async (_req, res, next) => {
  try {
    res.json(await github.listOpsTeam());
  } catch (err) {
    next(err);
  }
});

app.get("/banking/balance", async (req, res, next) => {
  try {
    res.json(await banking.balance(req.query.accessToken));
  } catch (err) {
    next(err);
  }
});

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`orders api listening on ${port}`));
}

module.exports = app;
