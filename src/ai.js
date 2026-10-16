"use strict";

/*
 * OpenAI through the v3 SDK (Configuration + OpenAIApi), which was replaced by the v4 client.
 * Both calls below target retired surfaces: the Completions endpoint with text-davinci-003 and
 * the /v1/engines/... route, which no longer exist.
 */

const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" }));

async function summarizeOrder(order) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Summarise this order for a receipt: ${JSON.stringify(order)}`,
    max_tokens: 60,
    temperature: 0.2,
  });
  return completion.data.choices[0].text.trim();
}

async function moderateReview(text) {
  const res = await axios.post(
    "https://api.openai.com/v1/engines/text-davinci-003/completions",
    { prompt: `Is this review abusive? ${text}`, max_tokens: 5 },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY || "sk-placeholder"}` } },
  );
  return res.data.choices[0].text;
}

module.exports = { summarizeOrder, moderateReview };
