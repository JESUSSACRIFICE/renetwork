export default function TrustedBy() {
  const companies = [
    { name: "Amazon", logo: "Amazon" },
    { name: "AMD", logo: "AMD" },
    { name: "Cisco", logo: "Cisco" },
    { name: "Dropcom", logo: "Dropcom" },
    { name: "Logitech", logo: "Logitech" },
    { name: "Spotify", logo: "Spotify" },
  ];

  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 mb-8 text-sm font-medium">
          Trusted by the world&apos;s best.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-2xl font-bold text-gray-400">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

