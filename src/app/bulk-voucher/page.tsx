"use client";

import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { supabase } from "@/lib/supabase";

export default function BulkVoucherPage() {
  const [groupedHotels, setGroupedHotels] = useState<any>({});
  const [hotelEmails, setHotelEmails] = useState<any>({});
  const [sendingHotel, setSendingHotel] = useState("");
  const [sendingAll, setSendingAll] = useState(false);

  const [emailSubject, setEmailSubject] = useState(
    "Hotel Reservation Voucher"
  );

  const [emailBody, setEmailBody] = useState(`Dear Reservations Team,

Please find attached the hotel reservation voucher.

Kindly check and confirm the booking.

Thank you.

Best Regards,
Dodoz Leisure`);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    const { data } = await supabase.from("hotels").select("*");

    const emailMap: any = {};

    data?.forEach((hotel: any) => {
      emailMap[hotel.hotel_name?.toLowerCase().trim()] =
        hotel.reservation_email;
    });

    setHotelEmails(emailMap);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      const headers: string[] = [];

      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || "").trim();
      });

      const jsonData: any[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const rowData: any = {};

        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) rowData[header] = cell.value;
        });

        jsonData.push(rowData);
      });

      const grouped = jsonData.reduce((acc: any, row: any) => {
        const hotel =
          row["HOTEL"] ||
          row["Hotel"] ||
          row["hotel"] ||
          row["Hotel Name"] ||
          row["HOTEL NAME"];

        if (!hotel) return acc;

        const cleanHotel = String(hotel).trim();

        if (!acc[cleanHotel]) acc[cleanHotel] = [];

        acc[cleanHotel].push(row);

        return acc;
      }, {});

      setGroupedHotels(grouped);
    } catch (error) {
      console.error(error);
      alert("Excel reading failed. Please check Excel format.");
    }
  };

  const sendHotelVoucher = async (hotel: string) => {
    const email = hotelEmails[hotel.toLowerCase().trim()];

    if (!email) {
      alert("Hotel email not found for " + hotel);
      return false;
    }

    setSendingHotel(hotel);

    const res = await fetch("/api/send-bulk-voucher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotel,
        email,
        rows: groupedHotels[hotel],
        subject: `${emailSubject} - ${hotel}`,
        body: emailBody,
      }),
    });

    const result = await res.json();

    setSendingHotel("");

    if (!result.success) {
      alert("Failed: " + hotel + " - " + result.error);
      return false;
    }

    alert("Voucher sent to " + hotel);
    return true;
  };

  const sendAllHotels = async () => {
    const hotels = Object.keys(groupedHotels);

    if (hotels.length === 0) {
      alert("Please upload Excel file first.");
      return;
    }

    setSendingAll(true);

    let sent = 0;
    let failed = 0;

    for (const hotel of hotels) {
      const success = await sendHotelVoucher(hotel);
      if (success) sent++;
      else failed++;
    }

    setSendingAll(false);

    alert(`Bulk sending completed.\nSent: ${sent}\nFailed: ${failed}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Bulk Accommodation Voucher Upload
        </h1>

        <button
          onClick={sendAllHotels}
          disabled={sendingAll}
          className="bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          {sendingAll ? "Sending All..." : "Send All Hotels"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl mb-6">
        <label className="font-bold">Upload Accommodation Excel</label>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block mt-3 border p-3 rounded-lg bg-white text-black"
        />
      </div>

      <div className="bg-white p-6 rounded-xl mb-6">
        <h2 className="text-xl font-bold mb-4">Editable Email Template</h2>

        <label className="font-semibold">Email Subject</label>
        <input
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="w-full border p-3 rounded-lg mt-2 mb-4 bg-white text-black"
        />

        <label className="font-semibold">Email Body</label>
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          className="w-full border p-3 rounded-lg mt-2 h-40 bg-white text-black"
        />
      </div>

      {Object.keys(groupedHotels).length === 0 && (
        <div className="bg-yellow-100 p-4 rounded-lg">
          Excel columns must be: DATE, HOTEL, MEAL PLAN, SGL, DBL, TPL, DAY
        </div>
      )}

      {Object.keys(groupedHotels).map((hotel) => (
        <div key={hotel} className="bg-white p-6 rounded-xl mb-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{hotel}</h2>

              <p className="text-green-700">
                {hotelEmails[hotel.toLowerCase().trim()] ||
                  "Hotel email not found"}
              </p>
            </div>

            <button
              onClick={() => sendHotelVoucher(hotel)}
              disabled={sendingHotel === hotel || sendingAll}
              className="bg-black text-white px-5 py-2 rounded-lg"
            >
              {sendingHotel === hotel ? "Sending..." : "Send Voucher"}
            </button>
          </div>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Date</th>
                <th className="border p-2">Meal Plan</th>
                <th className="border p-2">SGL</th>
                <th className="border p-2">DBL</th>
                <th className="border p-2">TPL</th>
                <th className="border p-2">Day</th>
              </tr>
            </thead>

            <tbody>
              {groupedHotels[hotel].map((row: any, index: number) => (
                <tr key={index}>
                  <td className="border p-2">
                    {String(row["DATE"] || row["Date"] || "")}
                  </td>
                  <td className="border p-2">
                    {row["MEAL PLAN"] || row["Meal Plan"] || ""}
                  </td>
                  <td className="border p-2">{row["SGL"] || ""}</td>
                  <td className="border p-2">{row["DBL"] || ""}</td>
                  <td className="border p-2">{row["TPL"] || ""}</td>
                  <td className="border p-2">{row["DAY"] || row["Day"] || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </main>
  );
}