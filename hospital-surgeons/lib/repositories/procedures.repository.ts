import { getDb } from '@/lib/db';
import { 
  procedures, 
  procedureCategories, 
  procedureTypes, 
  specialties 
} from '@/src/db/drizzle/migrations/schema';
import { eq, desc, asc, sql, and, ilike } from 'drizzle-orm';

export interface CreateProcedureData {
  specialtyId: string;
  categoryId?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCategoryData {
  specialtyId: string;
  name: string;
  description?: string;
}

export interface CreateProcedureTypeData {
  name: string;
  displayName: string;
}

export class ProceduresRepository {
  private db = getDb();

  // --- Procedures ---

  async createProcedure(data: CreateProcedureData) {
    return await this.db
      .insert(procedures)
      .values({
        specialtyId: data.specialtyId,
        categoryId: data.categoryId || null,
        name: data.name,
        description: data.description || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
      .returning();
  }

  async findProcedures(filters: { specialtyId?: string; categoryId?: string; search?: string } = {}) {
    const conditions = [];
    if (filters.specialtyId) conditions.push(eq(procedures.specialtyId, filters.specialtyId));
    if (filters.categoryId) conditions.push(eq(procedures.categoryId, filters.categoryId));
    if (filters.search) conditions.push(ilike(procedures.name, `%${filters.search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.db
      .select({
        id: procedures.id,
        name: procedures.name,
        description: procedures.description,
        isActive: procedures.isActive,
        specialtyId: procedures.specialtyId,
        specialtyName: specialties.name,
        categoryId: procedures.categoryId,
        categoryName: procedureCategories.name,
      })
      .from(procedures)
      .leftJoin(specialties, eq(procedures.specialtyId, specialties.id))
      .leftJoin(procedureCategories, eq(procedures.categoryId, procedureCategories.id))
      .where(whereClause)
      .orderBy(asc(procedures.name));
  }

  async findProcedureById(id: string) {
    const result = await this.db
      .select()
      .from(procedures)
      .where(eq(procedures.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updateProcedure(id: string, data: Partial<CreateProcedureData>) {
    return await this.db
      .update(procedures)
      .set({
        ...data,
        updatedAt: undefined, // Field doesn't exist in schema
      } as any)
      .where(eq(procedures.id, id))
      .returning();
  }

  async deleteProcedure(id: string) {
    return await this.db
      .delete(procedures)
      .where(eq(procedures.id, id))
      .returning();
  }

  // --- Categories ---

  async findCategories(specialtyId?: string) {
    const whereClause = specialtyId ? eq(procedureCategories.specialtyId, specialtyId) : undefined;
    return await this.db
      .select()
      .from(procedureCategories)
      .where(whereClause)
      .orderBy(asc(procedureCategories.name));
  }

  async createCategory(data: CreateCategoryData) {
    return await this.db
      .insert(procedureCategories)
      .values({
        specialtyId: data.specialtyId,
        name: data.name,
        description: data.description || null,
      })
      .returning();
  }

  async updateCategory(id: string, data: Partial<CreateCategoryData>) {
    return await this.db
      .update(procedureCategories)
      .set(data)
      .where(eq(procedureCategories.id, id))
      .returning();
  }

  async deleteCategory(id: string) {
    return await this.db
      .delete(procedureCategories)
      .where(eq(procedureCategories.id, id))
      .returning();
  }

  // --- Procedure Types ---

  async findProcedureTypes() {
    return await this.db
      .select()
      .from(procedureTypes)
      .orderBy(asc(procedureTypes.displayName));
  }

  async createProcedureType(data: CreateProcedureTypeData) {
    return await this.db
      .insert(procedureTypes)
      .values({
        name: data.name,
        displayName: data.displayName,
      })
      .returning();
  }

  async updateProcedureType(id: string, data: Partial<CreateProcedureTypeData>) {
    return await this.db
      .update(procedureTypes)
      .set(data)
      .where(eq(procedureTypes.id, id))
      .returning();
  }

  async deleteProcedureType(id: string) {
    return await this.db
      .delete(procedureTypes)
      .where(eq(procedureTypes.id, id))
      .returning();
  }
}
