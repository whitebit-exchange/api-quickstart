using Newtonsoft.Json;
using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using System;
using System.Net.Http;
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
            var nonce = DateTime.Now.ToUniversalTime()
                .Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc))
                .TotalMilliseconds
                .ToLong()
                .ToString(); // nonce is a number that is always higher than the previous request number

            var data = new Payload
            {
                Ticker = "BTC", //for example for obtaining trading balance for BTC currency. Not Mandatory!
                Nonce = nonce,
                Request = request
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

        public static string CalcSignature(string text, string key)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(text);

            var hmac = new HMac(new Org.BouncyCastle.Crypto.Digests.Sha512Digest());
            hmac.Init(new KeyParameter(System.Text.Encoding.UTF8.GetBytes(key)));

            byte[] result = new byte[hmac.GetMacSize()];
            hmac.BlockUpdate(bytes, 0, bytes.Length);
            hmac.DoFinal(result, 0);

            var hash = new StringBuilder();
            foreach (byte x in result)
            {
                hash.Append(String.Format("{0:x2}", x));
            }

            return hash.ToString();
        }
        private static long ToLong(this double value)
        {
            return (long)(value / 1000);
        }
    }
}
