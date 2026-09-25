import HomePageSkeleton from "@/components/HomePageSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto bg-white md:container lg:container xl:container">
        <HomePageSkeleton />
      </main>
    </div>
  );
}
