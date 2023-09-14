// Maker sure that you are using the 18+ version of Node.js

import crypto from "crypto";
import { Buffer } from "buffer";

const hostname = "https://whitebit.com";

const publicKey = "";
const secretKey = "";

/**
 * @see https://whitebit-exchange.github.io/api-docs/private/http-auth/#body-data
 */
function getRequestBody(url, extendedBodyData) {
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
function getRequestParameters(params) {
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

/**
 * @see https://whitebit-exchange.github.io/api-docs/private/http-trade-v4/#trading-balance
 */
async function getTradeBalance(ticker) {
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

    const data = await response.json().catch(() => null);

    return data;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

const balance = await getTradeBalance("BTC");

console.log(balance);
