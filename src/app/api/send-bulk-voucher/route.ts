import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jsPDF from "jspdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { hotel, email, rows, subject, body } = await req.json();

    if (!email) {
      throw new Error("Hotel email not found");
    }

    const doc = new jsPDF();

    doc.setFillColor(20, 30, 50);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("DODOZ LEISURE", 14, 17);

    doc.setFontSize(10);
    doc.text("Hotel Reservation Department", 14, 26);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Address: Colombo, Sri Lanka", 14, 46);
    doc.text("Mobile: +94 77 123 4567", 14, 53);
    doc.text("Email: dodozleisure@gmail.com", 14, 60);

    doc.setFillColor(235, 235, 235);
    doc.rect(14, 72, 182, 12, "F");

    doc.setFontSize(16);
    doc.text("HOTEL ACCOMMODATION VOUCHER", 45, 80);

    doc.setFontSize(12);
    doc.text(`Hotel: ${hotel}`, 14, 96);

    let y = 112;

    rows.forEach((row: any, index: number) => {
      if (y > 260) {
        doc.addPage();

        doc.setFillColor(20, 30, 50);
        doc.rect(0, 0, 210, 25, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("DODOZ LEISURE", 14, 16);

        doc.setTextColor(0, 0, 0);
        y = 40;
      }

      doc.setFillColor(248, 248, 248);
      doc.rect(14, y - 7, 182, 24, "F");

      doc.setFontSize(10);
      doc.text(`${index + 1}. Date: ${row["DATE"] || row["Date"] || ""}`, 18, y);

      doc.text(
        `Meal Plan: ${row["MEAL PLAN"] || row["Meal Plan"] || ""}`,
        18,
        y + 7
      );

      doc.text(
        `SGL: ${row["SGL"] || "0"}   DBL: ${row["DBL"] || "0"}   TPL: ${
          row["TPL"] || "0"
        }`,
        105,
        y
      );

      doc.text(`Day: ${row["DAY"] || row["Day"] || ""}`, 105, y + 7);

      y += 30;
    });

    doc.setFillColor(20, 30, 50);
    doc.rect(0, 285, 210, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Thank you for partnering with Dodoz Leisure", 58, 292);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Dodoz Leisure" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: body,
      attachments: [
        {
          filename: `${hotel}-voucher.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}