const express = require('express');
const Flutterwave = require('flutterwave-node-v3');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
dotenv.config();

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
let new_ref = null;
let new_payload = null;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve static HTML for the form
app.get('/', (req, res) => {
  res.sendFile(__dirname + './index.html');
});

// Handle card charge
app.post('/charge-card', async (req, res) => {
    new_ref = "example" + Date.now();
    const payload = {
        card_number: req.body.card_number,
        cvv: req.body.cvv,
        expiry_month: req.body.expiry_month,
        expiry_year: req.body.expiry_year,
        currency: "NGN",
        amount: "100",
        email: req.body.email,
        fullname: req.body.fullname,
        phone_number: req.body.phone_number,
        enckey: process.env.FLW_ENCRYPTION_KEY,
        tx_ref: new_ref,
    };
    new_payload = payload;
    
    try {
        const response = await flw.Charge.card(payload);
        if (response.meta.authorization.mode === 'pin') {
            res.json({ 
                status: 'pin_required', 
            });
        } else if (response.meta.authorization.mode === 'redirect') {
            res.json({ 
                status: 'redirect_required', 
                url: response.meta.authorization.redirect, 
                tx_ref: new_ref
            });
        } else if (response.meta.authorization.mode === 'otp') {
            res.json({ 
                status: 'otp_required', 
                tx_ref: new_ref,
                flw_ref: response.data.flw_ref
            });
        } else {
            res.json({ status: 'success', data: response.data });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Handle additional authorization
app.post('/complete-charge', async (req, res) => {
    const { authMode, pin } = req.body;
    try {
        let response;
        if (authMode === 'pin') {
            response = await flw.Charge.card({
                ...new_payload,
                authorization: {
                    mode: 'pin',
                    pin: pin
                }
            });            
        }
        
        if (response.status === "success") {
            res.json({ status: 'success', data: response });
        } else {
            res.json({ status: 'failed', message: response.data.processor_response });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.post('/validate-charge', async (req, res) => {
    try {
        const { otp, flw_ref } = req.body;
        const response = await flw.Charge.validate({
            otp: otp,
            flw_ref: flw_ref
        });
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
