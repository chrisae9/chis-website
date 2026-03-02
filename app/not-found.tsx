import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-blue">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
