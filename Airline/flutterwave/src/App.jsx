

import AirlineBooking from './AirlineBooking'
import Checkout from './Checkout'
import { Routes, Route } from 'react-router'
import PaymentSuccess from './ConfirmedPayment'

function App() {


  return (
    <Routes>
        <Route path="/" element={<AirlineBooking />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    )
  }

  export default App
