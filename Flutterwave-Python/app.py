
import os
import requests
from dotenv import load_dotenv
# Load environment variables
load_dotenv()
FLW_SECRET_KEY = os.getenv('FLW_SECRET_KEY')
# Step 1: Fetch Bank Code from Flutterwave API
def get_bank_code(country, account_bank):
    url = f"https://api.flutterwave.com/v3/banks/{country}"
    headers = {
        "Authorization": f"Bearer {FLW_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Failed to fetch bank list: {response.text}")
    banks = response.json().get("data", [])
    print("Bank list fetched...")
    # Filter for the bank with the provided code
    selected_bank = next((bank for bank in banks if bank['code'] == account_bank), None)
    if not selected_bank:
        raise Exception(f"Bank not found for code: {account_bank}")
    
    print(f"Selected Bank: {selected_bank['name']}")
    return selected_bank
# Step 2: Resolve Bank Account Details
def resolve_account(account_number, account_bank):
    url = "https://api.flutterwave.com/v3/accounts/resolve"
    headers = {
        "Authorization": f"Bearer {FLW_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "account_number": account_number,
        "account_bank": account_bank
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Failed to resolve account: {response.text}")
    account_details = response.json().get("data")
    print("Account Verified:", account_details)
    return account_details
# Step 3: Initiate Transfer
def initiate_transfer(dummy_data, selected_bank):
    url = "https://api.flutterwave.com/v3/transfers"
    headers = {
        "Authorization": f"Bearer {FLW_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "account_bank": selected_bank["code"],
        "account_number": dummy_data["account_number"],
        "amount": dummy_data["amount"],
        "narration": dummy_data["narration"],
        "currency": dummy_data["currency"],
        "reference": dummy_data["reference"],
        "callback_url": "https://example.com/callback"
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Failed to initiate transfer: {response.text}")
    transfer_response = response.json().get("data")
    print("Transfer Initiated:", transfer_response)
    return transfer_response
# Step 4: Fetch Transfer Status
def fetch_transfer_status(transfer_id):
    url = f"https://api.flutterwave.com/v3/transfers/{transfer_id}"
    headers = {
        "Authorization": f"Bearer {FLW_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch transfer status: {response.text}")
    transfer_status = response.json().get("data")
    print("Transfer Status:", transfer_status)
    return transfer_status

# Dummy Data for the transfer
dummy_data = {
    "country": "NG",
    "account_number": "0690000031",  # Replace with actual account number
    "account_bank": "044",           # Replace with actual bank code (e.g., 044 for Access Bank Nigeria)
    "amount": 10000,                 # Amount to transfer
    "narration": "Payment for services rendered",
    "currency": "NGN",               # Currency code (e.g., NGN for Naira)
    "reference": "unique-transfery-rdd"  # Unique reference for the transaction
}

# Main Flow
try:
    # Step 1: Get Bank Code
    selected_bank = get_bank_code(dummy_data["country"], dummy_data["account_bank"])

    # Step 2: Resolve Account
    account_details = resolve_account(dummy_data["account_number"], selected_bank["code"])

    # Step 3: Initiate Transfer
    transfer_response = initiate_transfer(dummy_data, selected_bank)

    # Step 4: Fetch Transfer Status (using transfer_id from response)
    transfer_status = fetch_transfer_status(transfer_response["id"])

except Exception as e:
    print(f"Error: {e}")