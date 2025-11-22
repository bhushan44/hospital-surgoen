'use client';

// This page is completely client-side only - no server-side rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'edge'; // Use edge runtime to avoid SSR issues

export default function ApiDocsPage() {
  // Only render on client - use useEffect to ensure we're in browser
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
        <p className="text-gray-600 mb-6">
          API documentation is available at <code className="bg-gray-100 px-2 py-1 rounded">/api/docs</code>
        </p>
        <div className="mt-8">
          <a 
            href="/api/docs" 
            target="_blank"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            View API Spec (JSON)
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Note: Swagger UI is temporarily disabled due to build compatibility issues.
          The API specification is available as JSON for use with external tools.
        </p>
      </div>
    </div>
  );
}
