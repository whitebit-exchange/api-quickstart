import base64
import hashlib
import hmac
import json
import time

import requests


api_key = ''  # put here your public key
secret_key = ''  # put here your secret key
request = '/api/v4/trade-account/balance'  # put here request path. For obtaining trading balance use: /api/v4/trade-account/balance
baseUrl = 'https://whitebit.com'  # domain without last slash. Do not use https://whitebit.com/
# If the nonce is similar to or lower than the previous request number, you will receive the 'too many requests' error message
nonce = time.time_ns() // 1_000_000  # nonce is a number (preferrably epoch time in milliseconds) that is always higher than the previous request number

data = {
    'ticker': 'BTC',  # for example for obtaining trading balance for BTC currency
    'request': request,
    'nonce': nonce,
    'nonceWindow': True  # the api will validate that your nonce enter the range of current time +/- 5 seconds
}

# preparing request URL
completeUrl = baseUrl + request

data_json = json.dumps(data, separators=(',', ':'))  # use separators param for deleting spaces
payload = base64.b64encode(data_json.encode('ascii'))
signature = hmac.new(secret_key.encode('ascii'), payload, hashlib.sha512).hexdigest()

# preparing headers
headers = {
    'Content-type': 'application/json',
    'X-TXC-APIKEY': api_key,
    'X-TXC-PAYLOAD': payload,
    'X-TXC-SIGNATURE': signature,
}

# sending request
resp = requests.post(completeUrl, headers=headers, data=data_json)

# receiving data
print(json.dumps(resp.json(), sort_keys=True, indent=4))
