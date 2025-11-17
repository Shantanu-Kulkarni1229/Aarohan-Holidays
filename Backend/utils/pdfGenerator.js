import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure PDF directory exists
const pdfDir = path.join(__dirname, "../pdfs");
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// ======= Helper Functions =======

// Header (logo + brand + contact)
const addHeader = (doc, logoPath) => {
  const primaryColor = "#E66926";
  const secondaryColor = "#1E9ABF";
  const lightGray = "#64748B";

  const headerY = 40;

  try {
    doc.image(logoPath, 260, headerY - 10, { width: 70, align: "center" });
  } catch {
    // Fallback if logo missing
    doc.fontSize(20).fillColor(primaryColor).text("AAROHAN HOLIDAYS", 0, headerY, { align: "center" });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(primaryColor)
    .text("AAROHAN HOLIDAYS", 0, headerY + 65, { align: "center" })
    .fontSize(10)
    .fillColor(secondaryColor)
    .text("Your Adventure Begins Here", { align: "center" })
    .moveDown(0.5)
    .fontSize(9)
    .fillColor(lightGray)
    .text("📞 +91 9011268465 | ✉️ info@aarohanholidays.com", { align: "center" })
    .text("🌐 www.aarohanholidays.com", { align: "center" });

  doc
    .strokeColor(primaryColor)
    .lineWidth(1)
    .moveTo(50, 125)
    .lineTo(550, 125)
    .stroke();

  doc.moveDown(1.5);
};

// Footer (socials + contact)
const addFooter = (doc) => {
  const lightGray = "#64748B";
  const primaryColor = "#E66926";

  const footerY = doc.page.height - 70;

  doc
    .strokeColor(primaryColor)
    .lineWidth(1)
    .moveTo(50, footerY - 10)
    .lineTo(550, footerY - 10)
    .stroke();

  doc
    .fontSize(9)
    .fillColor(lightGray)
    .text("🌐 www.aarohanholidays.com", 0, footerY + 5, { align: "center" })
    .text("📞 +91 9011268465 | ✉️ info@aarohanholidays.com", { align: "center" })
    .text(
      "📷 Instagram | 👍 Facebook | 🔗 LinkedIn",
      { align: "center" }
    );
};

// Helper to start new section with border and heading
const startNewSection = (doc, title, color = "#E66926") => {
  doc.addPage();
  addHeader(doc, doc.logoPath);
  doc
    .moveDown(2)
    .fontSize(16)
    .fillColor(color)
    .font("Helvetica-Bold")
    .text(title, { align: "center" })
    .moveDown(1);

  doc
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(70, doc.y)
    .lineTo(530, doc.y)
    .stroke()
    .moveDown(1);
};

// =============================================

export const generateCustomBookingPDF = async (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `custom-booking-${booking._id}-${Date.now()}.pdf`;
      const filepath = path.join(pdfDir, filename);
      const doc = new PDFDocument({ margin: 50, size: "A4", autoFirstPage: false });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Store logo path
      doc.logoPath = "./logo.png"; // <-- Replace later with your actual logo path

      // Colors
      const primaryColor = "#E66926";
      const secondaryColor = "#1E9ABF";
      const darkGray = "#334155";
      const lightGray = "#64748B";

      // ===== First Page =====
      doc.addPage();
      addHeader(doc, doc.logoPath);

      // Thumbnail Image
      if (booking.thumbnail) {
        try {
          doc.image(booking.thumbnail, 100, 150, { fit: [400, 220], align: "center", valign: "center" });
        } catch {
          doc
            .fontSize(10)
            .fillColor(lightGray)
            .text("(Thumbnail not available)", { align: "center", lineBreak: false });
        }
        doc.moveDown(15);
      }

      // Package Title
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text(booking.packageName.toUpperCase(), { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(12)
        .fillColor(secondaryColor)
        .font("Helvetica-Bold")
        .text(`${booking.packageType.toUpperCase()} PACKAGE`, { align: "center" })
        .moveDown(2);

      // Customer Info Box
      const boxY = doc.y;
      doc.roundedRect(50, boxY, 500, 100, 5).stroke(primaryColor);

      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Customer Information", 70, boxY + 15);

      doc
        .fontSize(11)
        .fillColor(darkGray)
        .font("Helvetica")
        .text(`Name: ${booking.customerName}`, 70, boxY + 40)
        .text(`Email: ${booking.customerEmail}`, 70, boxY + 55)
        .text(`Phone: ${booking.customerPhone}`, 70, boxY + 70);

      doc.moveDown(8);

      // ===== Package Details Section =====
      doc
        .fontSize(16)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Package Details")
        .moveDown(0.5);

      const details = [
        { label: "Location", value: booking.location },
        { label: "Duration", value: booking.duration },
        { label: "Category", value: booking.category },
        { label: "Region", value: booking.regionType },
        { label: "Pickup City", value: booking.pickupCity },
      ];

      details.forEach((d) => {
        doc
          .fontSize(11)
          .fillColor(darkGray)
          .font("Helvetica")
          .text(`${d.label}: `, { continued: true })
          .font("Helvetica-Bold")
          .text(d.value)
          .moveDown(0.3);
      });

      doc
        .moveDown(1)
        .strokeColor(primaryColor)
        .lineWidth(0.5)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1);

      // ===== Description =====
      doc
        .fontSize(16)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Package Description")
        .moveDown(0.5)
        .fontSize(11)
        .fillColor(darkGray)
        .font("Helvetica")
        .text(booking.description, { align: "justify" });

      // ===== Highlights =====
      if (booking.highlights?.length) {
        startNewSection(doc, "Package Highlights");
        booking.highlights.forEach((h) => {
          doc
            .fontSize(11)
            .fillColor(darkGray)
            .text(`✦ ${h}`, 70)
            .moveDown(0.3);
        });
      }

      // ===== Itinerary =====
      if (booking.itinerary?.length) {
        startNewSection(doc, "Detailed Itinerary");
        booking.itinerary.forEach((day, index) => {
          if (doc.y > 680) {
            doc.addPage();
            addHeader(doc, doc.logoPath);
          }
          doc
            .circle(65, doc.y + 10, 10)
            .fillAndStroke(primaryColor, primaryColor)
            .fontSize(10)
            .fillColor("#fff")
            .text(day.day, 57, doc.y + 4, { width: 16, align: "center" });

          doc
            .fontSize(13)
            .fillColor(darkGray)
            .font("Helvetica-Bold")
            .text(day.title, 90, doc.y - 10)
            .fontSize(10)
            .fillColor(darkGray)
            .font("Helvetica")
            .text(day.description, 90, doc.y + 10, { width: 440, align: "justify" })
            .moveDown(1);
        });
      }

      // ===== Inclusions =====
      if (booking.inclusions?.length) {
        startNewSection(doc, "Package Inclusions");
        booking.inclusions.forEach((i) =>
          doc.fontSize(11).fillColor(darkGray).text(`✓ ${i}`, 70).moveDown(0.3)
        );
      }

      // ===== Exclusions =====
      if (booking.exclusions?.length) {
        startNewSection(doc, "Package Exclusions");
        booking.exclusions.forEach((e) =>
          doc.fontSize(11).fillColor(darkGray).text(`✗ ${e}`, 70).moveDown(0.3)
        );
      }

      // ===== Pricing =====
      startNewSection(doc, "Pricing Details");
      const pricing = booking.pricing;
      const rows = [
        ["Adults", pricing.adults, pricing.adultPrice],
        ["Women", pricing.women, pricing.womenPrice],
        ["Children", pricing.children, pricing.childrenPrice],
        ["Infants", pricing.infants, pricing.infantPrice],
      ];

      doc.fontSize(11).fillColor(darkGray);
      rows.forEach(([label, count, price]) => {
        const total = count * price;
        doc.text(`${label}: ${count} × ₹${price.toLocaleString()} = ₹${total.toLocaleString()}`, 70);
      });

      doc
        .moveDown(1)
        .fontSize(13)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text(`Total Amount: ₹${pricing.totalAmount.toLocaleString()}`, { align: "right" })
        .moveDown(2)
        .fontSize(11)
        .fillColor(secondaryColor)
        .font("Helvetica-Bold")
        .text("Payment Link:", { align: "center" })
        .fillColor(lightGray)
        .font("Helvetica")
        .text(booking.paymentLink, { align: "center", link: booking.paymentLink })
        .moveDown(1);

      // ===== Terms & Conditions =====
      startNewSection(doc, "Terms & Conditions");
      const terms = [
        "This quote is valid for 7 days from the date of issue.",
        "Payment must be made as per the payment schedule mentioned.",
        "Cancellation charges apply as per our policy.",
        "All prices are in INR and subject to change without notice.",
        "Travel insurance recommended unless specified.",
        "Company reserves right to modify itinerary.",
        "All disputes subject to Pune jurisdiction only.",
      ];
      terms.forEach((t, i) => doc.fontSize(10).fillColor(darkGray).text(`${i + 1}. ${t}`).moveDown(0.3));

      // ===== CTA =====
      doc.moveDown(2);
      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Thank you for choosing Aarohan Holidays!", { align: "center" })
        .moveDown(0.3)
        .fontSize(11)
        .fillColor(lightGray)
        .text("We look forward to making your journey memorable!", { align: "center" });

      // Apply footer on every page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        addFooter(doc);
      }

      // Finalize PDF
      doc.end();
      stream.on("finish", () => resolve(filepath));
      stream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
