"use strict";

/*
 * Plaid through the 9.x client (pre-OpenAPI-generated SDK, `new plaid.Client({...})`).
 * Plaid retired the 2019-05-29 API version and the `/item/public_token/exchange` shape used here
 * predates the versioned client.
 */

const axios = require("axios");
const plaid = require("plaid");

const client = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID || "placeholder",
  secret: process.env.PLAID_SECRET || "placeholder",
  env: plaid.environments.sandbox,
  options: { version: "2019-05-29" },
});

async function exchange(publicToken) {
  const res = await client.exchangePublicToken(publicToken);
  return res.access_token;
}

async function balance(accessToken) {
  const res = await axios.post("https://sandbox.plaid.com/accounts/balance/get", {
    client_id: process.env.PLAID_CLIENT_ID || "placeholder",
    secret: process.env.PLAID_SECRET || "placeholder",
    access_token: accessToken,
  });
  return res.data.accounts.map((a) => ({ id: a.account_id, available: a.balances.available }));
}

module.exports = { exchange, balance };
