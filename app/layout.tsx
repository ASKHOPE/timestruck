import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "⚡TimeStruck⚡",
  description: "App that helps you combat timezones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        {/* Header */}
        <header className="flex flex-col items-center justify-center bg-gray-800 text-white .text-base py-6">
          <Link href="/"><button><h1 className="text-center text-3xl font-extrabold tracking-wide">
            ⚡TimeStruck⚡
          </h1></button></Link>
        </header>

        {/* Main Content */}
        {/* <main className="flex-grow p-6 text-center w-3/5 mx-auto text-white">{children}</main> */}
        <main className=" p-3 text-center  ">{children}</main>


        {/* Footer (Sticky at Bottom) */}
        <footer className="w-full bg-gray-800 text-white py-4 flex flex-col items-center mt-auto">
        {/* <footer className="flex flex-col min-h-screen"> */}
          <nav className="flex space-x-6 text-center">
            <Link href="/home" className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
              🏠<br></br> Home
            </Link>
            <Link href="/preferences" className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
              ⚙️<br></br> Preferences
            </Link>
            <Link href="/aboutus" className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
              🧑‍💻<br></br> About Us
            </Link>
          </nav>

          {/* Copyright Text (Second Row) */}
          <p className="text-sm mt-2">&copy; {new Date().getFullYear()} TimeStruck. All rights reserved. Arnold Sujan Katru</p>
        </footer>
      </body>
    </html>
  );
}
