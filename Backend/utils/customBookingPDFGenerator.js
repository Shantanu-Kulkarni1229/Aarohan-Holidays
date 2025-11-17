import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate Premium Booking PDF in memory (NO EMOJIS - Clean Text Only)
export const generateCustomBookingPDF = async (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('📄 Starting PDF generation for booking:', booking._id || 'unknown');
      console.log('📷 Thumbnail URL:', booking.thumbnail || 'No thumbnail');
      
      const doc = new PDFDocument({ 
        margin: 50, 
        size: "A4",
        bufferPages: true
      });

      // Store PDF in memory
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('✅ PDF generation completed! Buffer size:', pdfBuffer.length, 'bytes');
        resolve(pdfBuffer);
      });
      doc.on('error', (error) => {
        console.error('❌ PDF generation error:', error);
        reject(error);
      });

      // Colors - Added sky blue and tour-related colors
      const brandOrange = "#E66926";
      const brandBlue = "#1E9ABF";
      const skyBlue = "#87CEEB";
      const forestGreen = "#228B22";
      const mountainBrown = "#8B4513";
      const sunsetOrange = "#FF7F50";
      const darkText = "#1e293b";
      const mediumText = "#475569";
      const lightText = "#64748b";
      const borderColor = "#e2e8f0";

      // Page dimensions
      const pageWidth = 612;
      const pageHeight = 792;
      const contentWidth = 512; // 612 - 50*2 margins
      const leftMargin = 50;
      const rightMargin = 562;

      // ==================== HEADER FUNCTION (ALL PAGES) ====================
      const addHeader = (pageNumber) => {
        // Header Background - Full width
        doc.rect(0, 0, pageWidth, 100)
          .fill(brandOrange);
        
        // Logo and Company Name - Properly aligned
        try {
          const logoPath = path.join(__dirname, '..', 'assests', 'logo.jpg');
          doc.image(logoPath, leftMargin, 20, { width: 60, height: 60 });
        } catch (logoError) {
          console.warn('Logo not found, using text fallback:', logoError.message);
        }

        // Company Name and Tagline - Proper alignment
        doc.fontSize(20)
          .fillColor('#FFFFFF')
          .font("Helvetica-Bold")
          .text("AAROHAN HOLIDAYS", leftMargin + 70, 25);

        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .font("Helvetica")
          .text("WHERE ADVENTURES BEGIN", leftMargin + 70, 50);

        // Contact Info - Right aligned properly
        const contactX = 350;
        doc.fontSize(8)
          .fillColor('#FFFFFF')
          .text("www.aarohanholidays.com", contactX, 30, { width: 200, align: "left" })
          .text("+91 9011268465", contactX, 45, { width: 200, align: "left" })
          .text("info@aarohanholidays.com", contactX, 60, { width: 200, align: "left" });

        // Social Media - Right aligned
        doc.fontSize(7)
          .text("Follow: @aarohanholidays", contactX, 75, { width: 200, align: "left" });

        // Page Number - Fixed alignment in single line
        doc.fontSize(9)
          .fillColor('#FFFFFF')
          .font("Helvetica-Bold")
          .text(`Page ${pageNumber}`, rightMargin - 40, 35, { align: "right" });

        // Header bottom border - Full width
        doc.moveTo(0, 100)
          .lineTo(pageWidth, 100)
          .lineWidth(2)
          .strokeColor(brandBlue)
          .stroke();

        // Reset position for content
        doc.y = 120;
      };

      // ==================== FOOTER FUNCTION (ALL PAGES) ====================
      const addFooter = () => {
        const footerY = 730; // Fixed position from top
        
        // Footer top border - aligned with content width
        doc.moveTo(leftMargin, footerY)
          .lineTo(rightMargin, footerY)
          .lineWidth(1)
          .strokeColor(borderColor)
          .stroke();

        // Footer content - Proper three column layout
        // Left: Company info
        doc.fontSize(8)
          .fillColor(mediumText)
          .font("Helvetica-Bold")
          .text("AAROHAN HOLIDAYS", leftMargin, footerY + 10)
          .font("Helvetica")
          .text("Crafting Unforgettable Experiences", leftMargin, footerY + 20);

        // Center: Contact info
        const centerX = pageWidth / 2;
        doc.fontSize(8)
          .fillColor(mediumText)
          .font("Helvetica")
          .text("www.aarohanholidays.com", centerX - 100, footerY + 10, { width: 200, align: "center" })
          .text("+91 9011268465 | info@aarohanholidays.com", centerX - 100, footerY + 20, { width: 200, align: "center" })
          .text("Follow us for exciting offers", centerX - 100, footerY + 30, { width: 200, align: "center" });

        // Right: Confidential stamp
        doc.fontSize(7)
          .fillColor(lightText)
          .font("Helvetica-Bold")
          .text("CONFIDENTIAL", rightMargin - 80, footerY + 15, { align: "right" })
          .font("Helvetica")
          .text("FOR CUSTOMER USE ONLY", rightMargin - 80, footerY + 25, { align: "right" });

        // Add promotional footer image on every page - full width at bottom
        try {
          const footerImagePath = path.join(__dirname, '..', 'assests', 'FooterPdf.jpg');
          
          // Check if file exists
          if (require('fs').existsSync(footerImagePath)) {
            // Position at very bottom of page, full width
            const footerImageY = 750; // Position below footer text
            const footerImageHeight = 42; // Height of the banner (leaves no margin at bottom)
            
            doc.image(footerImagePath, 0, footerImageY, {
              width: pageWidth,
              height: footerImageHeight,
              align: 'center'
            });
          }
        } catch (footerImageError) {
          console.error('⚠️ Could not add footer image:', footerImageError.message);
        }
      };

      // ==================== SECTION DIVIDER ====================
      const addSectionDivider = () => {
        const currentY = doc.y;
        doc.moveTo(leftMargin, currentY)
          .lineTo(rightMargin, currentY)
          .lineWidth(1)
          .strokeColor(borderColor)
          .stroke();
        doc.moveDown(1);
      };

      // ==================== PAGE 1: COVER & PACKAGE OVERVIEW ====================
      addHeader(1);

      // Package Type Badge - Perfectly centered with increased font
      const badgeText = `${(booking.packageType || 'TOUR').toUpperCase()} PACKAGE`;
      const badgeWidth = 240;
      const badgeX = (pageWidth - badgeWidth) / 2;
      
      doc.roundedRect(badgeX, doc.y, badgeWidth, 45, 20)
        .fill(brandBlue);
      
      // Calculate optimal font size for badge
      const badgeFontSize = badgeText.length > 20 ? 14 : 16;
      doc.fontSize(badgeFontSize)
        .fillColor('#FFFFFF')
        .font("Helvetica-Bold")
        .text(badgeText, badgeX, doc.y + 15, { width: badgeWidth, align: "center" });

      doc.moveDown(3);

      // Package Name - Centered properly
      doc.fontSize(32)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text(booking.packageName || 'Adventure Package', leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(2);

      // Package Thumbnail Image with perfect centering and bounds checking
      if (booking.thumbnail) {
        try {
          console.log('📷 Loading thumbnail image from:', booking.thumbnail);
          
          const imageWidth = 400;
          const imageHeight = 250;
          const spaceNeeded = imageHeight + 40;
          const spaceAvailable = 730 - doc.y; // Footer at 730
          
          // Check if we need a new page
          if (spaceAvailable < spaceNeeded) {
            console.log('⚠️ Not enough space for thumbnail, adding new page');
            doc.addPage();
            addHeader(1);
          }
          
          const response = await axios.get(booking.thumbnail, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data);
          console.log('✅ Thumbnail loaded, buffer size:', imageBuffer.length, 'bytes');
          
          const imageY = doc.y;
          const imageX = (pageWidth - imageWidth) / 2;
          
          // Image container with shadow effect
          doc.roundedRect(imageX - 5, imageY - 5, imageWidth + 10, imageHeight + 10, 8)
            .fill('#f8fafc');
          
          doc.image(imageBuffer, imageX, imageY, { 
            width: imageWidth, 
            fit: [imageWidth, imageHeight]
          });
          
          doc.y = imageY + imageHeight + 30;
          console.log('✅ Thumbnail image added to PDF successfully at Y:', imageY);
        } catch (imageError) {
          console.error('❌ Failed to load thumbnail image:', imageError.message);
          doc.moveDown(1); // Add space even if image fails
        }
      }

      // Location and Duration - Centered properly with bounds check
      if (doc.y > 650) {
        doc.addPage();
        addHeader(1);
      }

      doc.fontSize(18)
        .fillColor(forestGreen)
        .font("Helvetica-Bold")
        .text(booking.location || 'Location TBD', leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(0.5);

      doc.fontSize(14)
        .fillColor(mountainBrown)
        .font("Helvetica")
        .text(booking.duration || 'Duration TBD', leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(2);

      addSectionDivider();

      // Guest Details Section - Proper alignment with bounds check
      if (doc.y > 550) {
        doc.addPage();
        addHeader(1);
      }

      doc.fontSize(16)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("GUEST INFORMATION", leftMargin)
        .moveDown(0.8);

      // Enhanced Customer Info Box with more fields and better alignment
      const boxY = doc.y;
      const boxWidth = contentWidth;
      const boxHeight = 120; // Increased height for additional fields
      
      doc.roundedRect(leftMargin, boxY, boxWidth, boxHeight, 8)
        .lineWidth(1.5)
        .strokeColor(brandOrange)
        .stroke();

      // Two-column layout for customer info - properly spaced
      const infoCol1X = leftMargin + 20;
      const infoCol2X = leftMargin + 260;
      const labelWidth = 100; // Increased for better alignment
      const rowHeight = 25;
      
      // Column 1 - Left side
      doc.fontSize(9)
        .fillColor(mediumText)
        .font("Helvetica-Bold")
        .text("FULL NAME:", infoCol1X, boxY + 15)
        .text("EMAIL:", infoCol1X, boxY + 15 + rowHeight)
        .text("PHONE:", infoCol1X, boxY + 15 + (rowHeight * 2))
        .text("BOOKING ID:", infoCol1X, boxY + 15 + (rowHeight * 3));

      doc.fontSize(9)
        .fillColor(darkText)
        .font("Helvetica")
        .text(booking.customerName || 'N/A', infoCol1X + labelWidth, boxY + 15, { width: 140 })
        .text(booking.customerEmail || 'N/A', infoCol1X + labelWidth, boxY + 15 + rowHeight, { width: 140 })
        .text(booking.customerPhone || 'N/A', infoCol1X + labelWidth, boxY + 15 + (rowHeight * 2), { width: 140 })
        .text(booking._id ? booking._id.toString().slice(-8) : 'N/A', infoCol1X + labelWidth, boxY + 15 + (rowHeight * 3), { width: 140 });

      // Column 2 - Right side
      doc.fontSize(9)
        .fillColor(mediumText)
        .font("Helvetica-Bold")
        .text("BOOKING DATE:", infoCol2X, boxY + 15)
        .text("PACKAGE TYPE:", infoCol2X, boxY + 15 + rowHeight)
        .text("TRAVELERS:", infoCol2X, boxY + 15 + (rowHeight * 2))
        .text("STATUS:", infoCol2X, boxY + 15 + (rowHeight * 3));

      const totalTravelers = (booking.pricing?.adults || 0) + (booking.pricing?.women || 0) + 
                            (booking.pricing?.children || 0) + (booking.pricing?.infants || 0);

      doc.fontSize(9)
        .fillColor(darkText)
        .font("Helvetica")
        .text(booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) : 'TBD', infoCol2X + labelWidth, boxY + 15, { width: 140 })
        .text((booking.packageType || 'Standard').toUpperCase(), infoCol2X + labelWidth, boxY + 15 + rowHeight, { width: 140 })
        .text(`${totalTravelers} Person${totalTravelers > 1 ? 's' : ''}`, infoCol2X + labelWidth, boxY + 15 + (rowHeight * 2), { width: 140 })
        .text("CONFIRMED", infoCol2X + labelWidth, boxY + 15 + (rowHeight * 3), { width: 140 });

      doc.y = boxY + boxHeight + 20;

      addFooter();
      
      // ==================== PAGE 2: PACKAGE DETAILS ====================
      doc.addPage();
      addHeader(2);

      // Package Overview - Proper alignment with bounds check
      if (doc.y > 650) {
        doc.addPage();
        addHeader(2);
      }

      doc.fontSize(20)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("PACKAGE OVERVIEW", leftMargin)
        .moveDown(0.8);

      const keyDetails = [
        { label: "Destination", value: booking.location || 'TBD' },
        { label: "Duration", value: booking.duration || 'TBD' },
        { label: "Total Travelers", value: `${totalTravelers} Guest${totalTravelers > 1 ? 's' : ''}` },
        { label: "Departure Date", value: booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD' },
        { label: "Pickup Point", value: booking.pickupCity || 'TBD' },
        { label: "Package Category", value: booking.category || 'Standard' },
      ];

      if (booking.packageType === 'Trek' && booking.altitude) {
        keyDetails.push({ label: "Max Altitude", value: `${booking.altitude}m` });
        if (booking.difficulty) keyDetails.push({ label: "Difficulty Level", value: booking.difficulty });
      }

      // Add constant tour package details
      keyDetails.push(
        { label: "Best Season", value: "October to April" },
        { label: "Age Group", value: "12 to 60 Years" },
        { label: "Fitness Level", value: "Moderate" },
        { label: "Guide Ratio", value: "1:8" }
      );

      // Grid layout for key details - perfectly aligned
      const gridItemWidth = 236;
      const gridGap = 20;
      const gridCol1X = leftMargin;
      const gridCol2X = leftMargin + gridItemWidth + gridGap;
      
      let gridY = doc.y;
      keyDetails.forEach((detail, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = col === 0 ? gridCol1X : gridCol2X;
        const y = gridY + (row * 35);

        // Detail box - consistent width
        doc.roundedRect(x, y, gridItemWidth, 30, 6)
          .fill('#f8fafc')
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();

        // Label
        doc.fontSize(9)
          .fillColor(mediumText)
          .font("Helvetica-Bold")
          .text(detail.label, x + 10, y + 8);
        
        // Value
        doc.fontSize(9)
          .fillColor(darkText)
          .font("Helvetica")
          .text(detail.value, x + 10, y + 18, { width: gridItemWidth - 20 });
      });

      doc.y = gridY + (Math.ceil(keyDetails.length / 2) * 35) + 20;

      addSectionDivider();

      // Package Description - Proper alignment
      doc.fontSize(16)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("EXPERIENCE HIGHLIGHTS", leftMargin)
        .moveDown(0.8);

      if (booking.highlights && booking.highlights.length > 0) {
        const bulletX = leftMargin + 15;
        const textX = leftMargin + 30;
        const textWidth = contentWidth - 45;
        
        booking.highlights.forEach((highlight) => {
          const startY = doc.y;
          doc.fontSize(10)
            .fillColor(brandBlue)
            .text("•", bulletX, startY);
          
          const textHeight = doc.heightOfString(highlight, { width: textWidth, lineGap: 4 });
          doc.fontSize(10)
            .fillColor(darkText)
            .font("Helvetica")
            .text(highlight, textX, startY, { width: textWidth, lineGap: 4 });
          
          doc.y = startY + textHeight + 8;
        });
        doc.moveDown(1);
      } else {
        // Default highlights if none provided
        const defaultHighlights = [
          "Expert local guides with extensive regional knowledge",
          "Comfortable accommodation in carefully selected properties",
          "Authentic local cuisine and dining experiences",
          "Small group sizes for personalized attention",
          "Safety-first approach with emergency protocols",
          "Sustainable and responsible tourism practices"
        ];
        
        const bulletX = leftMargin + 15;
        const textX = leftMargin + 30;
        const textWidth = contentWidth - 45;
        
        defaultHighlights.forEach((highlight) => {
          const startY = doc.y;
          doc.fontSize(10)
            .fillColor(brandBlue)
            .text("•", bulletX, startY);
          
          const textHeight = doc.heightOfString(highlight, { width: textWidth, lineGap: 4 });
          doc.fontSize(10)
            .fillColor(darkText)
            .font("Helvetica")
            .text(highlight, textX, startY, { width: textWidth, lineGap: 4 });
          
          doc.y = startY + textHeight + 8;
        });
        doc.moveDown(1);
      }

      addSectionDivider();

      // About This Experience - Proper alignment with bounds check
      if (doc.y > 500) {
        doc.addPage();
        addHeader(2);
      }

      doc.fontSize(16)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("ABOUT THIS JOURNEY", leftMargin)
        .moveDown(0.8);

      const description = booking.description || 'Embark on an unforgettable journey through stunning landscapes and cultural experiences. Our carefully crafted itinerary ensures you get the most out of your adventure while maintaining the highest standards of safety and comfort. This package is designed for travelers seeking authentic experiences combined with modern comforts.';
      
      doc.fontSize(10)
        .fillColor(darkText)
        .font("Helvetica")
        .text(description, leftMargin + 10, doc.y, { align: "justify", lineGap: 5, width: contentWidth - 20 })
        .moveDown(2);

      addFooter();

      // ==================== PAGE 3: ITINERARY ====================
      if (booking.itinerary && booking.itinerary.length > 0) {
        doc.addPage();
        addHeader(3);

        // Page title - perfectly centered
        doc.fontSize(22)
          .fillColor(brandOrange)
          .font("Helvetica-Bold")
          .text("YOUR JOURNEY ITINERARY", leftMargin, doc.y, { align: "center", width: contentWidth })
          .moveDown(1.5);

        booking.itinerary.forEach((day, index) => {
          // Check if we need new page
          if (doc.y > 550) {
            doc.addPage();
            addHeader(3);
          }

          const dayStartY = doc.y;

          // Day header with background - full content width
          doc.roundedRect(leftMargin, dayStartY, contentWidth, 35, 6)
            .fill(brandOrange);
          
          // Day number and title - properly aligned with spacing
          doc.fontSize(14)
            .fillColor('#FFFFFF')
            .font("Helvetica-Bold")
            .text(`DAY ${day.day}`, leftMargin + 20, dayStartY + 10)
            .text(day.title, leftMargin + 100, dayStartY + 10, { width: contentWidth - 120 });

          doc.y = dayStartY + 45;

          // Day description - proper margins with adequate spacing
          const descriptionText = day.description || 'A day filled with exciting activities and beautiful scenery.';
          doc.fontSize(10)
            .fillColor(darkText)
            .font("Helvetica")
            .text(descriptionText, leftMargin + 15, doc.y, { align: "justify", width: contentWidth - 30, lineGap: 5 })
            .moveDown(1); // Added more space

          // Additional info in a structured way with proper spacing
          const infoY = doc.y;
          const infoWidth = contentWidth - 30;
          const infoX = leftMargin + 15;

          if (day.meals || day.accommodation || day.activities || day.note) {
            doc.roundedRect(infoX, infoY, infoWidth, 80, 4) // Increased height for better spacing
              .fill('#f8fafc')
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .stroke();

            let infoLineY = infoY + 10; // Increased padding
            
            if (day.meals) {
              doc.fontSize(9)
                .fillColor(brandBlue)
                .font("Helvetica-Bold")
                .text("Meals:", infoX + 10, infoLineY);
              
              doc.fontSize(9)
                .fillColor(mediumText)
                .font("Helvetica")
                .text(day.meals, infoX + 50, infoLineY, { width: infoWidth - 60 });
              infoLineY += 18; // Increased line spacing
            }

            if (day.accommodation) {
              doc.fontSize(9)
                .fillColor(brandBlue)
                .font("Helvetica-Bold")
                .text("Accommodation:", infoX + 10, infoLineY);
              
              doc.fontSize(9)
                .fillColor(mediumText)
                .font("Helvetica")
                .text(day.accommodation, infoX + 80, infoLineY, { width: infoWidth - 90 });
              infoLineY += 18; // Increased line spacing
            }

            if (day.activities && day.activities.length > 0) {
              doc.fontSize(9)
                .fillColor(brandBlue)
                .font("Helvetica-Bold")
                .text("Activities:", infoX + 10, infoLineY);
              
              doc.fontSize(9)
                .fillColor(mediumText)
                .font("Helvetica")
                .text(day.activities.join(", "), infoX + 60, infoLineY, { width: infoWidth - 70 });
              infoLineY += 18; // Increased line spacing
            }

            if (day.note) {
              doc.fontSize(9)
                .fillColor(sunsetOrange)
                .font("Helvetica-Bold")
                .text("Special Note:", infoX + 10, infoLineY);
              
              doc.fontSize(9)
                .fillColor(mediumText)
                .font("Helvetica-Oblique")
                .text(day.note, infoX + 70, infoLineY, { width: infoWidth - 80 });
            }

            doc.y = infoY + 90; // Adjusted for increased height
          }

          doc.moveDown(1.5); // Increased spacing between days

          // Section divider between days
          if (index < booking.itinerary.length - 1) {
            addSectionDivider();
          }
        });

        addFooter();
      }

      // ==================== PAGE 4: INCLUSIONS & EXCLUSIONS ====================
      doc.addPage();
      addHeader(4);

      // Two-column layout for inclusions and exclusions - perfectly aligned
      const columnWidth = 236;
      const gap = 20;
      const col1X = leftMargin;
      const col2X = leftMargin + columnWidth + gap;
      const startY = 150;

      // Reset Y position for both columns
      doc.y = startY;

      // INCLUDED Column - properly positioned
      doc.fontSize(18)
        .fillColor(forestGreen)
        .font("Helvetica-Bold")
        .text("WHAT'S INCLUDED", col1X, doc.y)
        .moveDown(0.8);

      const inclusions = booking.inclusions || [
        "All accommodation during the tour",
        "All meals as mentioned in itinerary",
        "Experienced English-speaking guide",
        "All transportation during the tour",
        "Permits and entry fees",
        "First aid kit and emergency oxygen"
      ];

      const bulletX1 = col1X + 10;
      const textX1 = col1X + 25;
      const textWidth1 = columnWidth - 35;
      
      inclusions.forEach((inclusion) => {
        const startY = doc.y;
        doc.fontSize(10)
          .fillColor(forestGreen)
          .text("✓", bulletX1, startY);
        
        const textHeight = doc.heightOfString(inclusion, { width: textWidth1, lineGap: 3 });
        doc.fontSize(10)
          .fillColor(darkText)
          .font("Helvetica")
          .text(inclusion, textX1, startY, { width: textWidth1, lineGap: 3 });
        
        doc.y = startY + textHeight + 6;
      });

      // Reset position for second column
      doc.y = startY;

      // NOT INCLUDED Column - properly positioned
      doc.fontSize(18)
        .fillColor('#ef4444')
        .font("Helvetica-Bold")
        .text("WHAT'S NOT INCLUDED", col2X, doc.y)
        .moveDown(0.8);

      const exclusions = booking.exclusions || [
        "International/Domestic flights",
        "Travel insurance",
        "Personal expenses",
        "Alcoholic beverages",
        "Tips and gratuities",
        "Any services not mentioned"
      ];

      const bulletX2 = col2X + 10;
      const textX2 = col2X + 25;
      const textWidth2 = columnWidth - 35;
      
      exclusions.forEach((exclusion) => {
        const startY = doc.y;
        doc.fontSize(10)
          .fillColor('#ef4444')
          .text("✗", bulletX2, startY);
        
        const textHeight = doc.heightOfString(exclusion, { width: textWidth2, lineGap: 3 });
        doc.fontSize(10)
          .fillColor(darkText)
          .font("Helvetica")
          .text(exclusion, textX2, startY, { width: textWidth2, lineGap: 3 });
        
        doc.y = startY + textHeight + 6;
      });

      doc.y = 450;
      addSectionDivider();

      // Special Requests - properly aligned
      if (booking.specialRequests) {
        doc.fontSize(16)
          .fillColor(brandOrange)
          .font("Helvetica-Bold")
          .text("YOUR SPECIAL REQUESTS", leftMargin)
          .moveDown(0.8);

        const requestBoxX = leftMargin + 10;
        const requestBoxWidth = contentWidth - 20;
        
        doc.roundedRect(requestBoxX, doc.y, requestBoxWidth, 80, 6) // Increased height
          .fill('#fef3c7')
          .strokeColor('#f59e0b')
          .lineWidth(1)
          .stroke();

        doc.fontSize(10)
          .fillColor('#78350f')
          .font("Helvetica")
          .text(booking.specialRequests, requestBoxX + 10, doc.y + 15, { align: "justify", lineGap: 4, width: requestBoxWidth - 20 })
          .moveDown(5);
      } else {
        // Add default note if no special requests
        doc.fontSize(16)
          .fillColor(brandOrange)
          .font("Helvetica-Bold")
          .text("ADDITIONAL NOTES", leftMargin)
          .moveDown(0.8);

        const noteBoxX = leftMargin + 10;
        const noteBoxWidth = contentWidth - 20;
        
        doc.roundedRect(noteBoxX, doc.y, noteBoxWidth, 60, 6)
          .fill('#f0f9ff')
          .strokeColor(skyBlue)
          .lineWidth(1)
          .stroke();

        doc.fontSize(10)
          .fillColor(darkText)
          .font("Helvetica")
          .text("Please inform us of any dietary restrictions, medical conditions, or special requirements at least 7 days before departure.", noteBoxX + 10, doc.y + 10, { align: "justify", lineGap: 4, width: noteBoxWidth - 20 })
          .moveDown(4);
      }

      addFooter();

      // ==================== PAGE 5: PRICING DETAILS ====================
      doc.addPage();
      addHeader(5);

      // Page title - perfectly centered
      doc.fontSize(24)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("INVESTMENT BREAKDOWN", leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(1);

      const { pricing } = booking;
      
      // Category Badge - perfectly centered with increased font and better centering
      const categoryBadge = (pricing?.selectedCategory || 'STANDARD').toUpperCase();
      const categoryColors = {
        BUDGET: '#10b981',
        ECONOMY: '#3b82f6',
        DELUXE: '#8b5cf6',
        PREMIUM: '#f59e0b',
        LUXURY: '#ef4444',
        STANDARD: brandOrange
      };
      const categoryColor = categoryColors[categoryBadge] || brandOrange;

      const categoryBadgeWidth = 220;
      const categoryBadgeX = (pageWidth - categoryBadgeWidth) / 2;
      
      doc.roundedRect(categoryBadgeX, doc.y, categoryBadgeWidth, 45, 20)
        .fill(categoryColor);
      
      // Increased font size and better centering for category badge
      doc.fontSize(14)
        .fillColor('#FFFFFF')
        .font("Helvetica-Bold")
        .text(`${categoryBadge} CATEGORY`, categoryBadgeX, doc.y + 15, { width: categoryBadgeWidth, align: "center" });

      doc.moveDown(3);

      // Pricing table with perfect alignment
      const tableY = doc.y;
      const tableHeight = 160;
      
      // Table container - full content width
      doc.roundedRect(leftMargin, tableY, contentWidth, tableHeight, 8)
        .fill('#ffffff')
        .strokeColor(brandOrange)
        .lineWidth(2)
        .stroke();

      // Table header - full content width
      doc.rect(leftMargin, tableY, contentWidth, 30)
        .fill(brandOrange);

      // Table headers - properly aligned
      const descX = leftMargin + 20;
      const qtyX = leftMargin + 300;
      const amtX = leftMargin + 420;
      
      doc.fontSize(12)
        .fillColor('#FFFFFF')
        .font("Helvetica-Bold")
        .text("DESCRIPTION", descX, tableY + 8, { width: 250 })
        .text("QUANTITY", qtyX, tableY + 8, { width: 80, align: "center" })
        .text("AMOUNT (₹)", amtX, tableY + 8, { width: 80, align: "right" });

      let rowY = tableY + 40;

      // Travelers breakdown - properly aligned with safe defaults
      const travelerTypes = [];
      const pricePerPerson = pricing?.pricePerPerson || 0;
      
      if ((pricing?.adults || 0) > 0) travelerTypes.push({ type: "Adults", count: pricing.adults, rate: pricePerPerson });
      if ((pricing?.women || 0) > 0) travelerTypes.push({ type: "Women", count: pricing.women, rate: pricePerPerson });
      if ((pricing?.children || 0) > 0) travelerTypes.push({ type: "Children", count: pricing.children, rate: pricePerPerson * 0.7 });
      if ((pricing?.infants || 0) > 0) travelerTypes.push({ type: "Infants", count: pricing.infants, rate: 0 });

      travelerTypes.forEach((traveler) => {
        const amount = traveler.count * traveler.rate;
        
        doc.fontSize(10)
          .fillColor(darkText)
          .font("Helvetica")
          .text(traveler.type, descX, rowY, { width: 250 })
          .text(traveler.count.toString(), qtyX, rowY, { width: 80, align: "center" })
          .text(amount > 0 ? `₹ ${amount.toLocaleString('en-IN')}` : "Complimentary", amtX, rowY, { width: 80, align: "right" });

        rowY += 20;
      });

      // Total section - full content width
      const totalY = tableY + tableHeight - 40;
      doc.rect(leftMargin, totalY, contentWidth, 40)
        .fill(brandBlue);

      doc.fontSize(14)
        .fillColor('#FFFFFF')
        .font("Helvetica-Bold")
        .text("TOTAL PACKAGE COST", descX, totalY + 12, { width: 250 })
        .text(`₹ ${(pricing?.totalAmount || 0).toLocaleString('en-IN')}`, amtX, totalY + 12, { width: 80, align: "right" });

      doc.moveDown(4);

      // Important Notes - properly aligned
      doc.fontSize(14)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("IMPORTANT NOTES", leftMargin)
        .moveDown(0.8);

      const notes = [
        "This quotation is valid for 7 days from the date of issue",
        "Prices are subject to change based on availability and seasonal variations",
        "Advance booking recommended to secure your preferred dates",
        "Customization available for special requirements",
        "GST of 5% applicable on total package cost",
        "Early bird discounts available for bookings made 60 days in advance"
      ];

      const notesX = leftMargin + 15;
      notes.forEach((note) => {
        doc.fontSize(9)
          .fillColor(mediumText)
          .text(`• ${note}`, notesX, doc.y, { width: contentWidth - 30, lineGap: 3 })
          .moveDown(0.5);
      });

      addFooter();

      // ==================== PAGE 6: TERMS & CLOSING ====================
      doc.addPage();
      addHeader(6);

      // Page title - perfectly centered
      doc.fontSize(22)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("TERMS & CONDITIONS", leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(1.5);

      const terms = [
        "Payment Terms: 50% advance at the time of booking, remaining 50% 15 days before departure",
        "Cancellation Policy: 30+ days - 90% refund, 15-30 days - 50% refund, <15 days - No refund",
        "Travel insurance is highly recommended for all travelers",
        "The company reserves the right to modify itineraries due to weather conditions or unforeseen circumstances",
        "All guests must carry valid government-issued photo identification",
        "Any damage to property or equipment will be charged to the guest",
        "The company is not responsible for loss of personal belongings",
        "All disputes are subject to the exclusive jurisdiction of courts in Pune",
        "Force Majeure: Company not liable for circumstances beyond control including natural disasters, political unrest, etc.",
        "Health Requirements: Guests must declare any medical conditions affecting participation"
      ];

      const termsX = leftMargin + 15;
      const numberWidth = 20;
      const textWidth = contentWidth - 40;
      
      doc.fontSize(9)
        .fillColor(darkText)
        .font("Helvetica");

      terms.forEach((term, index) => {
        const numberY = doc.y;
        doc.text(`${index + 1}.`, termsX, numberY, { width: numberWidth });
        doc.text(term, termsX + numberWidth, numberY, { width: textWidth, lineGap: 4 }); // Increased line gap
        doc.moveDown(0.8);
      });

      doc.moveDown(2);

      // Final Call to Action - perfectly centered
      doc.fontSize(18)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("Ready to Begin Your Adventure?", leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(1);

      doc.fontSize(12)
        .fillColor(mediumText)
        .font("Helvetica")
        .text("Contact us now to confirm your booking and secure your dates", leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(2);

      // Contact Box - perfectly centered
      const contactBoxWidth = 400;
      const contactBoxX = (pageWidth - contactBoxWidth) / 2;
      const contactY = doc.y;
      
      doc.roundedRect(contactBoxX, contactY, contactBoxWidth, 70, 8) // Increased height
        .fill(brandBlue);

      doc.fontSize(14)
        .fillColor('#FFFFFF')
        .font("Helvetica-Bold")
        .text("GET IN TOUCH", contactBoxX, contactY + 12, { width: contactBoxWidth, align: "center" });

      doc.fontSize(11)
        .text("+91 9011268465", contactBoxX, contactY + 32, { width: contactBoxWidth, align: "center" });

      doc.fontSize(10)
        .text("info@aarohanholidays.com | www.aarohanholidays.com", contactBoxX, contactY + 48, { width: contactBoxWidth, align: "center" });

      doc.moveDown(4);

      // Final Thank You - perfectly centered
      doc.fontSize(14)
        .fillColor(brandOrange)
        .font("Helvetica-Bold")
        .text("Thank You for Considering Aarohan Holidays!", leftMargin, doc.y, { align: "center", width: contentWidth })
        .moveDown(0.5);

      doc.fontSize(10)
        .fillColor(mediumText)
        .font("Helvetica-Oblique")
        .text("We look forward to creating unforgettable memories with you", leftMargin, doc.y, { align: "center", width: contentWidth });

      addFooter();

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};