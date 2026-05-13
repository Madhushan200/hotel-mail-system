"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EmailPreviewPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [sending, setSending] = useState(false);

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

  const selectVoucher = (id: string) => {
    const voucher = vouchers.find((v) => v.id === id);
    setSelectedVoucher(voucher);
  };

  const subject = selectedVoucher
    ? `Room Reservation Voucher - Tour No: ${selectedVoucher.tour_number}`
    : "";

  const emailBody = selectedVoucher
    ? `Dear Reservations Team,

Please find attached the hotel reservation voucher.

Kindly check and confirm the booking availability.

Thank you.

Best Regards,
${settings?.company_name || "Dodoz Leisure"}`
    : "";

  const sendEmail = async () => {
    if (!selectedVoucher) {
      alert("Please select a voucher first.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucher: selectedVoucher,
          settings,
          subject,
          body: emailBody,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert("Email failed: " + (result.error || "Unknown error"));
        return;
      }

      await supabase
        .from("vouchers")
        .update({ email_status: "Sent" })
        .eq("id", selectedVoucher.id);

      alert("Email sent successfully with voucher PDF!");

      loadVouchers();
    } catch (error: any) {
      alert("Send error: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">Email Preview</h1>

      <div className="bg-white p-6 rounded-xl mb-6">
        <label className="font-semibold">Select Voucher</label>

        <select
          onChange={(e) => selectVoucher(e.target.value)}
          className="w-full border p-3 rounded-lg mt-2 bg-white text-black"
        >
          <option value="">Select saved voucher</option>

          {vouchers.map((voucher) => (
            <option key={voucher.id} value={voucher.id}>
              {voucher.tour_number} - {voucher.guest_name} -{" "}
              {voucher.hotel_name} - {voucher.email_status}
            </option>
          ))}
        </select>
      </div>

      {selectedVoucher && (
        <div className="bg-white p-6 rounded-xl">
          <p>
            <strong>To:</strong> {selectedVoucher.hotel_email}
          </p>

          <p className="mt-3">
            <strong>Subject:</strong> {subject}
          </p>

          <div className="mt-4">
            <strong>Email Body:</strong>

            <textarea
              value={emailBody}
              readOnly
              className="w-full h-60 border p-4 rounded-lg mt-2 text-black bg-white"
            />
          </div>

          <p className="mt-4 text-green-700">
            Voucher PDF will be attached automatically.
          </p>

          <button
            onClick={sendEmail}
            disabled={sending}
            className="mt-6 bg-black text-white px-6 py-3 rounded-lg"
          >
            {sending ? "Sending..." : "Send Email with Voucher PDF"}
          </button>
        </div>
      )}
    </main>
  );
}