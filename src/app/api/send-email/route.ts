import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { voucher, settings, subject, body } = await req.json();

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(settings?.company_name || "Dodoz Leisure", 14, 20);

    doc.setFontSize(10);
    doc.text(settings?.address || "", 14, 28);
    doc.text(settings?.mobile_number || "", 14, 34);
    doc.text(settings?.email || "", 14, 40);

    doc.line(14, 45, 195, 45);

    doc.setFontSize(16);
    doc.text("HOTEL RESERVATION VOUCHER", 14, 57);

    autoTable(doc, {
      startY: 65,
      theme: "grid",
      body: [
        ["Tour Number", voucher.tour_number || ""],
        ["Guest Name", voucher.guest_name || ""],
        ["Nationality", voucher.nationality || ""],
        ["Hotel Name", voucher.hotel_name || ""],
        ["Room Type", voucher.room_type || ""],
        ["Room Count", String(voucher.room_count || "")],
        ["Check In", voucher.check_in || ""],
        ["Check Out", voucher.check_out || ""],
        ["Meal Plan", voucher.meal_plan || ""],
        ["Adults", String(voucher.adults || "")],
        ["Children", String(voucher.children || "")],
        ["Hotel Rate", voucher.hotel_rate || ""],
        ["Special Note", voucher.special_note || ""],
      ],
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const fileName = `${voucher.tour_number || "hotel-voucher"}.pdf`;
    const filePath = path.join(os.tmpdir(), fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    console.log("PDF FILE PATH:", filePath);
    console.log("PDF FILE SIZE:", fs.statSync(filePath).size);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"${settings?.company_name || "Dodoz Leisure"}" <${process.env.EMAIL_USER}>`,
      to: voucher.hotel_email,
      subject: subject + " - PDF ATTACHED",
      text: body,
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("MAIL SENT:", info.messageId);

    return NextResponse.json({
      success: true,
      pdfSize: fs.statSync(filePath).size,
    });
  } catch (error: any) {
    console.error("SEND EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}