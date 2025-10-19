export default function Loading() {
  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-center items-center flex-col m-6 min-w-80 px-6 max-w-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </main>
  );
}
