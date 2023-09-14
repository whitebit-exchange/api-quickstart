let crypto = require("crypto");
let https = require("https");

const hostname = "whitebit.com";

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
function getRequestOptions(method, params) {
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

  return {
    body,
    options: { headers, method, hostname, path: params.request },
  };
}

/**
 * @see https://whitebit-exchange.github.io/api-docs/private/http-trade-v4/#trading-balance
 */
const requestUrl = "/api/v4/trade-account/balance";

const data = getRequestBody(requestUrl, { ticker: "BTC" });
const { body, options } = getRequestOptions("POST", data);

console.log(options);

const req = https.request(options, (res) => {
  res.setEncoding("utf8");

  console.log(`statusCode: ${res.statusCode}`);

  let responseBody = "";

  res.on("data", (chunk) => {
    responseBody += chunk;
  });

  res.on("end", () => {
    if (res.statusCode !== 200) {
      console.error("Api call failed with response code", res.statusCode);
    }

    console.log("Body:", responseBody);
  });
});

req.on("error", (error) => {
  console.error("Request error", error);
});

req.write(body);

req.end();
