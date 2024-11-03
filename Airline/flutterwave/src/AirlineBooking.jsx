'use client'

import { useState } from 'react'
import { Button } from "./components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { AlertCircle, Plane } from "lucide-react"
import Logo from './assets/logo.webp'

// Define locations with coordinates
const locations = {
  "Cairo": { lat: 30.0444, lng: 31.2357 },
  "Lagos": { lat: 6.5244, lng: 3.3792 },
  "Kinshasa": { lat: -4.4419, lng: 15.2663 },
  "Johannesburg": { lat: -26.2041, lng: 28.0473 },
  "Nairobi": { lat: -1.2921, lng: 36.8219 },
  "Addis Ababa": { lat: 9.0300, lng: 38.7400 },
  "Casablanca": { lat: 33.5731, lng: -7.5898 },
  "Accra": { lat: 5.6037, lng: -0.1870 },
  "Algiers": { lat: 36.7538, lng: 3.0588 },
  "Khartoum": { lat: 15.5007, lng: 32.5599 },
  "Abidjan": { lat: 5.3599, lng: -4.0083 },
  "Dakar": { lat: 14.7167, lng: -17.4677 },
  "Luanda": { lat: -8.8390, lng: 13.2894 },
  "Kampala": { lat: 0.3476, lng: 32.5825 },
  "Dar es Salaam": { lat: -6.7924, lng: 39.2083 },
  "Douala": { lat: 4.0511, lng: 9.7679 },
  "Tunis": { lat: 36.8065, lng: 10.1815 },
  "Maputo": { lat: -25.9692, lng: 32.5732 },
  "Lusaka": { lat: -15.3875, lng: 28.3228 },
  "Harare": { lat: -17.8292, lng: 31.0522 },
  "Antananarivo": { lat: -18.8792, lng: 47.5079 },
  "Kigali": { lat: -1.9706, lng: 30.1044 },
  "Bamako": { lat: 12.6392, lng: -8.0029 },
  "Ouagadougou": { lat: 12.3714, lng: -1.5197 },
  "Conakry": { lat: 9.6412, lng: -13.5784 },
  "Yaoundé": { lat: 3.8480, lng: 11.5021 },
  "Libreville": { lat: 0.4162, lng: 9.4673 },
  "Freetown": { lat: 8.4657, lng: -13.2317 },
  "Monrovia": { lat: 6.3156, lng: -10.8074 },
  "Windhoek": { lat: -22.5597, lng: 17.0832 },
  "Gaborone": { lat: -24.6282, lng: 25.9231 },
  "Bujumbura": { lat: -3.3614, lng: 29.3599 },
  "Port Louis": { lat: -20.1609, lng: 57.5012 },
  "Victoria": { lat: -4.6191, lng: 55.4513 },
  "Moroni": { lat: -11.7172, lng: 43.2473 },
  "Djibouti": { lat: 11.8251, lng: 42.5903 },
  "Asmara": { lat: 15.3229, lng: 38.9251 },
  "Nouakchott": { lat: 18.0735, lng: -15.9582 },
  "Tripoli": { lat: 32.8872, lng: 13.1913 },
  "Mogadishu": { lat: 2.0469, lng: 45.3182 },
  "Juba": { lat: 4.8594, lng: 31.5713 },
  "Brazzaville": { lat: -4.2634, lng: 15.2429 },
  "Lomé": { lat: 6.1725, lng: 1.2314 },
  "Niamey": { lat: 13.5128, lng: 2.1128 },
  "N'Djamena": { lat: 12.1348, lng: 15.0557 },
  "Bangui": { lat: 4.3947, lng: 18.5582 },
  "Malabo": { lat: 3.7500, lng: 8.7833 },
  "Praia": { lat: 14.9330, lng: -23.5133 },
  "Banjul": { lat: 13.4549, lng: -16.5790 }
}

// Function to calculate distance using Google Maps API
const calculateDistance = (from, to) => {
  const fromCoords = locations[from]
  const toCoords = locations[to]

  
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return (R * c).toFixed(2); // Returns distance in km
  }
  
  
  // Simulating API call with setTimeout
  return new Promise((resolve) => {
    setTimeout(() => {
      // Random distance between 100 and 5000 km
      const distance = haversine(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
      resolve(distance)
    }, 2000) 
  })
}

export default function AirlineBooking() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingInfo, setBookingInfo] = useState(null)

  const handleBook = async () => {
    if (!from || !to) {
      setError('Please select both "From" and "To" locations.')
      setBookingInfo(null)
      return
    }

    if (from === to) {
      setError('From and To destinations cannot be the same.')
      setBookingInfo(null)
      return
    }

    setError('')
    setLoading(true)
    try {
      const distance = await calculateDistance(from, to)
      const amount = Math.floor(distance * 350) // $0.1 per km
      setBookingInfo({ distance, amount })
    } catch (err) {
      setError('Failed to calculate distance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">

            <div className="flex items-center justify-center gap-3">
              <img src={Logo} alt="Flutter Airlines" className="w-10 h-10 rounded-full" />
              Flutter Airlines
            </div>
            
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="from" className="text-sm font-medium text-gray-700">From</label>
            <Select onValueChange={setFrom}>
              <SelectTrigger id="from">
                <SelectValue placeholder="Select departure city" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(locations).map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-medium text-gray-700">To</label>
            <Select onValueChange={setTo}>
              <SelectTrigger id="to">
                <SelectValue placeholder="Select destination city" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(locations).map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {bookingInfo && (
            <Alert>
              <Plane className="h-4 w-4" />
              <AlertTitle>Booking Information</AlertTitle>
              <AlertDescription>
                Distance: {bookingInfo.distance} km<br />
                Amount: ₦{bookingInfo.amount.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className='flex flex-row gap-3 items-center justify-center'>
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            onClick={handleBook}
            disabled={loading || bookingInfo}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : 'Book Flight'}
          </Button>

          {bookingInfo && (
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              onClick={() => window.location.href = '/checkout'}
            >
              Proceed to Checkout
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}