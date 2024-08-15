import Link from "next/link";

export default async function NotFoundPage() {
  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex gap-2 flex-col justify-center">
        <p className="text-lg text-center">Page not found!</p>
        <Link href="/" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
          Back Home
        </Link>
      </div>
    </main>
  )
}