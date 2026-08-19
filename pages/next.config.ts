import type { NextConfig } from "next";

const githubPagesBuild = process.env.WINFORGE_BUILD_TARGET === "pages";
const githubPagesAssetPrefix = "https://ding-ding-projects.github.io/material-winforge";

const nextConfig: NextConfig = {
  output: githubPagesBuild ? "export" : undefined,
  basePath: "",
  assetPrefix: githubPagesBuild ? githubPagesAssetPrefix : "",
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
