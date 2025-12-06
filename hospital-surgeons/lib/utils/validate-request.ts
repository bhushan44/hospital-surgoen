import { z, ZodError } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates request body against a Zod schema
 * Returns validated data or error response
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors into user-friendly messages
      const errors = error.issues.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: errors,
            details: error.issues,
          },
          { status: 400 }
        ),
      };
    }

    // Handle JSON parse errors
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    // Convert URLSearchParams to object
    const query: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (query[key]) {
        // If key already exists, convert to array
        const existing = query[key];
        query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        query[key] = value;
      }
    });

    const validated = schema.parse(query);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            message: 'Invalid query parameters',
            errors: errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
        },
        { status: 400 }
      ),
    };
  }
}

