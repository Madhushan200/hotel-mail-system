"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Hotel = {
  id: string;
  hotel_name: string;
  reservation_email: string;
};

export default function CreateVoucherPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [form, setForm] = useState({
    tour_number: "",
    guest_name: "",
    nationality: "",
    hotel_name: "",
    room_type: "",
    room_count: "",
    check_in: "",
    check_out: "",
    meal_plan: "",
    adults: "",
    children: "",
    hotel_rate: "",
    special_note: "",
  });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    const { data, error } = await supabase
      .from("hotels")
      .select("id, hotel_name, reservation_email");

    if (error) {
      alert("Hotels not loading");
      return;
    }

    setHotels(data || []);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveVoucher = async () => {
    const selectedHotel = hotels.find(
      (hotel) => hotel.hotel_name === form.hotel_name
    );

    if (!selectedHotel) {
      alert("Hotel email not found. Please select hotel from dropdown.");
      return;
    }

    const { error } = await supabase.from("vouchers").insert({
      ...form,
      room_count: Number(form.room_count),
      adults: Number(form.adults),
      children: Number(form.children),
      hotel_email: selectedHotel.reservation_email,
      email_status: "Draft",
    });

    if (error) {
      alert("Error saving voucher");
      return;
    }

    alert("Voucher saved successfully!");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Create Hotel Voucher</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl">
        <select
          name="hotel_name"
          value={form.hotel_name}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        >
          <option value="">Select Hotel</option>
          {hotels.map((hotel) => (
            <option key={hotel.id} value={hotel.hotel_name}>
              {hotel.hotel_name} - {hotel.reservation_email}
            </option>
          ))}
        </select>

        <input name="tour_number" value={form.tour_number} onChange={handleChange} placeholder="TOUR NUMBER" className="border p-3 rounded-lg" />
        <input name="guest_name" value={form.guest_name} onChange={handleChange} placeholder="GUEST NAME" className="border p-3 rounded-lg" />
        <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="NATIONALITY" className="border p-3 rounded-lg" />
        <input name="room_type" value={form.room_type} onChange={handleChange} placeholder="ROOM TYPE" className="border p-3 rounded-lg" />
        <input name="room_count" value={form.room_count} onChange={handleChange} placeholder="ROOM COUNT" className="border p-3 rounded-lg" />
        <input name="check_in" type="date" value={form.check_in} onChange={handleChange} className="border p-3 rounded-lg" />
        <input name="check_out" type="date" value={form.check_out} onChange={handleChange} className="border p-3 rounded-lg" />
        <input name="meal_plan" value={form.meal_plan} onChange={handleChange} placeholder="MEAL PLAN" className="border p-3 rounded-lg" />
        <input name="adults" value={form.adults} onChange={handleChange} placeholder="ADULTS" className="border p-3 rounded-lg" />
        <input name="children" value={form.children} onChange={handleChange} placeholder="CHILDREN" className="border p-3 rounded-lg" />
        <input name="hotel_rate" value={form.hotel_rate} onChange={handleChange} placeholder="HOTEL RATE" className="border p-3 rounded-lg" />

        <textarea
          name="special_note"
          value={form.special_note}
          onChange={handleChange}
          placeholder="SPECIAL NOTE"
          className="border p-3 rounded-lg md:col-span-2"
        />
      </div>

      <button
        onClick={saveVoucher}
        className="mt-6 bg-black text-white px-6 py-3 rounded-lg"
      >
        Save Voucher
      </button>
    </main>
  );
}