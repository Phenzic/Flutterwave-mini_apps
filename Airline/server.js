const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const dotenv = require('dotenv');
const Flutterwave = require('flutterwave-node-v3');
const { v4: uuidv4 } = require('uuid');




dotenv.config();

app.use(cors());
app.use(express.json());

let transaction_payload = null; // Store transaction details temporarily
let txhash = uuidv4()
// Initialize card payment
app.post('/api/card/charge', async (req, res) => {
    const txRef = "FLIGHT-" + Date.now();
    const payload = {
        card_number: req.body.card_number,
        cvv: req.body.cvv,
        expiry_month: req.body.expiry_month,
        expiry_year: req.body.expiry_year,
        currency: "NGN",
        amount: req.body.amount,
        email: req.body.email,
        fullname: req.body.fullname,
        phone_number: req.body.phone_number,
        enckey: process.env.FLW_ENCRYPTION_KEY,
        tx_ref: `FLIGHT-${txhash}`,
        meta: req.body.meta // Store flight booking details
    };
    
    transaction_payload = payload;
    
    try {
        const flw = new Flutterwave(
            process.env.FLW_PUBLIC_KEY,
            process.env.FLW_SECRET_KEY
        );

        const response = await flw.Charge.card(payload);
        console.log(response)
        
        if (response.meta.authorization.mode === 'pin') {
            res.json({ 
                status: 'pin_required',
                tx_ref: txRef,
                // flw_ref: response.flw_ref
            });
            console.log(response.flw_ref)
        } else if (response.meta.authorization.mode === 'redirect') {
            res.json({ 
                status: 'redirect_required',
                url: response.meta.authorization.redirect,
                tx_ref: txRef
            });
        } else if (response.meta.authorization.mode === 'otp') {
            res.json({ 
                status: 'otp_required',
                tx_ref: txRef,
                flw_ref: response.data.flw_ref
            });
        } else {
            // Generate ticket if payment is successful without additional auth
            const ticketData = generateTicket(payload, response.data.id);
            res.json({ 
                status: 'success', 
                data: response.data,
                ticket: ticketData
            });
        }
    } catch (error) {
        console.error('Card charge error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// Handle PIN authorization
app.post('/api/card/complete', async (req, res) => {
    const { authMode, pin, tx_ref } = req.body;
    console.log(req.body)
    
    try {
        const flw = new Flutterwave(
            process.env.FLW_PUBLIC_KEY,
            process.env.FLW_SECRET_KEY
        );

        let response;
        console.log(transaction_payload)
        if (authMode === 'pin') {
            response = await flw.Charge.card({
                ...transaction_payload,
                authorization: {
                    mode: 'pin',
                    pin: pin,
                  },
                tx_ref: tx_ref,
                enckey: process.env.FLW_ENCRYPTION_KEY
            });            
        }
        console.log(response)
        if (response.status === "success") {
            res.json({ 
                status: 'success', 
                data: response,
                message: 'PIN validation successful. Please provide OTP to complete transaction.'
            });
        } else {
            res.json({ 
                status: 'failed', 
                // message: response.data.processor_response 
            });
        }
    } catch (error) {
        console.error('PIN validation error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// Validate transaction with OTP
app.post('/api/card/validate', async (req, res) => {
    try {
        const { otp, flw_ref } = req.body;
        const flw = new Flutterwave(
            process.env.FLW_PUBLIC_KEY,
            process.env.FLW_SECRET_KEY
        );

        const response = await flw.Charge.validate({
            otp: otp,
            flw_ref: flw_ref
        });

        if (response.status === 'success') {
            // Generate flight ticket after successful validation
            const ticketData = generateTicket(transaction_payload, response.data.id);
            
            res.json({
                status: 'success',
                message: 'Payment validated successfully',
                data: response.data,
                ticket: ticketData
            });
        } else {
            res.status(400).json({
                status: 'failed',
                message: 'OTP validation failed'
            });
        }
    } catch (error) {
        console.error('OTP validation error:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Helper function to generate flight ticket
function generateTicket(paymentDetails, transactionId) {
    const flightDetails = paymentDetails.flight_details;
    const ticketNumber = 'FL' + Date.now().toString().slice(-6);
    
    return {
        ticket_number: ticketNumber,
        transaction_id: transactionId,
        passenger_details: {
            name: paymentDetails.fullname,
            email: paymentDetails.email,
            phone: paymentDetails.phone_number
        },
        flight_details: {
            from: flightDetails.departure,
            to: flightDetails.destination,
            departure_date: flightDetails.date,
            flight_number: `AF${Math.floor(1000 + Math.random() * 9000)}`,
            seat: `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(1 + Math.random() * 30)}`,
            class: flightDetails.class || 'Economy',
            boarding_time: new Date(flightDetails.date).toLocaleTimeString(),
            gate: `G${Math.floor(1 + Math.random() * 20)}`
        },
        payment_details: {
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            payment_date: new Date().toISOString(),
            payment_reference: paymentDetails.tx_ref
        },
        additional_info: {
            baggage_allowance: '23kg',
            check_in_time: '2 hours before departure',
            boarding_instructions: 'Please arrive at the gate at least 30 minutes before departure'
        }
    };
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));