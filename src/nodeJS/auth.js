let crypto = require('crypto');
let https = require('https');

let apiKey = ''; //put here your public key
let apiSecret = ''; //put here your secret key
let request = '/api/v4/trade-account/balance'; //put here request path. For obtaining trading balance use: /api/v4/trade-account/balance
let hostname = 'whitebit.com'; //domain without last slash. Do not use whitebit.com/
//If the nonce is similar to or lower than the previous request number, you will receive the 'too many requests' error message
let nonce = (Date.now() / 1000).toFixed(0);//nonce is a number that is always higher than the previous request number

let data = {
    currency: "BTC", //for example for obtaining trading balance for BTC currency
    request: request,
    nonce: nonce
}


let dataJsonStr = JSON.stringify(data);
let payload = Buffer.from(dataJsonStr).toString('base64');
let hash = crypto.createHmac('sha512', apiSecret);
let signature = hash.update(payload).digest('hex');

let options = {
    hostname: hostname,
    path: request,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-TXC-APIKEY': apiKey,
        'X-TXC-PAYLOAD': payload,
        'X-TXC-SIGNATURE': signature
    }
}

const req = https.request(options, res => {
    res.setEncoding('utf8')

    console.log(`statusCode: ${res.statusCode}`)

    let responseBody = '';

    res.on('data', chunk => {
        responseBody += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error("Api call failed with response code", res.statusCode);
        }

        console.log('Body:', responseBody);
    });
})

req.on('error', error => {
    console.error("Request error", error);
})

req.write(dataJsonStr);

req.end();