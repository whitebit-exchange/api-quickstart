// See https://bun.sh/docs for more information

import crypto from "crypto";
import { Buffer } from "buffer";

const hostname = "https://whitebit.com";

const publicKey = "";
const secretKey = "";

/**
 * @see https://whitebit-exchange.github.io/api-docs/private/http-auth/#body-data
 */
function getRequestBody<T extends Object>(url: string, extendedBodyData?: T) {
  return Object.assign(
    {
      request: url,
      nonce: Date.now(),
      nonceWindow: true,
    },
    extendedBodyData
  );
}

/**
 * @see https://whitebit-exchange.github.io/api-docs/private/http-auth/#headers
 */
function getRequestParameters(params: ReturnType<typeof getRequestBody>) {
  const body = JSON.stringify(params);
  const payload = Buffer.from(body).toString("base64");
  const hash = crypto.createHmac("sha512", secretKey);
  const signature = hash.update(payload).digest("hex");

  const headers = {
    "Content-Type": "application/json",
    "X-TXC-APIKEY": publicKey,
    "X-TXC-PAYLOAD": payload,
    "X-TXC-SIGNATURE": signature,
  };

  return { headers, body };
}

type SingleTradeBalance = { available: string; freeze: string };
type TradeBalances = Record<string, SingleTradeBalance>;

function getTradeBalance(ticker: string): Promise<SingleTradeBalance | null>;
function getTradeBalance(): Promise<TradeBalances | null>;

/**
 * @see https://whitebit-exchange.github.io/api-docs/private/http-trade-v4/#trading-balance
 */
async function getTradeBalance(ticker?) {
  const requestUrl = "/api/v4/trade-account/balance";

  const parameters = ticker ? { ticker } : undefined;

  const data = getRequestBody(requestUrl, parameters);

  const { body, headers } = getRequestParameters(data);

  try {
    const response = await fetch(new URL(requestUrl, hostname), {
      method: "POST",
      body,
      headers,
    });

    console.log("Status code:", response.status);

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error.message);

    return null;
  }
}

const balance = await getTradeBalance("BTC");

console.log(balance);
