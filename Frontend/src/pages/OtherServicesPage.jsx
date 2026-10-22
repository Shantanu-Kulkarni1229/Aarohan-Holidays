import React from 'react'
import Navbar from '../components/Navbar'
import OtherServices from '../components/OtherServices'
import Footer from '../components/Footer'
import Seo from '../components/Seo';

const OtherServicesPage = () => {
  return (
    <div className="relative bg-gray-50 min-h-screen">
      <Seo title="Travel Services – Taxi, Hotels, Visa, Cruise & More" description="Taxi booking, hotel reservations, visa and passport help, cruise holidays, flights, trains and more travel services from Aarohan Holidays." />
      <Navbar />
      <div className="pt-[calc(var(--header-h)+1rem)]">
        <OtherServices />
      </div>
      <Footer />
    </div>
  )
}

export default OtherServicesPage
