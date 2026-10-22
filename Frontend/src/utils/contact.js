// Single source of truth for the business phone / WhatsApp number.
const PHONE = '917276644221';

export const CONTACT = {
  phone: PHONE,
  display: '+91 72766 44221',
  email: 'info@aarohanholidays.com',
  mailto: 'mailto:info@aarohanholidays.com',
  tel: `tel:+${PHONE}`,
  whatsapp: `https://wa.me/${PHONE}`,
  whatsappWithText: (text) => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`,
};

// Public site facts used by SEO tags and structured data.
// ponytail: assumes the live domain is www.aarohanholidays.com - change SITE.url if it differs.
export const SITE = {
  url: 'https://www.aarohanholidays.com',
  name: 'Aarohan Holidays',
  tagline: 'Tours, treks and holiday packages across India',
  description:
    'Book handpicked tours, Himalayan and Sahyadri treks, fixed departures and custom holiday packages across India with Aarohan Holidays. Transparent pricing, expert guides, 24/7 support.',
  logo: 'https://res.cloudinary.com/dvlsgka21/image/upload/v1763733101/logo2_pdwnoo.jpg',
};
