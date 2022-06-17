import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.*
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

private const val API_KEY = "" //TODO: put here your public key
private const val API_SECRET = "" //TODO: put here your secret key

private const val URL = "https://whitebit.com" // Domain
private const val BALANCE_METHOD = "/api/v4/trade-account/balance" // Method

fun main() {
    val ticker = "BTC" // I want to get the balance for the BTC ticker
    val nonce = System.currentTimeMillis() // nonce is a number that is always higher than the previous request number

    // Create Json object (You should use your favorite Json de-serialization library)
    val dataJson = "{\"request\":\"$BALANCE_METHOD\",\"ticker\":\"$ticker\",\"nonce\":\"$nonce\",\"nonceWindow\":true}";

    // Payload and signature
    val payload = Base64.getEncoder().encodeToString(dataJson.toByteArray())
    val signature = calcSignature(payload)

    // I am using the standard HttpClient (You should use your favorite HTTP client library)
    val client = HttpClient.newHttpClient()
    val request = HttpRequest.newBuilder()
            .uri(URI.create(URL + BALANCE_METHOD))
            .header("Content-type", "application/json")
            .header("X-TXC-APIKEY", API_KEY)
            .header("X-TXC-PAYLOAD", payload)
            .header("X-TXC-SIGNATURE", signature)
            .POST(HttpRequest.BodyPublishers.ofString(dataJson))
            .build()

    val response = client.send(request, HttpResponse.BodyHandlers.ofString())
    println(response.body())
}

private fun calcSignature(data: String): String? {
    val HMAC_SHA512 = "HmacSHA512"
    val secretKeySpec = SecretKeySpec(API_SECRET.toByteArray(), HMAC_SHA512)
    val mac = Mac.getInstance(HMAC_SHA512)
    mac.init(secretKeySpec)
    val bytes = mac.doFinal(data.toByteArray())
    val formatter = Formatter()
    for (b in bytes) {
        formatter.format("%02x", b)
    }
    return formatter.toString()
}
