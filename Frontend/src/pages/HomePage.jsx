import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HomeIntro from '../components/HomeIntro'
import UpcomingTours from '../components/UpcomingTours'
import UpcomingTreks from '../components/upcomingTreks'
import Testomonial from '../components/Testomonial'
import Footer from '../components/Footer'
import WhyTravelWithUs from '../components/WhyTravelWithUs'
import Seo from '../components/Seo'
import { SITE } from '../utils/contact'

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/tours?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const HomePage = () => (
  <div className="relative">
    <Seo jsonLd={websiteLd} />
    <Navbar />
    <main>
      <div id="hero">
        <Hero />
      </div>

      <HomeIntro />

      <div id="tours">
        <UpcomingTours />
      </div>

      <div id="treks">
        <UpcomingTreks />
      </div>

      <WhyTravelWithUs />

      <div id="testimonials">
        <Testomonial />
      </div>
    </main>
    <div id="footer">
      <Footer />
    </div>
  </div>
)

export default HomePage
