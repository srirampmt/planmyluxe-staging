#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

const projectRoot = process.cwd();
const srcBase = path.join(projectRoot, "components", "hotels");
const destBase = path.join(projectRoot, "app", "deals", "[slug]", "components");

const filesToFork = [ "HotelBanner.tsx", "HolidayDealCard.tsx", "EnquiryModal.tsx", "EnquiryForm.tsx", "MobileDealSheet.tsx", "MobileEnquiryForm.tsx", "HotelDetailsTabs.tsx", "OfferHeader.tsx", "ShareOffer.tsx", "HolidayCalendar.tsx", "FlightSummary.tsx", "ContactAndTrending.tsx", "hotelRichText.module.css" ];

function formatRel(p) {
  return path.relative(projectRoot, p);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(destBase, { recursive: true });

  const copied = [];
  const skipped = [];

  for (const filename of filesToFork) {
    const srcPath = path.join(srcBase, filename);
    const destPath = path.join(destBase, filename);

    if (!(await fileExists(srcPath))) {
      throw new Error(`Missing source file: ${formatRel(srcPath)}`);
    }

    const destAlreadyExists = await fileExists(destPath);
    if (destAlreadyExists && !force) {
      skipped.push(filename);
      continue;
    }

    if (!dryRun) {
      await fs.copyFile(srcPath, destPath);
    }
    copied.push(filename);
  }

  const modeLabel = dryRun ? "[dry-run]" : "";
  // console.log(`${modeLabel} Fork deals components: ${formatRel(srcBase)} -> ${formatRel(destBase)}`);
  if (copied.length) console.log(`Copied (${copied.length}): ${copied.join(", ")}`);
  if (skipped.length) console.log(`Skipped (${skipped.length}) (already exists; use --force): ${skipped.join(", ")}`);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
