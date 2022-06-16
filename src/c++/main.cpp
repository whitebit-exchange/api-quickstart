#include <string>
#include <chrono>
#include <curl/curl.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <boost/archive/iterators/base64_from_binary.hpp>
#include <boost/archive/iterators/transform_width.hpp>
#include <iostream>
#include <iomanip>
#include <sstream>

using namespace std;
using namespace std::chrono;
using namespace boost::archive::iterators;

constexpr string_view public_key = ""; // put here your public key
constexpr string_view secret_key = ""; // put here your secret key

string hmac_hex(const string &msg) {
    unsigned char hash[64];
    HMAC_CTX *hmac = HMAC_CTX_new();
    HMAC_Init_ex(hmac, secret_key.data(), secret_key.length(), EVP_sha512(), nullptr);
    HMAC_Update(hmac, reinterpret_cast<const unsigned char *>(msg.data()), msg.length());
    unsigned int len = 64;
    HMAC_Final(hmac, hash, &len);
    HMAC_CTX_free(hmac);
    std::stringstream ss;
    ss << std::hex << setfill('0');
    for (int i = 0; i < len; i++) {
        ss << std::setw(2) << static_cast<unsigned int> (hash[i]);
    }
    return ss.str();
}

string calculate_payload(const string &data_json) {
    using it_base64_t = base64_from_binary<transform_width<string::const_iterator, 6, 8> >;
    unsigned int write_padd_chars = (3 - data_json.length() % 3) % 3;
    string payload(it_base64_t(data_json.begin()), it_base64_t(data_json.end()));
    payload.append(write_padd_chars, '=');
    return payload;
}

int main() {
    static const string_view method = R"(/api/v4/trade-account/balance)"; // Method
    static const string_view ticker = "BTC"; // I want to get the balance for the BTC ticker
    auto nonce = duration_cast<milliseconds>(
            system_clock::now().time_since_epoch()
    ); // nonce is a number that is always higher than the previous request number
    static const string_view nonce_window = "true"; //This feature can be useful in high-frequency concurrent systems.

    string data_json = string(R"({"request":")").append(method).
                       append(R"(","ticker":")").append(ticker).
                       append(R"(","nonce":")").append(to_string(nonce.count())).
                       append(R"(","nonceWindow":)").append(nonce_window).
                       append(R"(})");

    // payload and signature
    string payload = calculate_payload(data_json);
    string signature = hmac_hex(payload);

    /* get a curl handle */
    CURL *curl = curl_easy_init();
    if (!curl) {
        cerr << "Failed to initialize curl";
        return -1;
    }

    static const string url = "https://whitebit.com";
    curl_easy_setopt(curl, CURLOPT_URL, string(url).append(method).c_str());

    curl_slist *chunk = nullptr;

    const string headers[] = {
            "Content-Type:application/json",
            (string("X-TXC-APIKEY:").append(public_key)),
            ("X-TXC-PAYLOAD:" + payload),
            ("X-TXC-SIGNATURE:" + signature)
    };

    for (auto &header: headers) {
        chunk = curl_slist_append(chunk, header.c_str());
    }


    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, chunk);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data_json.c_str());


    CURLcode result_code = curl_easy_perform(curl);
    curl_slist_free_all(chunk);
    /* Check for errors */
    if (result_code != CURLE_OK)
        cout << "curl_easy_perform() failed: \n" << curl_easy_strerror(result_code);

    /* always cleanup */
    curl_easy_cleanup(curl);

    return 0;
}
