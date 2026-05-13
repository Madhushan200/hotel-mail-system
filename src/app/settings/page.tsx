"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: "",
    logo_url: "",
    address: "",
    mobile_number: "",
    email: "",
    website: "",
    voucher_footer_note: "",
    default_email_paragraph: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setSettings(data);
    }
  };

  const handleChange = (e: any) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const saveSettings = async () => {
    const { data } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      await supabase
        .from("company_settings")
        .update(settings)
        .eq("id", data.id);
    } else {
      await supabase
        .from("company_settings")
        .insert(settings);
    }

    alert("Settings Saved!");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Company Settings
      </h1>

      <div className="bg-white p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="company_name"
          placeholder="Company Name"
          value={settings.company_name}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          name="logo_url"
          placeholder="Logo URL"
          value={settings.logo_url}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          name="address"
          placeholder="Address"
          value={settings.address}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          name="mobile_number"
          placeholder="Mobile Number"
          value={settings.mobile_number}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          name="email"
          placeholder="Email"
          value={settings.email}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          name="website"
          placeholder="Website"
          value={settings.website}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <textarea
          name="voucher_footer_note"
          placeholder="Voucher Footer Note"
          value={settings.voucher_footer_note}
          onChange={handleChange}
          className="border p-3 rounded-lg md:col-span-2"
        />

        <textarea
          name="default_email_paragraph"
          placeholder="Default Email Paragraph"
          value={settings.default_email_paragraph}
          onChange={handleChange}
          className="border p-3 rounded-lg md:col-span-2"
        />
      </div>

      <button
        onClick={saveSettings}
        className="mt-6 bg-black text-white px-6 py-3 rounded-lg"
      >
        Save Settings
      </button>
    </main>
  );
}