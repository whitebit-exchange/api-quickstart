require 'json'
require 'base64'
require 'openssl'
require 'net/http'

api_key = '' # put here your public key
api_secret = '' # put here your secret key
base_url = 'https://whitebit.com' # domain without last slash. Do not use https://whitebit.com/

ticker = 'BTC'
request = '/api/v4/trade-account/balance' # put here request path. For obtaining trading balance use: /api/v4/trade-account/balance
nonce = (Time.now.to_f * 1000).to_i
nonce_window = false # boolean, enable nonce validation in time range of current time +/- 5s, also check if nonce value is unique

data = {
    'ticker': ticker,
    'request': request,
    'nonce': nonce,
    'nonceWindow': nonce_window
}

complete_url = base_url + request
data_json_str = data.to_json
payload = Base64.strict_encode64(data_json_str)
signature = OpenSSL::HMAC.hexdigest('SHA512', api_secret, payload)

header = {
    'Content-Type': 'application/json',
    'X-TXC-APIKEY': api_key,
    'X-TXC-PAYLOAD': payload,
    'X-TXC-SIGNATURE': signature
}

uri = URI.parse(complete_url)
request_data = Net::HTTP::Post.new(uri.request_uri, header)
request_data.body = data_json_str
response = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(request_data) }

puts response.code
puts response.message
puts response.body
