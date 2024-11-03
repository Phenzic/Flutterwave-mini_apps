'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Calendar, ArrowLeft, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const [mounted, setMounted] = useState(false)
  const { amount } = useParams();
  
  // Calculate dispatch date (10 days from now)
  const dispatchDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  const formattedDispatchDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dispatchDate)

  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
      <Card className={`w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-xl transform transition-all duration-500 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">₦{amount?.toLocaleString()}</p>
            <p className="text-gray-600">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-700">Estimated Dispatch Date</h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                  <span>{formattedDispatchDate}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Your order will be processed and dispatched on this date.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/" className="w-full">
            <Button 
              variant="outline" 
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 