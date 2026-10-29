import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // jsdom resolves the package's browser build, which is ES modules only
    "^@vercel/analytics$": "<rootDir>/node_modules/@vercel/analytics/dist/index.js",
  },
};

export default config;
