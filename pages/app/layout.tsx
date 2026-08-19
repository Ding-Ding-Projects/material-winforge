import type { Metadata, Viewport } from "next";
import "./globals.css";

const canonicalUrl = "https://ding-ding-projects.github.io/material-winforge/";
const socialImage = `${canonicalUrl}og.png`;
const assetBase = process.env.WINFORGE_BUILD_TARGET === "pages" ? "/material-winforge" : "";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: {
    default: "WinForge · Material 3 Preview",
    template: "%s · WinForge Material 3 Preview",
  },
  description:
    "Explore the WinForge Material 3 desktop design preview, documentation, and verified release links.",
  applicationName: "WinForge · Material 3 Preview",
  alternates: { canonical: canonicalUrl },
  icons: {
    icon: `${assetBase}/app-icon.svg`,
    shortcut: `${assetBase}/app-icon.svg`,
  },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    siteName: "WinForge · Material 3 Preview",
    title: "WinForge · Material 3 Preview",
    description:
      "Desktop design preview, documentation, and verified release links for WinForge.",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "WinForge Material 3 Preview brand card with the green anvil and window logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WinForge · Material 3 Preview",
    description:
      "Desktop design preview, documentation, and verified release links for WinForge.",
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5fbf5" },
    { media: "(prefers-color-scheme: dark)", color: "#07150d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-asset-base={assetBase} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
