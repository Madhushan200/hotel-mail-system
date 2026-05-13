"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

type Hotel = {
  id: string;
  hotel_name: string;
  reservation_email: string;
  cc_email: string;
  phone: string;
  location: string;
};

export default function HotelsPage() {
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error loading hotels");
      return;
    }

    setHotels(data || []);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const cleanData = (jsonData as any[])
      .map((row) => ({
        hotel_name:
          row["Hotel Name"] ||
          row["hotel_name"] ||
          row["Hotel"] ||
          row["hotel"] ||
          "",
        reservation_email:
          row["Reservation Email"] ||
          row["Email"] ||
          row["email"] ||
          row["reservation_email"] ||
          "",
        cc_email: row["CC Email"] || row["cc_email"] || "",
        phone: row["Phone"] || row["phone"] || "",
        location: row["Location"] || row["location"] || "",
      }))
      .filter((row) => row.hotel_name && row.reservation_email);

    if (cleanData.length === 0) {
      alert("No valid data found. Check Excel column names.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("hotels").insert(cleanData);

    if (error) {
      alert("Upload error: " + error.message);
      setLoading(false);
      return;
    }

    alert(`${cleanData.length} hotels uploaded successfully!`);
    setLoading(false);
    loadHotels();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Hotel Database</h1>

      <div className="bg-white p-6 rounded-xl mb-6">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="border p-3 rounded-lg"
        />

        {loading && <p className="mt-4 text-blue-600">Uploading Hotels...</p>}
      </div>

      <div className="bg-white p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Uploaded Hotels</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Hotel Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Location</th>
            </tr>
          </thead>

          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id}>
                <td className="border p-2">{hotel.hotel_name}</td>
                <td className="border p-2">{hotel.reservation_email}</td>
                <td className="border p-2">{hotel.phone}</td>
                <td className="border p-2">{hotel.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}