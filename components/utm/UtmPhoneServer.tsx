import { fetchPhoneByUtm, getUtmPhoneParamsFromCookies } from "@/lib/utm-phone";
import { DEFAULT_CALL_PHONE_DISPLAY, normalizePhoneDisplay, toTelHref } from "@/lib/phone";
import { UtmPhoneProvider } from "@/components/utm/UtmPhoneProvider";

export default async function UtmPhoneServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const utm = await getUtmPhoneParamsFromCookies();
  const mapped = await fetchPhoneByUtm(utm);
  const phoneDisplay = normalizePhoneDisplay(mapped ?? DEFAULT_CALL_PHONE_DISPLAY);

  return (
    <UtmPhoneProvider value={{ phoneDisplay, phoneTel: toTelHref(phoneDisplay) }}>
      {children}
    </UtmPhoneProvider>
  );
}
