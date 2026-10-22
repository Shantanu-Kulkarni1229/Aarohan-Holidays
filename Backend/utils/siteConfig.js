// Single source of truth for the business contact details used in emails and PDFs.
export const SITE = {
  name: 'Aarohan Holidays',
  email: process.env.OFFICIAL_EMAIL || 'info@aarohanholidays.com',
  phone: '+917276644221',
  phoneDisplay: '+91 72766 44221',
  whatsapp: 'https://wa.me/917276644221',
  website: 'https://www.aarohanholidays.com',
  websiteDisplay: 'www.aarohanholidays.com',
};
