export const customBookingEmailTemplate = (booking) => {
  const { pricing } = booking;
  const totalTravelers = pricing.adults + pricing.women + pricing.children + pricing.infants;
  
  // Calculate savings if applicable
  const hasSavings = pricing.originalAmount && pricing.originalAmount > pricing.totalAmount;
  const savingsAmount = hasSavings ? pricing.originalAmount - pricing.totalAmount : 0;
  const savingsPercentage = hasSavings ? Math.round((savingsAmount / pricing.originalAmount) * 100) : 0;

  console.log('📧 Email template - Thumbnail URL:', booking.thumbnail || 'No thumbnail');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Exclusive ${booking.packageType} Package - Aarohan Holidays</title>
    </head>
    <body style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333333; background: #f5f5f5; padding: 0; margin: 0; -webkit-text-size-adjust: 100%;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: #E66926; padding: 30px 20px; text-align: center;">
          <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <img src="https://res.cloudinary.com/dvlsgka21/image/upload/v1761288219/Aarohan_Holidays_2_tdpfor.jpg" alt="Aarohan Holidays" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; display: block;">
          </div>
          <h1 style="font-size: 28px; font-weight: 700; color: white; margin: 0 0 8px 0; letter-spacing: 1px; line-height: 1.2;">AAROHAN HOLIDAYS</h1>
          <p style="font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 500; letter-spacing: 1px; text-transform: uppercase; margin: 0;">Travel Quotation</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 25px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
          <h2 style="font-size: 22px; font-weight: 600; color: #1e293b; margin: 0 0 12px 0; line-height: 1.3;">Hello ${booking.customerName},</h2>
          <p style="font-size: 15px; color: #666666; margin: 0; line-height: 1.6;">
            Thank you for your interest. We've prepared a customized ${booking.packageType.toLowerCase()} package for your upcoming journey.
          </p>
        </div>

        <!-- Package Details -->
        <div style="padding: 25px 20px; background: #fafafa; border-bottom: 1px solid #e5e5e5;">
          <div style="background: white; border: 2px solid #E66926; border-radius: 6px; padding: 20px; text-align: center;">
            <h3 style="font-size: 20px; font-weight: 600; color: #E66926; margin: 0 0 8px 0; line-height: 1.3;">${booking.packageName}</h3>
            <p style="font-size: 14px; color: #666666; margin: 0; line-height: 1.4;">${booking.duration} • ${booking.location}</p>
            
            ${booking.thumbnail ? `
            <div style="margin-top: 20px;">
              <img src="${booking.thumbnail}" alt="${booking.packageName}" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; display: block; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Trip Information -->
        <div style="padding: 25px 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #E66926; line-height: 1.3;">Trip Information</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px; width: 40%;">Destination</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.location}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Duration</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.duration}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Departure Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Total Travelers</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${totalTravelers} Person${totalTravelers > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Meeting Point</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.pickupCity}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Category</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.category}</td>
            </tr>
            ${booking.packageType === 'Trek' && booking.altitude ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Maximum Altitude</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.altitude}m</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #666666; font-size: 14px;">Difficulty Level</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.difficulty}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Description -->
        <div style="padding: 25px 20px; background: #fafafa; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 15px 0; line-height: 1.3;">Overview</h3>
          <p style="color: #555555; font-size: 14px; line-height: 1.8; margin: 0; text-align: justify;">
            ${booking.description}
          </p>
        </div>

        ${booking.highlights && booking.highlights.length > 0 ? `
        <!-- Highlights -->
        <div style="padding: 25px 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #E66926; line-height: 1.3;">Highlights</h3>
          ${booking.highlights.map((highlight, index) => `
            <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
              <tr>
                <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                  <div style="width: 24px; height: 24px; background: #E66926; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">${index + 1}</div>
                </td>
                <td style="vertical-align: top;">
                  <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">${highlight}</p>
                </td>
              </tr>
            </table>
          `).join('')}
        </div>
        ` : ''}

        ${booking.itinerary && booking.itinerary.length > 0 ? `
        <!-- Itinerary -->
        <div style="padding: 25px 20px; background: #fafafa; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #1E9ABF; line-height: 1.3;">Daily Itinerary</h3>
          
          ${booking.itinerary.map((day, index) => `
            <div style="margin-bottom: 25px; padding-bottom: 25px; ${index < booking.itinerary.length - 1 ? 'border-bottom: 1px solid #e5e5e5;' : ''}">
              <div style="display: inline-block; background: #1E9ABF; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 10px; line-height: 1.2;">DAY ${index + 1}</div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0; line-height: 1.3;">${day.title}</h4>
              <p style="font-size: 14px; color: #555555; line-height: 1.7; margin: 0 0 12px 0; text-align: justify;">${day.description}</p>
              
              ${day.note ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 12px; margin: 12px 0; border-radius: 4px;">
                <p style="font-size: 13px; color: #78350f; margin: 0; line-height: 1.6; font-style: italic;"><strong>📝 Note:</strong> ${day.note}</p>
              </div>
              ` : ''}
              
              ${day.meals || day.accommodation || (day.activities && day.activities.length > 0) ? `
              <table style="width: 100%; margin-top: 12px; border-collapse: collapse;">
                <tr>
                  ${day.meals ? `<td style="padding: 5px 5px 5px 0; vertical-align: top;"><span style="display: inline-block; background: #fff3cd; color: #856404; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap;">🍽️ ${day.meals}</span></td>` : ''}
                  ${day.accommodation ? `<td style="padding: 5px 5px 5px 0; vertical-align: top;"><span style="display: inline-block; background: #d1ecf1; color: #0c5460; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap;">🏨 ${day.accommodation}</span></td>` : ''}
                </tr>
              </table>
              ` : ''}
              
              ${day.activities && day.activities.length > 0 ? `
              <div style="margin-top: 12px; padding: 10px; background: #d4edda; border-radius: 4px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #155724;">🎯 Activities:</p>
                <ul style="margin: 0; padding-left: 20px; color: #155724; font-size: 13px;">
                  ${day.activities.map(activity => `<li style="margin-bottom: 4px;">${activity}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${booking.inclusions && booking.inclusions.length > 0 ? `
        <!-- Inclusions -->
        <div style="padding: 25px 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #10b981; line-height: 1.3;">What's Included</h3>
          ${booking.inclusions.map(item => `
            <table style="width: 100%; margin-bottom: 10px; border-collapse: collapse;">
              <tr>
                <td style="width: 25px; vertical-align: top; padding-right: 10px;">
                  <span style="color: #10b981; font-size: 16px; font-weight: bold;">✓</span>
                </td>
                <td style="vertical-align: top;">
                  <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">${item}</p>
                </td>
              </tr>
            </table>
          `).join('')}
        </div>
        ` : ''}

        ${booking.exclusions && booking.exclusions.length > 0 ? `
        <!-- Exclusions -->
        <div style="padding: 25px 20px; background: #fafafa; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #ef4444; line-height: 1.3;">What's Not Included</h3>
          ${booking.exclusions.map(item => `
            <table style="width: 100%; margin-bottom: 10px; border-collapse: collapse;">
              <tr>
                <td style="width: 25px; vertical-align: top; padding-right: 10px;">
                  <span style="color: #ef4444; font-size: 16px; font-weight: bold;">✗</span>
                </td>
                <td style="vertical-align: top;">
                  <p style="font-size: 14px; color: #555555; margin: 0; line-height: 1.6;">${item}</p>
                </td>
              </tr>
            </table>
          `).join('')}
        </div>
        ` : ''}

        ${booking.specialRequests ? `
        <!-- Special Requests -->
        <div style="padding: 25px 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 15px 0; line-height: 1.3;">Your Special Requests</h3>
          <div style="background: #f0f4ff; border-left: 4px solid #8b5cf6; padding: 15px; border-radius: 4px;">
            <p style="color: #555555; font-size: 14px; line-height: 1.7; margin: 0;">${booking.specialRequests}</p>
          </div>
        </div>
        ` : ''}

        <!-- Pricing -->
        <div style="padding: 25px 20px; background: #f8f9fa; border-top: 1px solid #e5e5e5;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #E66926; line-height: 1.3;">Pricing Details</h3>
          
          <!-- Category Badge -->
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; background: ${
              pricing.selectedCategory === 'budget' ? '#10b981' :
              pricing.selectedCategory === 'economy' ? '#3b82f6' :
              pricing.selectedCategory === 'deluxe' ? '#8b5cf6' :
              pricing.selectedCategory === 'premium' ? '#f59e0b' :
              '#ef4444'
            }; color: white; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              ${pricing.selectedCategory} CATEGORY
            </span>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #555555; font-size: 14px;">Number of Travelers</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">${pricing.numberOfMembers} Person${pricing.numberOfMembers > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #555555; font-size: 14px;">Price per Person</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1e293b; font-size: 14px; font-weight: 600; text-align: right;">₹${pricing.pricePerPerson.toLocaleString('en-IN')}</td>
            </tr>
            ${(pricing.adults > 0 || pricing.women > 0 || pricing.children > 0 || pricing.infants > 0) ? `
            <tr>
              <td colspan="2" style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                <p style="margin: 0; font-size: 12px; color: #666; font-style: italic;">
                  Demographics: ${[
                    pricing.adults > 0 ? `${pricing.adults} Adult${pricing.adults > 1 ? 's' : ''}` : '',
                    pricing.women > 0 ? `${pricing.women} Women` : '',
                    pricing.children > 0 ? `${pricing.children} Child${pricing.children > 1 ? 'ren' : ''}` : '',
                    pricing.infants > 0 ? `${pricing.infants} Infant${pricing.infants > 1 ? 's' : ''}` : ''
                  ].filter(Boolean).join(', ')}
                </p>
              </td>
            </tr>
            ` : ''}
          </table>
          
          ${hasSavings ? `
          <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; font-size: 14px; font-weight: 600; text-align: center; margin-bottom: 20px; line-height: 1.4;">
            You Save ₹${savingsAmount.toLocaleString('en-IN')} (${savingsPercentage}% OFF)
          </div>
          ` : ''}
          
          <table style="width: 100%; background: #E66926; border-radius: 6px; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px; color: white; font-size: 16px; font-weight: 600; vertical-align: middle; width: 60%;">
                Total Package Cost
              </td>
              <td style="padding: 20px; color: white; font-size: 22px; font-weight: 700; vertical-align: middle; text-align: right; width: 40%;">
                ${hasSavings ? `<div style="text-decoration: line-through; opacity: 0.7; font-size: 16px; margin-bottom: 5px;">₹${pricing.originalAmount.toLocaleString('en-IN')}</div>` : ''}
                <div>₹${pricing.totalAmount.toLocaleString('en-IN')}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align: center; padding: 30px 20px; background: white; border-top: 1px solid #e5e5e5;">
          <p style="font-size: 15px; color: #666666; margin: 0 0 20px 0; line-height: 1.4;">Ready to confirm your booking?</p>
          <table style="width: 100%; max-width: 300px; margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td style="padding-bottom: 12px;">
                <a href="#" style="display: block; background: #E66926; color: white; padding: 14px 20px; border-radius: 4px; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center;">Confirm Booking</a>
              </td>
            </tr>
            <tr>
              <td>
                <a href="#" style="display: block; background: white; color: #E66926; padding: 12px 20px; border-radius: 4px; font-size: 14px; font-weight: 600; text-decoration: none; border: 2px solid #E66926; text-align: center;">Contact Us</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #2d3748; color: white; padding: 30px 20px; text-align: center;">
          <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 20px 0; letter-spacing: 1px; line-height: 1.2;">AAROHAN HOLIDAYS</h4>
          
          <table style="width: 100%; max-width: 400px; margin: 0 auto 25px auto; border-collapse: collapse;">
            <tr>
              <td style="text-align: center; padding: 10px; font-size: 13px; color: #cbd5e0; vertical-align: top;">
                <div style="margin-bottom: 5px;">📞</div>
                <div style="line-height: 1.4;">+91 9011268465</div>
              </td>
              <td style="text-align: center; padding: 10px; font-size: 13px; color: #cbd5e0; vertical-align: top;">
                <div style="margin-bottom: 5px;">📧</div>
                <div style="line-height: 1.4;">info@aarohanholidays.com</div>
              </td>
              <td style="text-align: center; padding: 10px; font-size: 13px; color: #cbd5e0; vertical-align: top;">
                <div style="margin-bottom: 5px;">🌐</div>
                <div style="line-height: 1.4;">www.aarohanholidays.com</div>
              </td>
            </tr>
          </table>

          <div style="margin: 20px 0;">
            <a href="#" style="display: inline-block; margin: 0 8px; color: #cbd5e0; font-size: 18px; text-decoration: none; line-height: 1;">📘</a>
            <a href="#" style="display: inline-block; margin: 0 8px; color: #cbd5e0; font-size: 18px; text-decoration: none; line-height: 1;">📷</a>
            <a href="#" style="display: inline-block; margin: 0 8px; color: #cbd5e0; font-size: 18px; text-decoration: none; line-height: 1;">🐦</a>
            <a href="#" style="display: inline-block; margin: 0 8px; color: #cbd5e0; font-size: 18px; text-decoration: none; line-height: 1;">▶️</a>
          </div>

          <div style="font-size: 12px; color: #a0aec0; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); line-height: 1.4;">
            © ${new Date().getFullYear()} Aarohan Holidays. All Rights Reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};