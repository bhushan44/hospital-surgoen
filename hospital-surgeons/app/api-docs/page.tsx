'use client';

import { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';

// Force dynamic rendering - prevents static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Dynamically import SwaggerUI - only loads on client side
const SwaggerUI = dynamicImport(
  () => import('swagger-ui-react'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    ),
  }
);

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Only render SwaggerUI after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    
    // Load CSS dynamically
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css';
      document.head.appendChild(link);
    }
    
    // Fetch API spec
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error('Error loading Swagger spec:', err));
  }, []);

  if (!mounted || !spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-container p-4">
      <SwaggerUI spec={spec} />
    </div>
  );
}
