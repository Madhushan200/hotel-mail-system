"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VoucherHistoryPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadVouchers();
    loadSettings();
  }, []);

  const loadVouchers = async () => {
    const { data } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    setVouchers(data || []);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();

    setSettings(data);
  };

  const generatePDF = (voucher: any) => {
    const doc = new jsPDF();

    doc.setFontSize(22);

    doc.text(
      settings?.company_name || "Company Name",
      14,
      20
    );

    doc.setFontSize(10);

    doc.text(settings?.address || "", 14, 28);

    doc.text(
      `${settings?.mobile_number || ""} | ${settings?.email || ""}`,
      14,
      34
    );

    doc.line(14, 40, 195, 40);

    doc.setFontSize(18);

    doc.text("HOTEL RESERVATION VOUCHER", 14, 52);

    autoTable(doc, {
      startY: 60,
      body: [
        ["Tour Number", voucher.tour_number],
        ["Guest Name", voucher.guest_name],
        ["Nationality", voucher.nationality],
        ["Hotel Name", voucher.hotel_name],
        ["Room Type", voucher.room_type],
        ["Room Count", voucher.room_count],
        ["Check In", voucher.check_in],
        ["Check Out", voucher.check_out],
        ["Meal Plan", voucher.meal_plan],
        ["Adults", voucher.adults],
        ["Children", voucher.children],
        ["Hotel Rate", voucher.hotel_rate],
        ["Special Note", voucher.special_note],
      ],
    });

    doc.text(
      settings?.voucher_footer_note || "",
      14,
      doc.lastAutoTable.finalY + 20
    );

    doc.save(`${voucher.tour_number}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Voucher History
      </h1>

      <div className="bg-white rounded-xl p-6 overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Tour No</th>
              <th className="border p-2">Guest</th>
              <th className="border p-2">Hotel</th>
              <th className="border p-2">Hotel Email</th>
              <th className="border p-2">PDF</th>
            </tr>
          </thead>

          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.id}>
                <td className="border p-2">
                  {voucher.tour_number}
                </td>

                <td className="border p-2">
                  {voucher.guest_name}
                </td>

                <td className="border p-2">
                  {voucher.hotel_name}
                </td>

                <td className="border p-2">
                  {voucher.hotel_email}
                </td>

                <td className="border p-2">
                  <button
                    onClick={() => generatePDF(voucher)}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}