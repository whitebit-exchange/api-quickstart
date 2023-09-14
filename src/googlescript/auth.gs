function bytesToHex(bytes) {
  return bytes.reduce(function (acc, curr) {
    return acc + ("0" + (curr < 0 ? curr + 256 : curr).toString(16)).slice(-2);
  }, "");
}

function getAccountBalances() {
  const apiKey = "";
  const apiSecret = "";
  const request = "/api/v4/trade-account/balance";
  const hostname = "whitebit.com";

  const nonce = Date.now();
  const nonceWindow = true;

  const data = {
    ticker: "BTC",
    request: request,
    nonce: nonce,
    nonceWindow: nonceWindow,
  };

  const dataToString = JSON.stringify(data);
  const payload = Utilities.base64Encode(dataToString);
  const hmac = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_512,
    payload,
    apiSecret
  );
  const signature = bytesToHex(hmac);

  const options = {
    hostname: hostname,
    request: request,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TXC-APIKEY": apiKey,
      "X-TXC-PAYLOAD": payload,
      "X-TXC-SIGNATURE": signature,
    },
    muteHttpExceptions: true,
    payload: dataToString,
  };

  const url = `https://${hostname}${request}`;

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode === 200) {
    const data = JSON.parse(response.getContentText());
    console.log(data);
  } else {
    console.log("Error: " + responseCode + " " + response.getContentText());
  }
}
