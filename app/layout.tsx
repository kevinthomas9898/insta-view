import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anonymous Instagram Public Media Viewer",
  description: "Anonymous public Instagram profile, stories, highlights, posts, and reels viewer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="min-h-full flex flex-col text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
