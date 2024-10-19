import LandingPage from "./_components/LandingPage";
import { fetchAccessToken } from "hume";

export default async function Page() {
  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.NEXT_PUBLIC_HUME_API_KEY),
    secretKey: String(process.env.NEXT_PUBLIC_HUME_SECRET_KEY),
  });

  if (!accessToken) {
    throw new Error("Failed to fetch access token");
  }

  return <LandingPage accessToken={accessToken} />;
}
