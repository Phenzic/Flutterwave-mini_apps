const express = require('express');
const Flutterwave = require('flutterwave-node-v3');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

// Endpoint 1: Initiate card charge
app.post('/initiate-charge', async (req, res) => {
    try {
        const payload = req.body;
        payload.enckey = process.env.FLW_ENCRYPTION_KEY;
        
        const response = await flw.Charge.card(payload);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 2: Handle additional validation
app.post('/handle-validation', async (req, res) => {
    try {
        const { payload, authMode } = req.body;
        let response;

        if (authMode === 'pin') {
            response = await flw.Charge.card(payload);
        } else if (authMode === 'avs_noauth') {
            response = await flw.Charge.card(payload);
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 3: Validate charge
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
