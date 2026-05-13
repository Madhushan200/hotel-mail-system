import Link from "next/link";

export default function DashboardPage() {
  const cards = [
    { title: "Create Voucher", href: "/create-voucher" },
    { title: "Bulk Accommodation Upload", href: "/bulk-voucher" },
    { title: "Email Preview", href: "/email-preview" },
    { title: "Voucher History", href: "/voucher-history" },
    { title: "Hotel Database", href: "/hotels" },
    { title: "Company Settings", href: "/settings" },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-4xl font-bold mb-2">
        Dodoz Leisure Reservation CRM
      </h1>

      <p className="mb-8 text-gray-600">
        Manage hotel vouchers, bulk accommodation requests, hotel emails and PDF
        sending from one dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total Hotels</p>
          <h2 className="text-3xl font-bold">--</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total Vouchers</p>
          <h2 className="text-3xl font-bold">--</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p>Sent Emails</p>
          <h2 className="text-3xl font-bold">--</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p>Pending Emails</p>
          <h2 className="text-3xl font-bold">--</h2>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg border"
          >
            <h3 className="text-xl font-bold">{card.title}</h3>
            <p className="mt-2 text-gray-600">Open section</p>
          </Link>
        ))}
      </div>
    </main>
  );
}