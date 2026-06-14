import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

const SITE_URL = "https://kittytask.hamzaalsafi.com";
const DESCRIPTION =
  "KittyTask is a free, Trello-style task manager. Organize your work into boards, lists, and cards with drag-and-drop, labels, sharing, and real-time collaboration.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KittyTask — Free Kanban Task Manager & To-Do Boards",
    template: "%s · KittyTask",
  },
  description: DESCRIPTION,
  applicationName: "KittyTask",
  keywords: [
    "task manager",
    "kanban board",
    "to-do list",
    "project management",
    "task tracker",
    "trello alternative",
    "team collaboration",
    "productivity app",
    "boards lists cards",
    "KittyTask",
  ],
  authors: [{ name: "Hamza Alsafi", url: "https://github.com/Hamzaalsafi" }],
  creator: "Hamza Alsafi",
  category: "productivity",
  alternates: { canonical: "/" },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "KittyTask",
    url: SITE_URL,
    title: "KittyTask — Free Kanban Task Manager & To-Do Boards",
    description: DESCRIPTION,
    images: [{ url: "/logo.png", alt: "KittyTask" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KittyTask — Free Kanban Task Manager & To-Do Boards",
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "KittyTask",
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Hamza Alsafi", url: "https://github.com/Hamzaalsafi" },
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
