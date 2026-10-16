# garde-sample-orders-api

A small Express "orders" API that is **deliberately out of date**, built to exercise AutoAPI end to end:
detection, API-change mapping, repair generation and pull-request delivery. Nothing here talks to a real
provider; every key in `.env.example` is a placeholder.

## What AutoAPI should find

| Provider | How it is used | Why it is out of date |
| --- | --- | --- |
| Stripe | `stripe@8` SDK pinned to API version `2020-08-27`; raw HTTP to `/v1/orders` | Charges + Sources are legacy (PaymentIntents replaced them); the Orders API was removed entirely |
| OpenAI | `openai@3` (`Configuration` + `OpenAIApi`); raw HTTP to `/v1/engines/.../completions` | v3 SDK replaced by v4; `text-davinci-003`, Completions and the `engines` route are retired |
| Twilio | `twilio@3` SDK | Programmable Chat (`chat.v2`) and Fax were shut down |
| GitHub | `@octokit/rest@16`; raw HTTP to `/teams/{team_id}/members` | Legacy team endpoints removed in favour of `/orgs/{org}/teams/{slug}`; reactions preview header obsolete |
| Resend | `resend@1` (`resend.sendEmail`) | Renamed to `emails.send` with a new response envelope in 2.0 |
| SendGrid | `@sendgrid/mail@7` | Old major; still works, useful as a "nothing to do" control |
| Plaid | `plaid@9` (`new plaid.Client`), API version `2019-05-29` | Pre-OpenAPI client; that API version is retired |
| Example Payments | Raw HTTP in `src/payments.js` | Fictional provider whose spec lives in `specs/`; v2 breaks the code on purpose |

Stripe, OpenAI, Twilio, GitHub, Resend and Plaid publish OpenAPI documents, so AutoAPI attaches a monitored
API source for each automatically after the first scan.

## Test playbook

1. **Connect the repository** in AutoAPI (branch `main`) and wait for the scan. The Integrations tab should
   list every provider above with high confidence, versions from `package-lock.json`, and evidence pointing at
   the lines in `src/`.
2. **Register the fictional provider.** Add an API source named `example-payments` with the URL of
   `specs/example-payments.yaml` on your fork (the raw GitHub URL, for example
   `https://raw.githubusercontent.com/<you>/garde-sample-orders-api/main/specs/example-payments.yaml`).
   Its `servers` entry (`api.example-payments.test`) lets AutoAPI link the raw HTTP calls in
   `src/payments.js` to the source. Re-run the scan once the source has its first snapshot.
3. **Break it.** Copy `specs/example-payments.v2.yaml` over `specs/example-payments.yaml`, commit and push.
   On the next poll AutoAPI diffs the two snapshots and should report:
   - breaking: `amount` changed from integer to string (`createPayment` multiplies it),
   - breaking: `POST /payments/{paymentId}/capture` removed (`capture`),
   - breaking: `idempotency_key` now required on `POST /payments`,
   - breaking: `failed` removed from the `status` enum (`listFailed`),
   - informational: `GET /refunds/{refundId}` deprecated, `/payouts` added.
   Each should map to a finding on this repository with the exact lines.
4. **Repair.** Request a repair on the `amount` finding. The patch should touch `src/payments.js` and
   `tests/payments.test.js` only. Deliver it as a pull request and review it on GitHub.
5. **Revert** by copying `specs/example-payments.v1.yaml` back to `specs/example-payments.yaml` to run the
   cycle again.

## Running it locally

```bash
npm install
npm test
```

`npm start` serves on port 4000, but the handlers will fail without real credentials; the repository exists to
be scanned, not deployed.
