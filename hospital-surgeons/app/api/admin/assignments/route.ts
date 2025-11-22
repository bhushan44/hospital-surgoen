import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, doctors, hospitals, patients, users, assignmentRatings, assignmentPayments } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, like, sql, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'requestedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(assignments.status, status));
    }
    
    if (priority) {
      conditions.push(eq(assignments.priority, priority));
    }
    
    if (doctorId) {
      conditions.push(eq(assignments.doctorId, doctorId));
    }
    
    if (hospitalId) {
      conditions.push(eq(assignments.hospitalId, hospitalId));
    }
    
    if (startDate) {
      conditions.push(gte(assignments.requestedAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(assignments.requestedAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(assignments)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Get assignments with related data
    const assignmentsList = await db
      .select({
        id: assignments.id,
        hospitalId: assignments.hospitalId,
        doctorId: assignments.doctorId,
        patientId: assignments.patientId,
        priority: assignments.priority,
        status: assignments.status,
        requestedAt: assignments.requestedAt,
        expiresAt: assignments.expiresAt,
        actualStartTime: assignments.actualStartTime,
        actualEndTime: assignments.actualEndTime,
        treatmentNotes: assignments.treatmentNotes,
        consultationFee: assignments.consultationFee,
        cancellationReason: assignments.cancellationReason,
        cancelledBy: assignments.cancelledBy,
        cancelledAt: assignments.cancelledAt,
        completedAt: assignments.completedAt,
        paidAt: assignments.paidAt,
        // Hospital info
        hospitalName: sql<string>`(SELECT name FROM hospitals WHERE id = ${assignments.hospitalId})`,
        // Doctor info
        doctorFirstName: sql<string>`(SELECT first_name FROM doctors WHERE id = ${assignments.doctorId})`,
        doctorLastName: sql<string>`(SELECT last_name FROM doctors WHERE id = ${assignments.doctorId})`,
        // Patient info
        patientName: sql<string>`(SELECT full_name FROM patients WHERE id = ${assignments.patientId})`,
      })
      .from(assignments)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(assignments[sortBy as keyof typeof assignments] || assignments.requestedAt) : desc(assignments[sortBy as keyof typeof assignments] || assignments.requestedAt))
      .limit(limit)
      .offset(offset);

    // Format response
    const formattedAssignments = assignmentsList.map((assignment) => ({
      id: assignment.id,
      hospital: {
        id: assignment.hospitalId,
        name: assignment.hospitalName || 'Unknown',
      },
      doctor: {
        id: assignment.doctorId,
        name: `Dr. ${assignment.doctorFirstName || ''} ${assignment.doctorLastName || ''}`.trim() || 'Unknown',
      },
      patient: {
        id: assignment.patientId,
        name: assignment.patientName || 'Unknown',
      },
      priority: assignment.priority,
      status: assignment.status,
      requestedAt: assignment.requestedAt,
      expiresAt: assignment.expiresAt,
      actualStartTime: assignment.actualStartTime,
      actualEndTime: assignment.actualEndTime,
      treatmentNotes: assignment.treatmentNotes,
      consultationFee: assignment.consultationFee ? Number(assignment.consultationFee) : null,
      cancellationReason: assignment.cancellationReason,
      cancelledBy: assignment.cancelledBy,
      cancelledAt: assignment.cancelledAt,
      completedAt: assignment.completedAt,
      paidAt: assignment.paidAt,
    }));

    // Filter by search if provided
    let filteredAssignments = formattedAssignments;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssignments = formattedAssignments.filter(a =>
        a.hospital.name.toLowerCase().includes(searchLower) ||
        a.doctor.name.toLowerCase().includes(searchLower) ||
        a.patient.name.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments,
      pagination: {
        page,
        limit,
        total: search ? filteredAssignments.length : total,
        totalPages: Math.ceil((search ? filteredAssignments.length : total) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch assignments',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


