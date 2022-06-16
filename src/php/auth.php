<?php
$apiKey = ''; //put here your public key
$apiSecret = ''; //put here your secret key
$request = '/api/v4/trade-account/balance'; //put here request path. For obtaining trading balance use: /api/v4/trade-account/balance
$baseUrl = 'https://whitebit.com'; //domain without last slash. Do not use https://whitebit.com/
//If the nonce is similar to or lower than the previous request number, you will receive the 'too many requests' error message
$nonce = (string) (int) (microtime(true) * 10000); //nonce is a number that is always higher than the previous request number
$nonceWindow = true; //boolean, enable nonce validation in time range of current time +/- 5s, also check if nonce value is unique

$data = [
    'ticker' => 'BTC', //for example for obtaining trading balance for BTC currency
    'request' => $request,
    'nonce' => $nonce,
    'nonceWindow' => $nonceWindow,
];

//preparing request URL
$completeUrl = $baseUrl . $request;
$dataJsonStr = json_encode($data, JSON_UNESCAPED_SLASHES);
$payload = base64_encode($dataJsonStr);
$signature = hash_hmac('sha512', $payload, $apiSecret);

//preparing headers
$headers = [
    'Content-type: application/json',
    'X-TXC-APIKEY:'.$apiKey,
    'X-TXC-PAYLOAD:'.$payload,
    'X-TXC-SIGNATURE:'.$signature
];

$connect = curl_init($completeUrl);
curl_setopt($connect, CURLOPT_POSTFIELDS, $dataJsonStr);
curl_setopt($connect, CURLOPT_HTTPHEADER, $headers);
curl_setopt($connect, CURLOPT_RETURNTRANSFER, true);

$apiResponse = curl_exec($connect);
curl_close($connect);

//receiving data
$jsonArrayResponse = json_decode($apiResponse);
var_dump($jsonArrayResponse);
