'use client';

import Link from 'next/link';
import Header from './components/Header';
import { Building2, UserCog, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Header Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hospital Surgeons</h1>
                <p className="text-sm text-gray-600">Connect Hospitals with Surgeons</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/scan-sharing" className="text-gray-700 hover:text-gray-900 font-medium">
                Scan Sharing
              </Link>
              <Link href="/supplies" className="text-gray-700 hover:text-gray-900 font-medium">
                Medical Supplies
              </Link>
              <Link href="/orders" className="text-gray-700 hover:text-gray-900 font-medium">
                My Orders
              </Link>
              <Link href="/labs" className="text-gray-700 hover:text-gray-900 font-medium">
                Partner Labs
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-700 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <Link
                href="/cases"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Cases
              </Link>
              <Link
                href="/upload"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              Trusted by 2,500+ Hospitals
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Seamless Collaboration Between Hospitals & Surgeons
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Connect hospitals with available surgeons, manage surgical bookings, and streamline healthcare operations—all in one platform.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/register/doctor"
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold flex items-center gap-2"
              >
                Register as Surgeon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/register/hospital"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Register Hospital
              </Link>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">HIPAA Compliant Secure data</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Fast Processing 2-3 day turnaround</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Expert Support 24/7 available</span>
              </div>
            </div>
          </div>

          {/* Right Column - Image Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <svg className="w-32 h-32 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500">Hospital & Surgeon Collaboration</p>
              </div>
            </div>
            {/* Cases Completed Overlay */}
            <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Cases Completed</p>
              <p className="text-3xl font-bold text-blue-600">12,847</p>
            </div>
          </div>
        </div>
      </main>

      {/* Additional Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Hospitals with Surgeons</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your workflow with our intuitive platform designed for modern healthcare facilities.
          </p>
        </div>
      </section>
    </div>
  );
}
