using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace TradeAccountBalance
{
    internal class Payload
    {
        [JsonProperty("request")]
        public string Request { get; set; }

        [JsonProperty("nonce")]
        public string Nonce { get; set; }
        
        [JsonProperty("nonceWindow")]
        public bool NonceWindow { get; set; }

        [JsonProperty("ticker")]
        public string Ticker { get; set; }
    }

    internal static class Program
    {
        private static readonly HttpClient _httpClient = new HttpClient();

        private static async Task Main()
        {
            var apiKey = ""; // put here your public key
            var apiSecret = ""; // put here your secret key
            var request = "/api/v4/trade-account/balance"; // put here request path. For obtaining trading balance use: /api/v4/trade-account/balance
            var hostname = "https://whitebit.com"; // domain without last slash. Do not use whitebit.com/

            // If the nonce is similar to or lower than the previous request number, you will receive the 'too many requests' error message
            // nonce is a number that is always higher than the previous request number
            var nonce = GetNonce();
            var nonceWindow = true; // boolean, enable nonce validation in time range of current time +/- 5s, also check if nonce value is unique
            var data = new Payload
            {
                Ticker = "BTC", //for example for obtaining trading balance for BTC currency. Not Mandatory!
                Nonce = nonce,
                Request = request,
                NonceWindow = nonceWindow
            };

            var dataJsonStr = JsonConvert.SerializeObject(data);
            var payload = Base64Encode(dataJsonStr);
            var signature = CalcSignature(payload, apiSecret);

            var content = new StringContent(dataJsonStr, Encoding.UTF8, "application/json");
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{hostname}{request}")
            {
                Content = content
            };
            requestMessage.Headers.Add("X-TXC-APIKEY", apiKey);
            requestMessage.Headers.Add("X-TXC-PAYLOAD", payload);
            requestMessage.Headers.Add("X-TXC-SIGNATURE", signature);

            var response = await _httpClient.SendAsync(requestMessage);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine(responseBody);
        }

        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(plainTextBytes);
        }

        public static string CalcSignature(string text, string apiSecret)
        {
            using (var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(apiSecret)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(text));
                return BitConverter.ToString(hash).Replace("-", string.Empty).ToLower();
            }
        }
        private static string GetNonce()
        {
            var milliseconds = (long)DateTime.Now.ToUniversalTime()
                .Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc))
                .TotalMilliseconds;

            return milliseconds.ToString();
        }
    }
}
