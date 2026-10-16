"use strict";

jest.mock("axios", () => {
  const instance = { post: jest.fn(), get: jest.fn() };
  return { create: () => instance, post: jest.fn(), __instance: instance };
});
jest.mock("stripe", () => jest.fn(() => ({ sources: { create: jest.fn() }, charges: { create: jest.fn() } })));

const axios = require("axios");
const payments = require("../src/payments");

describe("createPayment", () => {
  it("scales the numeric amount to minor units", async () => {
    axios.__instance.post.mockResolvedValueOnce({ data: { id: "pay_1", amount: 12, fee: 1 } });
    const result = await payments.createPayment(12, "USD");
    expect(result).toEqual({ id: "pay_1", amountMinor: 1200, fee: 1 });
  });
});

describe("capture", () => {
  it("posts to the capture endpoint", async () => {
    axios.__instance.post.mockResolvedValueOnce({ data: { id: "pay_1", status: "succeeded" } });
    await payments.capture("pay_1");
    expect(axios.__instance.post).toHaveBeenCalledWith("/payments/pay_1/capture");
  });
});

describe("listFailed", () => {
  it("filters by the failed status", async () => {
    axios.__instance.get.mockResolvedValueOnce({ data: { data: [] } });
    await payments.listFailed();
    expect(axios.__instance.get).toHaveBeenCalledWith("/payments", { params: { status: "failed", limit: 20 } });
  });
});
