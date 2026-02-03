type WatchPageProps = {
  params: { id: string };
};

export default function WatchPage({ params }: WatchPageProps) {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
        Watch
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Video player will go here. (ID: {params.id})
      </p>
    </main>
  );
}
