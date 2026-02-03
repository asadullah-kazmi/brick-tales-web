import { mockVideos } from "@/lib/mock-videos";
import { VideoCard } from "@/components/content";

export default function BrowsePage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white sm:text-3xl">
          Browse
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Discover videos and start watching.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {mockVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </main>
  );
}
