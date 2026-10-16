"use strict";

jest.mock("axios", () => ({ post: jest.fn(), create: () => ({ post: jest.fn(), get: jest.fn() }) }));
jest.mock("openai", () => {
  const createCompletion = jest.fn();
  return {
    Configuration: jest.fn(),
    OpenAIApi: jest.fn(() => ({ createCompletion })),
    __createCompletion: createCompletion,
  };
});

const openai = require("openai");
const ai = require("../src/ai");

describe("summarizeOrder", () => {
  it("returns the trimmed completion text", async () => {
    openai.__createCompletion.mockResolvedValueOnce({ data: { choices: [{ text: "  Two mugs, $24.  " }] } });
    await expect(ai.summarizeOrder({ amount: 24, currency: "USD", items: ["mug", "mug"] })).resolves.toBe("Two mugs, $24.");
    expect(openai.__createCompletion).toHaveBeenCalledWith(expect.objectContaining({ model: "text-davinci-003" }));
  });
});
