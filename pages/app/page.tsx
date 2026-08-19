import type { Metadata } from "next";
import SiteShell from "./SiteShell";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "WinForge · Material 3 Preview",
  description:
    "Explore the WinForge Material 3 desktop design preview, documentation, and verified release links.",
};

export default function Home() {
  const assetBase = process.env.WINFORGE_BUILD_TARGET === "pages" ? "/material-winforge" : "";
  return <SiteShell assetBase={assetBase} />;
}
