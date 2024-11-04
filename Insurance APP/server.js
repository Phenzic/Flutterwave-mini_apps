const express = require('express');
const bodyParser = require('body-parser');
const Flutterwave = require('flutterwave-node-v3');
const dotenv = require("dotenv")
const {v4: uuidv4} = require("uuid")

dotenv.config()

const app = express();
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const hash = uuidv4()
console.log(hash)
app.use(bodyParser.json());

// Endpoint for creating payment plans
app.post('/create-payment-plan', async (req, res) => {
    try {
        const payload = {
            amount: req.body.amount,
            name: req.body.name,
            interval: req.body.interval,
            currency: req.body.currency,
            duration: req.body.duration
        };
        const response = await flw.PaymentPlan.create(payload);
        console.log(response)
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for charging a customer for the subscription plan
app.post('/charge-customer', async (req, res) => {
    try {
        const payload = {
            card_number: req.body.card_number,
            cvv: req.body.cvv,
            expiry_month: req.body.expiry_month,
            expiry_year: req.body.expiry_year,
            currency: req.body.currency || 'NGN',
            amount: req.body.amount,
            email: req.body.email,
            payment_plan: req.body.payment_plan,
            enckey: process.env.FLW_ENCRYPTION_KEY,
            tx_ref: `charge-${hash}`,
        };
        const response = await flw.Charge.card(payload);
        console.log(response)
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for validating transactions
app.post('/validate-transaction', async (req, res) => {
    try {
        const payload = {
            id: req.body.id, // Transaction reference from the request body
        };
        const response = await flw.Transaction.verify(payload);
        console.log(response)
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Default endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Flutterwave API server!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
