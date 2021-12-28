extern crate base64;

use reqwest::{Client,Error};
use base64::{encode};
use sha2::{Sha512};
use hmac::{Hmac, Mac, NewMac};
use std::string::{String};
use std::time::{SystemTime, UNIX_EPOCH};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Error> {

    let api_key = "your key";
    let api_secret = "your key";
    let request = "/api/v4/trade-account/balance";
    let base_url = "https://whitebit.com/";

    let from_the_epoch = SystemTime::now();

    let nonce = from_the_epoch.duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis()
            .to_string();

    let data = json!({
        "ticker": "BTC",
        "request": request,
        "nonce": &nonce
    });

    let payload = encode(data.to_string());

    type HmacSha512 = Hmac<Sha512>;
    let mut mac = HmacSha512::new_from_slice(api_secret.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let signature_bytes = mac.finalize().into_bytes();
    let mut signature = String::new();
    for byte_entry in &signature_bytes {
        let hex_byte = format!("{:02x}",byte_entry);
        signature.push_str(&hex_byte);
    }

    let complete_url = format!("{}{}", base_url, request);

    let client = Client::new();

    let res = client.post(complete_url)
        .json(&data)
        .header(reqwest::header::CONTENT_TYPE, "application/json")
        .header("x-txc-apikey", api_key)
        .header("x-txc-payload", payload)
        .header("x-txc-signature", signature)
        .send()
        .await
        .unwrap();

    println!("{}", "OK");
    Ok(println!("{}", res.text().await.unwrap()))
}
