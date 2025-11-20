import React from 'react'
import Navbar from '../components/Navbar'
import OtherServices from '../components/OtherServices'
import Footer from '../components/Footer'

const OtherServicesPage = () => {
  return (
    <div className="relative bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-32">
        <OtherServices />
      </div>
      <Footer />
    </div>
  )
}

export default OtherServicesPage
