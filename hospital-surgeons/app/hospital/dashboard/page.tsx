'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

interface Patient {
  id: string;
  name: string;
  age: number;
  reason: string;
  roomType: string;
  roomPrice: number;
  status: 'pending' | 'assigned';
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  rating: number;
  availableToday: boolean;
  nextAvailable: string;
}

export default function HospitalDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Fetch specialties
    fetch('/api/specialties/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSpecialties(data.data || []);
        }
      });

    // Fetch patients (mock data for now)
    setPatients([
      {
        id: '1',
        name: 'John Smith',
        age: 45,
        reason: 'Cardiac Evaluation',
        roomType: 'Deluxe Room',
        roomPrice: 10000,
        status: 'pending',
      },
      {
        id: '2',
        name: 'Mary Johnson',
        age: 62,
        reason: 'Post-Surgery Care',
        roomType: 'Suite Room',
        roomPrice: 15000,
        status: 'assigned',
      },
      {
        id: '3',
        name: 'Shubham',
        age: 45,
        reason: '11565',
        roomType: 'General Room',
        roomPrice: 5000,
        status: 'pending',
      },
    ]);

    // Fetch doctors
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.data || []);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Find Available Doctors Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Find Available Doctors</h2>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Specialty Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedSpecialty === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => setSelectedSpecialty(specialty.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedSpecialty === specialty.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {specialty.name}
            </button>
          ))}
        </div>
      </div>

        {/* Patient Assignments Section */}
        <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Patient Assignments</h2>
          <Link
            href="/hospital/patients/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </Link>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {patients.map((patient) => (
            <div key={patient.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {patient.name}, {patient.age}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{patient.reason}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{patient.roomType}</span>
                    <span>(₹{patient.roomPrice.toLocaleString()} /day)</span>
                  </div>
                  {patient.status === 'pending' && (
                    <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                      Assign Doctor
                    </button>
                  )}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {patient.status === 'pending' ? 'Pending' : 'Assigned'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 shadow-lg">
        <Link href="/hospital/dashboard" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-blue-600 font-medium">Schedule</span>
        </Link>
        <Link href="/hospital/alerts" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs text-gray-400">Alerts</span>
        </Link>
        <Link href="/hospital/profile" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-gray-400">Profile</span>
        </Link>
      </div>
    </div>
  );
}







