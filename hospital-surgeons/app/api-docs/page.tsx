'use client';

import { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';

// Force dynamic rendering for this page - prevents static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Dynamically import SwaggerUI to avoid SSR issues
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
  const [cssLoaded, setCssLoaded] = useState(false);

  // Load CSS on client side only using link tag
  useEffect(() => {
    if (typeof window !== 'undefined' && !cssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/swagger-ui.css';
      link.onload = () => setCssLoaded(true);
      document.head.appendChild(link);
      
      // Fallback: try to load from node_modules if the above fails
      return () => {
        // Cleanup if needed
      };
    }
  }, [cssLoaded]);

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error('Error loading Swagger spec:', err));
  }, []);

  if (!spec) {
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
    <div className="swagger-container">
      <SwaggerUI spec={spec} />
    </div>
  );
}
