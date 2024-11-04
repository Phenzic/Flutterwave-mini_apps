'use client'

import { useState } from 'react'
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from 'react-router'

export default function Checkout() {
  const [formData, setFormData] = useState({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    currency: 'NGN',
    amount: '',
    email: '',
    fullname: '',
    phone_number: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [processStep, setProcessStep] = useState('idle'); // idle, creating-plan, creating-subscription, activating

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.card_number.match(/^\d{16}$/)) {
      newErrors.card_number = 'Invalid card number'
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Invalid CVV'
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Name is required'
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }
    if (!formData.amount.match(/^\d+$/)) {
      newErrors.amount = 'Invalid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create payment plan
      const paymentPlanResponse = await fetch('http://localhost:5570/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount,
          // Add other necessary payment plan details
        })
      });

      const paymentPlanData = await paymentPlanResponse.json();
      
      if (!paymentPlanResponse.ok) {
        throw new Error(paymentPlanData.error || 'Payment plan creation failed');
      }

      // Create subscription
      const subscriptionPayload = {
        card_number: formData.card_number,
        cvv: formData.cvv,
        expiry_month: formData.expiry_month,
        expiry_year: formData.expiry_year,
        currency: formData.currency,
        amount: formData.amount,
        email: formData.email,
        fullname: formData.fullname,
        phone_number: formData.phone_number,
        tx_ref: `TX-${Date.now()}`,
        payment_plan: paymentPlanData.data.id // Use the payment plan ID from the response
      };

      const subscriptionResponse = await fetch('http://localhost:5570/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionPayload)
      });

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData.error || 'Subscription creation failed');
      }

      // Activate subscription
      const activationResponse = await fetch('http://localhost:5570/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData.data.id // Use the subscription ID from the previous response
        })
      });

      const activationData = await activationResponse.json();

      if (!activationResponse.ok) {
        throw new Error(activationData.error || 'Subscription activation failed');
      }

      navigate('/payment-success');

    } catch (error) {
      console.error('Payment/Subscription error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Payment processing failed'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
    tx_ref: Date.now().toString(),
    amount: formData.amount,
    currency: formData.currency,
    payment_options: "card",
    customer: {
      email: formData.email,
      phone_number: formData.phone_number,
      name: formData.fullname,
    },
    customizations: {
      title: "FlutterAiline",
      description: "Payment for items in cart",
      logo: "https://your-logo-url.png",
    },
    callback: (response) => {
      closePaymentModal();
      if (response.status === "successful") {
        navigate('/payment-success');
      }
    },
    onClose: () => {},
    meta: {
      consumer_id: 23,
      consumer_mac: "92a3-912ba-1192a",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payment Details
          </CardTitle>
          <CardDescription>Enter your card information to complete the payment</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                placeholder="1234 5678 9012 3456"
                value={formData.card_number}
                onChange={(e) => handleInputChange('card_number', e.target.value)}
                maxLength={16}
                className={errors.card_number ? 'border-red-500' : ''}
              />
              {errors.card_number && <p className="text-sm text-red-500">{errors.card_number}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Expiry Month</Label>
                <Select onValueChange={(value) => handleInputChange('expiry_month', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0')
                      return <SelectItem key={month} value={month}>{month}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expiry Year</Label>
                <Select onValueChange={(value) => handleInputChange('expiry_year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString().slice(-2)
                      return <SelectItem key={year} value={year}>{year}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  maxLength={4}
                  className={errors.cvv ? 'border-red-500' : ''}
                />
                {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                placeholder="John Doe"
                value={formData.fullname}
                onChange={(e) => handleInputChange('fullname', e.target.value)}
                className={errors.fullname ? 'border-red-500' : ''}
              />
              {errors.fullname && <p className="text-sm text-red-500">{errors.fullname}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                placeholder="+234..."
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className={errors.phone_number ? 'border-red-500' : ''}
              />
              {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded disabled:opacity-50"
              disabled={loading}
              text={loading ? 'Processing...' : 'Pay Now'}
            >
              Pay Now
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}