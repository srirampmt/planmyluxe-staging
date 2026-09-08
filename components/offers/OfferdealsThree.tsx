"use client";

import React from "react";
import Offerdeals from "@/components/offers/Offerdeals";

type OfferDealHotel = {
  id?: number;
  slug?: string;
  name?: string;
  location?: string;
  property_rating?: string;
  offer_header?: string;
  info_paragraph?: string;
  card_image?: string;
  api_url?: string | null;
  offer_tag_type?: string;
  offer_on_card?: string;
  intro_text?: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  hotels?: OfferDealHotel[] | "" | null;
};

export default function OfferdealsThree(props: Props) {
  return <Offerdeals {...props} />;
}
