import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-[600px] mx-auto bg-[#f4f4f4] rounded-lg p-8">
        <h1 className="text-4xl text-black font-bold text-center mb-2">🍥 Umami Alert</h1>
        <p className="text-sm text-center text-[#666666] mb-8">
          Daily Analytics Email Reports
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-black/[.05] rounded-lg p-4 text-center">
            <p className="text-xs uppercase text-[#666666] font-medium mb-1">
              Features
            </p>
            <p className="text-lg font-bold text-black">
              📊 Daily Reports
            </p>
          </div>
          <div className="bg-black/[.05] rounded-lg p-4 text-center">
            <p className="text-xs uppercase text-[#666666] font-medium mb-1">
              Powered By
            </p>
            <p className="text-lg font-bold text-black">
              ⚡ Vercel Cron
            </p>
          </div>
        </div>

        <h2 className="text-base font-bold mb-3 text-black">📍 Key Features</h2>
        <div className="bg-black/[.05] rounded-lg overflow-hidden mb-8">
          <div className="text-black font-semibold border-b border-black/[.1] p-4">
            <span className="text-sm">📈 Pageviews & Visitors</span>
          </div>
          <div className="text-black font-semibold border-b border-black/[.1] p-4">
            <span className="text-sm">🌍 Geographic Data</span>
          </div>
          <div className="text-black font-semibold border-b border-black/[.1] p-4">
            <span className="text-sm">⏱️ Visit Duration</span>
          </div>
          <div className="text-black font-semibold p-4">
            <span className="text-sm">📱 User Event Info</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="https://github.com/yourusername/umamialert"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold bg-black text-white px-5 py-2 rounded-md hover:opacity-90 transition-opacity text-sm"
          >
            View on GitHub
          </a>
          <a
            href="/api/email"
            className="font-bold text-black border-2 border-black px-5 py-2 rounded-md hover:bg-black hover:text-white transition-colors text-sm"
          >
            Test Email
          </a>
        </div>
      </main>
    </div>
  );
}
