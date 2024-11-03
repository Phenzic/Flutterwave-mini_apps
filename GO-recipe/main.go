package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

// Load environment variables
var flwSecretKey string

func init() {
        err := godotenv.Load()
        if err != nil {
                fmt.Println("Error loading .env file")
        }
        flwSecretKey = os.Getenv("FLW_SECRET_KEY")
}

// Bank struct holds the bank code and name
type Bank struct {
        Code string `json:"code"`
        Name string `json:"name"`
}

// AccountDetails struct holds the account information
type AccountDetails struct {
        AccountNumber string `json:"account_number"`
        AccountName   string `json:"account_name"`
}

// TransferResponse struct holds the transfer response ID
type TransferResponse struct {
        ID int `json:"id"`
}

// TransferStatus struct holds the transfer status information
type TransferStatus struct {
        Status string `json:"status"`
}

// TransferVerification struct holds the transfer verification details
type TransferVerification struct {
        Status string  `json:"status"`
        Amount float64 `json:"amount"`
}

// Fetch bank code from Flutterwave API
func getBankCode(country, accountBank string) (Bank, error) {
        url := fmt.Sprintf("https://api.flutterwave.com/v3/banks/%s", country)
        req, _ := http.NewRequest("GET", url, nil)
        req.Header.Add("Authorization", "Bearer "+flwSecretKey)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return Bank{}, err
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        if resp.StatusCode != 200 {
                return Bank{}, fmt.Errorf("failed to fetch bank list: %s", string(body))
        }

        var result struct {
                Data []Bank `json:"data"`
        }
        json.Unmarshal(body, &result)

        fmt.Println("Bank list fetched...")

        // Filter by bank code
        for _, bank := range result.Data {
                if bank.Code == accountBank {
                        fmt.Printf("Selected Bank: %s\n", bank.Name)
                        return bank, nil
                }
        }

        return Bank{}, fmt.Errorf("bank not found for code: %s", accountBank)
}

// Resolve bank account details
func resolveAccount(accountNumber, accountBank string) (AccountDetails, error) {
        url := "https://api.flutterwave.com/v3/accounts/resolve"
        payload := map[string]string{
                "account_number": accountNumber,
                "account_bank":   accountBank,
        }
        jsonPayload, _ := json.Marshal(payload)

        req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
        req.Header.Add("Authorization", "Bearer "+flwSecretKey)
        req.Header.Add("Content-Type", "application/json")

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return AccountDetails{}, err
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        if resp.StatusCode != 200 {
                return AccountDetails{}, fmt.Errorf("failed to resolve account: %s", string(body))
        }

        var result struct {
                Data AccountDetails `json:"data"`
        }
        json.Unmarshal(body, &result)

        fmt.Printf("Account Verified: %+v\n", result.Data)
        return result.Data, nil
}

// Initiate a bank transfer
func initiateTransfer(dummyData map[string]interface{}, selectedBank Bank) (TransferResponse, error) {
        url := "https://api.flutterwave.com/v3/transfers"
        payload := map[string]interface{}{
                "account_bank":   selectedBank.Code,
                "account_number": dummyData["account_number"],
                "amount":         dummyData["amount"],
                "narration":      dummyData["narration"],
                "currency":       dummyData["currency"],
                "reference":      dummyData["reference"],
                "callback_url":   "https://example.com/callback",
        }
        jsonPayload, _ := json.Marshal(payload)

        req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
        req.Header.Add("Authorization", "Bearer "+flwSecretKey)
        req.Header.Add("Content-Type", "application/json")

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return TransferResponse{}, err
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        if resp.StatusCode != 200 {
                return TransferResponse{}, fmt.Errorf("failed to initiate transfer: %s", string(body))
        }
		
        var result struct {
                Data TransferResponse `json:"data"`
        }
        json.Unmarshal(body, &result)

        fmt.Printf("Transfer Initiated: %+v\n", result)
        return result.Data, nil
}

// Fetch the transfer status
func fetchTransferStatus(transferID int) (TransferStatus, error) {
        url := fmt.Sprintf("https://api.flutterwave.com/v3/transfers/%s", strconv.Itoa(transferID))
        req, _ := http.NewRequest("GET", url, nil)
        req.Header.Add("Authorization", "Bearer "+flwSecretKey)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return TransferStatus{}, err
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        if resp.StatusCode != 200 {
                return TransferStatus{}, fmt.Errorf("failed to fetch transfer status: %s", string(body))
        }

        var result struct {
                Data TransferStatus `json:"data"`
        }
        json.Unmarshal(body, &result)

        fmt.Printf("Transfer Status: %+v\n", result.Data)
        return result.Data, nil
}

// Verify a transfer
func verifyTransfer(transferID int) (TransferVerification, error) {
        url := fmt.Sprintf("https://api.flutterwave.com/v3/transfers/%s", strconv.Itoa(transferID))
        req, _ := http.NewRequest("GET", url, nil)
        req.Header.Add("Authorization", "Bearer "+flwSecretKey)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return TransferVerification{}, err
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        if resp.StatusCode != 200 {
                return TransferVerification{}, fmt.Errorf("failed to verify transfer: %s", string(body))
        }

        var result struct {
                Data TransferVerification `json:"data"`
        }
        json.Unmarshal(body, &result)

        fmt.Printf("Trasfer Verified: %+v\n", result.Data)
        return result.Data, nil
}

func main() {
        // Example: Fetch bank code
        country := "NG"         // Nigeria as an example
        accountBank := "044"    // Example bank code
        accountNumber := "0690000031" // Example account number

        // Step 1: Get the bank code
        selectedBank, err := getBankCode(country, accountBank)
        if err != nil {
                fmt.Printf("Error fetching bank code: %v\n", err)
                return
        }

        // Step 2: Resolve account details
        accountDetails, err := resolveAccount(accountNumber, selectedBank.Code)
        if err != nil {
                fmt.Printf("Error resolving account: %v\n", err)
                return
        }

        // Step 3: Initiate transfer
        dummyData := map[string]interface{}{
                "account_number": accountDetails.AccountNumber,
                "amount":         1000,
                "narration":      "Test transfer",
                "currency":       "NGN",
                "reference":      uuid.New().String(),
        }
        transferResponse, err := initiateTransfer(dummyData, selectedBank)
        if err != nil {
                fmt.Printf("Error initiating transfer: %v\n", err)
                return
        }

        // // Step 4: Fetch transfer status
        _, err = fetchTransferStatus(transferResponse.ID)
        if err != nil {
                fmt.Printf("Error fetching transfer status: %v\n", err)
                return
        }

        // Step 5: Verify transfer
        TransferVerification, err := verifyTransfer(transferResponse.ID)
        if err != nil {
                fmt.Printf("Error verifying transfer: %v\n", err)
                return
        }

        fmt.Printf("Transfer Complete, Transfer Status: %s, Amount: %.2f\n", TransferVerification.Status, TransferVerification.Amount)
}