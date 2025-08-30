import type { Metadata } from "next";
import NavComponent from '../components/Nav';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserProvider } from "@/app/context/UserContext"; 
import { WordProvider } from "@/app/context/WordContext"; 
import GlobalListener  from "@/components/GlobalListener"
import WordPopup from '@/components/sidePanel/WordPopup';
import SidePanel from '@/components/sidePanel/SidePanel';
import FloatingActions from "@/components/FloatingActions";
import {  display } from '@/utils/constants'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
           <WordProvider>
              <GlobalListener />
              <NavComponent />
              <SidePanel />
              <div className="lg:hidden">
                <WordPopup />
              </div>

              <FloatingActions />
              <div className="pl-0 lg:pl-[250px]">{children}</div>
            </WordProvider>
        </UserProvider>
      </body>
    </html>
  );
}
