import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Formatter;

public class TradeAccountBalanceJava {
    private static final String API_KEY = ""; //TODO: put here your public key
    private static final String API_SECRET = ""; //TODO: put here your secret key

    private static final String URL = "https://whitebit.com"; // Domain
    private static final String BALANCE_METHOD = "/api/v4/trade-account/balance"; // Method

    public static void main(String[] args) throws Exception {
        // Create Json object (You should use your favorite Json de-serialization library)
        String dataJson = String.format("{\"request\":\"%1$s\",\"ticker\":\"%2$s\",\"nonce\":\"%3$s\"}",
                BALANCE_METHOD,
                "BTC", // I want to get the balance for the BTC ticker
                System.currentTimeMillis()); // nonce is a number that is always higher than the previous request number

        // Payload and signature
        String payload = Base64.getEncoder().encodeToString(dataJson.getBytes());
        String signature = calcSignature(payload);

        // I am using the standard HttpClient (You should use your favorite HTTP client library)
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(URL + BALANCE_METHOD))
                .header("Content-type", "application/json")
                .header("X-TXC-APIKEY", API_KEY)
                .header("X-TXC-PAYLOAD", payload)
                .header("X-TXC-SIGNATURE", signature)
                .POST(HttpRequest.BodyPublishers.ofString(dataJson))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }

    private static String calcSignature(String data)
            throws NoSuchAlgorithmException, InvalidKeyException {

        final String HMAC_SHA512 = "HmacSHA512";
        SecretKeySpec secretKeySpec = new SecretKeySpec(API_SECRET.getBytes(), HMAC_SHA512);
        Mac mac = Mac.getInstance(HMAC_SHA512);
        mac.init(secretKeySpec);

        byte[] bytes = mac.doFinal(data.getBytes());
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }

        return formatter.toString();
    }
}