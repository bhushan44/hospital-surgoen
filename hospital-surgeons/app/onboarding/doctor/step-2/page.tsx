'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorStep2Page() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to unified registration component
    router.replace('/onboarding/doctor');
  }, [router]);
  
  return null;
}
