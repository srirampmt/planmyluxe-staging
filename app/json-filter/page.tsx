import type { Metadata } from "next";
import JsonFilterPage from "@/components/JsonFilterPage";
import testData from "@/test.json";

export const metadata: Metadata = {
  title: "JSON Filter",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JsonFilterRoute() {
  return <JsonFilterPage initialPayload={testData} />;
}