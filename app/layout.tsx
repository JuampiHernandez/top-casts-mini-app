import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || "https://top-casts-mini-app.vercel.app";
  const APP_NAME = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Token Swap Mini App";
  
  return {
    title: APP_NAME,
    description: "Swap ETH, USDC, and WETH tokens using your connected wallet",
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        imageUrl: `${URL}/app-hero.svg`,
        button: {
          title: `Launch ${APP_NAME}`,
          action: {
            type: "launch_frame",
            name: APP_NAME,
            url: URL,
            splashImageUrl: `${URL}/app-hero.svg`,
            splashBackgroundColor: "#667eea",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
