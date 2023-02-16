import Foundation
import CommonCrypto

class TradeBalance {
    
    private let crypto = Crypto()
    
    private let apiKey = "" // put here your public key
    private let apiSecret = "" // put here your secret key
    
    private let path = "/api/v4/trade-account/balance"
    private let ticker = "BTC" // Getting the balance for the BTC ticker
    
    private var components: URLComponents {
        var components = URLComponents()
        components.scheme = "https"
        components.host = "whitebit.com"
        components.path = path
        return components
    }
    
    private var request: URLRequest {
        // Number that is always higher than the previous request number
        let nonce = String(Int(Date().timeIntervalSince1970 * 1000.0))
        
        // Create a json object
        let body = Data("{\"request\":\"\(path)\",\"ticker\":\"\(ticker)\",\"nonce\":\"\(nonce)\",\"nonceWindow\":\(true)}".utf8)
        
        let payload = body.base64EncodedString()
        let signature = crypto.SHA512(data: payload, key: apiSecret)
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        request.allHTTPHeaderFields = [
            "Content-type": "application/json",
            "X-TXC-APIKEY": apiKey,
            "X-TXC-PAYLOAD": payload,
            "X-TXC-SIGNATURE": signature
        ]
        request.httpBody = body
        
        return request
    }
    
    // MARK: - Public methods
    
    // I am using the standard URLSession (You should use your favourite library)
    func execute(completion: @escaping (Result<Data?, Error>) -> Void) {
        let session = URLSession(configuration: .default)
        
        let task = session.dataTask(with: request) { data, _, error in
            if let error { completion(.failure(error)) }
            
            completion(.success(data))
        }
        task.resume()
    }
}

struct Crypto {
    
    func SHA512(data: String, key: String) -> String {
        var digest = [UInt8](repeating: 0, count: Int(CC_SHA512_DIGEST_LENGTH))
        CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA512), key, key.count, data, data.count, &digest)
        return Data(digest).map { String(format: "%02hhx", $0) }.joined()
    }
}

struct App {
    
    private let tradeBalance = TradeBalance()
    
    func main() {
        postTradeBalance()
    }
    
    private func postTradeBalance() {
        tradeBalance.execute { result in
            switch result {
            case .success(let data):
                guard let data else { return }
                
                print(String(data: data, encoding: .utf8) ?? "")
            case .failure(let error):
                print(error.localizedDescription)
            }
        }
    }
}

let app = App()
app.main()
