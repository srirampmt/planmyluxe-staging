import { Metadata } from "next";
import GroupBookingsForm from "./GroupBookingsForm";

export const metadata: Metadata = {
	title: "Group Bookings | Luxury Group Travel Packages",
	description: "Plan seamless group holidays with customised luxury travel packages, exclusive deals and dedicated booking support.",
};

export default function GroupBookingsPage() {
  return <GroupBookingsForm />;
}
