function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://top-casts-mini-app.vercel.app";
  const APP_NAME = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Token Swap Mini App";

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: APP_NAME,
      subtitle: "Swap tokens on Base",
      description: "Swap ETH, USDC, and WETH tokens using your connected wallet",
      screenshotUrls: [],
      iconUrl: `${URL}/app-icon.svg`,
      splashImageUrl: `${URL}/app-hero.svg`,
      splashBackgroundColor: "#667eea",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: "DeFi",
      tags: ["swap", "tokens", "base", "defi"],
      heroImageUrl: `${URL}/app-hero.svg`,
      tagline: "Simple token swapping on Base",
      ogTitle: APP_NAME,
      ogDescription: "Swap ETH, USDC, and WETH tokens using your connected wallet",
      ogImageUrl: `${URL}/app-hero.svg`,
    }),
  });
}
