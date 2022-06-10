package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"
)

type apiHelper struct {
	PublicKey string
	SecretKey string
	BaseURL   string
}

func (api *apiHelper) SendRequest(requestURL string, data map[string]interface{}) (responseBody []byte, err error) {
	//If the nonce is similar to or lower than the previous request number, you will receive the 'too many requests' error message
	nonce := int(time.Now().Unix()) //nonce is a number that is always higher than the previous request number

	data["request"] = requestURL
	data["nonce"] = strconv.Itoa(nonce)
	data["nonceWindow"] = false //boolean, enable nonce validation in time range of current time +/- 5s, also check if nonce value is unique

	requestBody, err := json.Marshal(data)
	if err != nil {
		return
	}

	//preparing request URL
	completeURL := api.BaseURL + requestURL

	//calculating payload
	payload := base64.StdEncoding.EncodeToString(requestBody)

	//calculating signature using sha512
	h := hmac.New(sha512.New, []byte(api.SecretKey))
	h.Write([]byte(payload))
	signature := fmt.Sprintf("%x", h.Sum(nil))

	client := http.Client{}

	request, err := http.NewRequest("POST", completeURL, bytes.NewBuffer(requestBody))
	if err != nil {
		log.Fatal(err)
	}

	//setting neccessarry headers
	request.Header.Set("Content-type", "application/json")
	request.Header.Set("X-TXC-APIKEY", api.PublicKey)
	request.Header.Set("X-TXC-PAYLOAD", payload)
	request.Header.Set("X-TXC-SIGNATURE", signature)

	//sending request
	response, err := client.Do(request)
	if err != nil {
		return
	}
	defer response.Body.Close()

	//reciving data
	responseBody, err = ioutil.ReadAll(response.Body)

	return
}

func main() {
	provider := apiHelper{
		PublicKey: "",                     //put here your public key
		SecretKey: "",                     //put here your secret key
		BaseURL:   "https://whitebit.com", //domain without last slash. Do not use https://whitebit.com/
	}

	//put here request path. For obtaining trading balance use: /api/v4/trade-account/balance
	request := "/api/v4/trade-account/balance"

	//put here data to send
	data := map[string]interface{}{
		"ticker": "BTC", //for example for obtaining trading balance for BTC currency
	}

	resultData, err := provider.SendRequest(request, data)
	if err != nil {
		log.Fatal(err)
	}

	var result interface{}
	if err := json.Unmarshal(resultData, &result); err != nil {
		log.Fatal(err)
	}

	//printing response body to default output
	log.Println(result)
}
