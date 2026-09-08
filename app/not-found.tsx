import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#4C4C4C]">Page not found</h1>
      <p className="mt-2 text-sm text-[#7C7C7C]">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <div className="mt-6">
        <Link href="/" className="underline text-[#4C4C4C]">
          Go back home
        </Link>
      </div>
    </main>
  );
}
