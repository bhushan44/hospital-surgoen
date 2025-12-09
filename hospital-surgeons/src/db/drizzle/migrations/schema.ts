import { pgTable, index, foreignKey, check, uuid, text, json, timestamp, boolean, unique, bigint, integer, varchar, numeric, time, date, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const notifications = pgTable("notifications", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	recipientType: text("recipient_type").notNull(),
	recipientId: uuid("recipient_id"),
	title: text().notNull(),
	message: text().notNull(),
	channel: text().notNull(),
	priority: text().default('medium').notNull(),
	assignmentId: uuid("assignment_id"),
	payload: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	read: boolean().default(false),
}, (table) => [
	index("idx_notifications_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_notifications_read").using("btree", table.read.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_recipient").using("btree", table.recipientId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignments.id],
			name: "notifications_assignment_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.channel],
			foreignColumns: [enumChannel.channel],
			name: "notifications_channel_fkey"
		}),
	check("notifications_priority_check", sql`priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])`),
	check("notifications_recipient_type_check", sql`recipient_type = ANY (ARRAY['user'::text, 'role'::text, 'all'::text])`),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	tier: text().notNull(),
	userRole: text("user_role").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	price: bigint({ mode: "number" }).default(0).notNull(),
	currency: text().default('USD').notNull(),
}, (table) => [
	unique("subscription_plans_name_key").on(table.name),
	check("subscription_plans_tier_check", sql`tier = ANY (ARRAY['free'::text, 'basic'::text, 'premium'::text, 'enterprise'::text])`),
	check("subscription_plans_user_role_check", sql`user_role = ANY (ARRAY['doctor'::text, 'hospital'::text])`),
]);

export const doctorPlanFeatures = pgTable("doctor_plan_features", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	planId: uuid("plan_id").notNull(),
	visibilityWeight: integer("visibility_weight").default(1),
	maxAffiliations: integer("max_affiliations"),
	maxAssignmentsPerMonth: integer("max_assignments_per_month"),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "doctor_plan_features_plan_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().notNull(),
	status: text().default('pending').notNull(),
	subscriptionStatus: text("subscription_status"),
	subscriptionTier: text("subscription_tier"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	emailVerified: boolean("email_verified").default(false),
	phoneVerified: boolean("phone_verified").default(false),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	phone: varchar({ length: 20 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_role").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("idx_users_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("users_email_key").on(table.email),
	check("users_role_check", sql`role = ANY (ARRAY['doctor'::text, 'hospital'::text, 'admin'::text])`),
	check("users_status_check", sql`status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text, 'suspended'::text])`),
	check("users_subscription_status_check", sql`subscription_status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text, 'trial'::text])`),
]);

export const orders = pgTable("orders", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	orderType: text("order_type").notNull(),
	planId: uuid("plan_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	currency: text().default('USD').notNull(),
	description: text(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	failureReason: text("failure_reason"),
	webhookReceived: boolean("webhook_received").default(false),
}, (table) => [
	index("idx_orders_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_orders_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_orders_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "orders_plan_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_fkey"
		}).onDelete("cascade"),
	check("orders_order_type_check", sql`order_type = ANY (ARRAY['subscription'::text, 'consultation'::text, 'other'::text])`),
	check("orders_status_check", sql`status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'expired'::text, 'refunded'::text])`),
]);

export const paymentTransactions = pgTable("payment_transactions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	paymentGateway: text("payment_gateway").notNull(),
	paymentId: text("payment_id").notNull(),
	paymentMethod: text("payment_method"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	currency: text().default('USD').notNull(),
	status: text().notNull(),
	gatewayResponse: json("gateway_response"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	refundedAt: timestamp("refunded_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "payment_transactions_order_id_fkey"
		}).onDelete("cascade"),
	unique("payment_transactions_payment_id_key").on(table.paymentId),
	check("payment_transactions_status_check", sql`status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text, 'refunded'::text])`),
]);

export const doctors = pgTable("doctors", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	profilePhotoId: uuid("profile_photo_id"),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	medicalLicenseNumber: text("medical_license_number").notNull(),
	yearsOfExperience: integer("years_of_experience").notNull(),
	bio: text(),
	primaryLocation: text("primary_location"),
	latitude: numeric({ precision: 10, scale:  8 }),
	longitude: numeric({ precision: 11, scale:  8 }),
	licenseVerificationStatus: text("license_verification_status").default('pending').notNull(),
	averageRating: numeric("average_rating", { precision: 3, scale:  2 }).default('0.00'),
	totalRatings: integer("total_ratings").default(0),
	completedAssignments: integer("completed_assignments").default(0),
	fullAddress: text("full_address"),
	state: text(),
	city: text(),
	pincode: varchar({ length: 10 }),
}, (table) => [
	index("idx_doctors_city").using("btree", table.city.asc().nullsLast().op("text_ops")),
	index("idx_doctors_license").using("btree", table.medicalLicenseNumber.asc().nullsLast().op("text_ops")),
	index("idx_doctors_location").using("btree", table.latitude.asc().nullsLast().op("numeric_ops"), table.longitude.asc().nullsLast().op("numeric_ops")),
	index("idx_doctors_location_details").using("btree", table.city.asc().nullsLast().op("text_ops"), table.state.asc().nullsLast().op("text_ops"), table.pincode.asc().nullsLast().op("text_ops")),
	index("idx_doctors_pincode").using("btree", table.pincode.asc().nullsLast().op("text_ops")),
	index("idx_doctors_rating").using("btree", table.averageRating.desc().nullsFirst().op("numeric_ops")),
	index("idx_doctors_state").using("btree", table.state.asc().nullsLast().op("text_ops")),
	index("idx_doctors_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.profilePhotoId],
			foreignColumns: [files.id],
			name: "doctors_profile_photo_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "doctors_user_id_fkey"
		}).onDelete("cascade"),
	unique("doctors_user_id_key").on(table.userId),
	unique("doctors_medical_license_number_key").on(table.medicalLicenseNumber),
	check("doctors_average_rating_check", sql`(average_rating >= (0)::numeric) AND (average_rating <= (5)::numeric)`),
	check("doctors_license_verification_status_check", sql`license_verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])`),
	check("doctors_years_of_experience_check", sql`years_of_experience >= 0`),
]);

export const files = pgTable("files", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	filename: text().notNull(),
	url: text().notNull(),
	mimetype: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	size: bigint({ mode: "number" }).notNull(),
	thumbnail: text(),
	storageBucket: varchar("storage_bucket", { length: 255 }),
	storageKey: text("storage_key"),
	cdnUrl: text("cdn_url"),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const specialties = pgTable("specialties", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => [
	unique("specialties_name_key").on(table.name),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	planId: uuid("plan_id").notNull(),
	orderId: uuid("order_id"),
	paymentTransactionId: uuid("payment_transaction_id"),
	status: text().default('active').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	autoRenew: boolean("auto_renew").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_subscriptions_end_date").using("btree", table.endDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_subscriptions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_subscriptions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "subscriptions_order_id_fkey"
		}),
	foreignKey({
			columns: [table.paymentTransactionId],
			foreignColumns: [paymentTransactions.id],
			name: "subscriptions_payment_transaction_id_fkey"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "subscriptions_plan_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_fkey"
		}).onDelete("cascade"),
	check("subscriptions_status_check", sql`status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text, 'suspended'::text])`),
]);

export const hospitals = pgTable("hospitals", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	logoId: uuid("logo_id"),
	name: text().notNull(),
	hospitalType: text("hospital_type"),
	registrationNumber: text("registration_number").notNull(),
	address: text().notNull(),
	city: text().notNull(),
	latitude: numeric({ precision: 10, scale:  8 }),
	longitude: numeric({ precision: 11, scale:  8 }),
	numberOfBeds: integer("number_of_beds"),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone"),
	websiteUrl: text("website_url"),
	licenseVerificationStatus: text("license_verification_status").default('pending').notNull(),
	fullAddress: text("full_address"),
	state: text(),
	pincode: varchar({ length: 10 }),
}, (table) => [
	index("idx_hospitals_city").using("btree", table.city.asc().nullsLast().op("text_ops")),
	index("idx_hospitals_location").using("btree", table.latitude.asc().nullsLast().op("numeric_ops"), table.longitude.asc().nullsLast().op("numeric_ops")),
	index("idx_hospitals_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.logoId],
			foreignColumns: [files.id],
			name: "hospitals_logo_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "hospitals_user_id_fkey"
		}).onDelete("cascade"),
	unique("hospitals_user_id_key").on(table.userId),
	unique("hospitals_registration_number_key").on(table.registrationNumber),
	check("hospitals_hospital_type_check", sql`hospital_type = ANY (ARRAY['general'::text, 'specialty'::text, 'clinic'::text, 'trauma_center'::text, 'teaching'::text, 'other'::text])`),
	check("hospitals_license_verification_status_check", sql`license_verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])`),
	check("hospitals_number_of_beds_check", sql`number_of_beds >= 0`),
]);

export const doctorCredentials = pgTable("doctor_credentials", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	fileId: uuid("file_id").notNull(),
	credentialType: text("credential_type").notNull(),
	title: text().notNull(),
	institution: text(),
	verificationStatus: text("verification_status").default('pending').notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_credentials_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "doctor_credentials_file_id_fkey"
		}).onDelete("cascade"),
	check("doctor_credentials_credential_type_check", sql`credential_type = ANY (ARRAY['degree'::text, 'certificate'::text, 'license'::text, 'other'::text])`),
	check("doctor_credentials_verification_status_check", sql`verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])`),
]);

export const doctorProfilePhotos = pgTable("doctor_profile_photos", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	fileId: uuid("file_id").notNull(),
	isPrimary: boolean("is_primary").default(false),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_profile_photos_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "doctor_profile_photos_file_id_fkey"
		}).onDelete("cascade"),
]);

export const doctorPreferences = pgTable("doctor_preferences", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	maxTravelDistanceKm: integer("max_travel_distance_km"),
	acceptEmergencyOnly: boolean("accept_emergency_only").default(false),
	preferredHospitalIds: text("preferred_hospital_ids").array(),
	blockedHospitalIds: text("blocked_hospital_ids").array(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_preferences_doctor_id_fkey"
		}).onDelete("cascade"),
	unique("doctor_preferences_doctor_id_key").on(table.doctorId),
]);

export const hospitalDocuments = pgTable("hospital_documents", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	fileId: uuid("file_id").notNull(),
	documentType: text("document_type").notNull(),
	verificationStatus: text("verification_status").default('pending').notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "hospital_documents_file_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "hospital_documents_hospital_id_fkey"
		}).onDelete("cascade"),
	check("hospital_documents_document_type_check", sql`document_type = ANY (ARRAY['license'::text, 'accreditation'::text, 'insurance'::text, 'other'::text])`),
	check("hospital_documents_verification_status_check", sql`verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])`),
]);

export const hospitalPreferences = pgTable("hospital_preferences", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	maxSearchDistanceKm: integer("max_search_distance_km"),
	preferAffiliatedOnly: boolean("prefer_affiliated_only").default(false),
	preferredDoctorIds: text("preferred_doctor_ids").array(),
	blockedDoctorIds: text("blocked_doctor_ids").array(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "hospital_preferences_hospital_id_fkey"
		}).onDelete("cascade"),
	unique("hospital_preferences_hospital_id_key").on(table.hospitalId),
]);

export const doctorHospitalAffiliations = pgTable("doctor_hospital_affiliations", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	status: text().default('active').notNull(),
	isPreferred: boolean("is_preferred").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_hospital_affiliations_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "doctor_hospital_affiliations_hospital_id_fkey"
		}).onDelete("cascade"),
	unique("doctor_hospital_affiliations_doctor_id_hospital_id_key").on(table.doctorId, table.hospitalId),
	check("doctor_hospital_affiliations_status_check", sql`status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text, 'suspended'::text])`),
]);

export const availabilityTemplates = pgTable("availability_templates", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	templateName: text("template_name").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	recurrencePattern: text("recurrence_pattern").notNull(),
	recurrenceDays: text("recurrence_days"),
	validFrom: date("valid_from").notNull(),
	validUntil: date("valid_until"),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "availability_templates_doctor_id_fkey"
		}).onDelete("cascade"),
	check("availability_templates_check", sql`end_time > start_time`),
	check("availability_templates_recurrence_pattern_check", sql`recurrence_pattern = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'custom'::text])`),
]);

export const hospitalDepartments = pgTable("hospital_departments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	specialtyId: uuid("specialty_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "hospital_departments_hospital_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.specialtyId],
			foreignColumns: [specialties.id],
			name: "hospital_departments_specialty_id_fkey"
		}).onDelete("cascade"),
	unique("hospital_departments_hospital_id_specialty_id_key").on(table.hospitalId, table.specialtyId),
]);

export const enumStatus = pgTable("enum_status", {
	status: text().primaryKey().notNull(),
	description: text(),
});

export const assignments = pgTable("assignments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	availabilitySlotId: uuid("availability_slot_id"),
	priority: text().default('medium').notNull(),
	status: text().default('pending').notNull(),
	requestedAt: timestamp("requested_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	actualStartTime: timestamp("actual_start_time", { mode: 'string' }),
	actualEndTime: timestamp("actual_end_time", { mode: 'string' }),
	treatmentNotes: text("treatment_notes"),
	consultationFee: numeric("consultation_fee", { precision: 10, scale:  2 }),
	cancellationReason: text("cancellation_reason"),
	cancelledBy: text("cancelled_by"),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
}, (table) => [
	index("idx_assignments_doctor").using("btree", table.doctorId.asc().nullsLast().op("uuid_ops")),
	index("idx_assignments_hospital").using("btree", table.hospitalId.asc().nullsLast().op("uuid_ops")),
	index("idx_assignments_patient").using("btree", table.patientId.asc().nullsLast().op("uuid_ops")),
	index("idx_assignments_requested_at").using("btree", table.requestedAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_assignments_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.availabilitySlotId],
			foreignColumns: [doctorAvailability.id],
			name: "assignments_availability_slot_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "assignments_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "assignments_hospital_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "assignments_patient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.priority],
			foreignColumns: [enumPriority.priority],
			name: "assignments_priority_fkey"
		}),
	foreignKey({
			columns: [table.status],
			foreignColumns: [enumStatus.status],
			name: "assignments_status_fkey"
		}),
	check("assignments_cancelled_by_check", sql`cancelled_by = ANY (ARRAY['hospital'::text, 'doctor'::text, 'system'::text])`),
]);

export const doctorAvailabilityHistory = pgTable("doctor_availability_history", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	availabilityId: uuid("availability_id").notNull(),
	eventType: text("event_type").notNull(),
	oldStatus: text("old_status"),
	newStatus: text("new_status"),
	changedBy: text("changed_by").notNull(),
	changedById: uuid("changed_by_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.availabilityId],
			foreignColumns: [doctorAvailability.id],
			name: "doctor_availability_history_availability_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.changedById],
			foreignColumns: [users.id],
			name: "doctor_availability_history_changed_by_id_fkey"
		}).onDelete("set null"),
	check("doctor_availability_history_changed_by_check", sql`changed_by = ANY (ARRAY['doctor'::text, 'hospital'::text, 'system'::text, 'admin'::text])`),
	check("doctor_availability_history_event_type_check", sql`event_type = ANY (ARRAY['created'::text, 'updated'::text, 'booked'::text, 'released'::text, 'cancelled'::text])`),
]);

export const patients = pgTable("patients", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	fullName: text("full_name").notNull(),
	dateOfBirth: date("date_of_birth").notNull(),
	gender: text(),
	phone: text(),
	emergencyContact: text("emergency_contact"),
	address: text(),
	medicalCondition: text("medical_condition"),
	roomType: text("room_type"),
	costPerDay: numeric("cost_per_day", { precision: 10, scale:  2 }),
	medicalNotes: text("medical_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "patients_hospital_id_fkey"
		}).onDelete("cascade"),
	check("patients_gender_check", sql`gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'prefer_not_to_say'::text])`),
	check("patients_room_type_check", sql`room_type = ANY (ARRAY['general'::text, 'private'::text, 'semi_private'::text, 'icu'::text, 'emergency'::text])`),
]);

export const patientConsents = pgTable("patient_consents", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	consentType: text("consent_type").notNull(),
	granted: boolean().notNull(),
	grantedBy: text("granted_by").notNull(),
	relationToPatient: text("relation_to_patient"),
	digitalSignature: text("digital_signature"),
	grantedAt: timestamp("granted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_consents_patient_id_fkey"
		}).onDelete("cascade"),
	check("patient_consents_consent_type_check", sql`consent_type = ANY (ARRAY['treatment'::text, 'data_sharing'::text, 'research'::text, 'photography'::text, 'other'::text])`),
]);

export const enumPriority = pgTable("enum_priority", {
	priority: text().primaryKey().notNull(),
	description: text(),
});

export const assignmentRatings = pgTable("assignment_ratings", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	assignmentId: uuid("assignment_id").notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	rating: integer().notNull(),
	reviewText: text("review_text"),
	positiveTags: text("positive_tags").array(),
	negativeTags: text("negative_tags").array(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignments.id],
			name: "assignment_ratings_assignment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "assignment_ratings_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "assignment_ratings_hospital_id_fkey"
		}).onDelete("cascade"),
	unique("assignment_ratings_assignment_id_key").on(table.assignmentId),
	check("assignment_ratings_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const assignmentPayments = pgTable("assignment_payments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	assignmentId: uuid("assignment_id").notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	consultationFee: numeric("consultation_fee", { precision: 10, scale:  2 }).notNull(),
	platformCommission: numeric("platform_commission", { precision: 10, scale:  2 }).default('0.00').notNull(),
	doctorPayout: numeric("doctor_payout", { precision: 10, scale:  2 }).notNull(),
	paymentStatus: text("payment_status").default('pending').notNull(),
	paidToDoctorAt: timestamp("paid_to_doctor_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignments.id],
			name: "assignment_payments_assignment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "assignment_payments_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "assignment_payments_hospital_id_fkey"
		}).onDelete("cascade"),
	unique("assignment_payments_assignment_id_key").on(table.assignmentId),
	check("assignment_payments_payment_status_check", sql`payment_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])`),
]);

export const hospitalCancellationFlags = pgTable("hospital_cancellation_flags", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	hospitalId: uuid("hospital_id").notNull(),
	assignmentId: uuid("assignment_id").notNull(),
	severity: text().notNull(),
	policyWindow: text("policy_window").notNull(),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignments.id],
			name: "hospital_cancellation_flags_assignment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [hospitals.id],
			name: "hospital_cancellation_flags_hospital_id_fkey"
		}).onDelete("cascade"),
	check("hospital_cancellation_flags_severity_check", sql`severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])`),
]);

export const webhookLogs = pgTable("webhook_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	source: text().notNull(),
	eventType: text("event_type").notNull(),
	eventId: text("event_id").notNull(),
	payload: json().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	status: text().notNull(),
	errorMessage: text("error_message"),
}, (table) => [
	unique("webhook_logs_event_id_key").on(table.eventId),
	check("webhook_logs_status_check", sql`status = ANY (ARRAY['pending'::text, 'processed'::text, 'failed'::text, 'ignored'::text])`),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id"),
	actorType: text("actor_type").notNull(),
	action: text().notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id"),
	details: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_audit_logs_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_audit_logs_entity").using("btree", table.entityType.asc().nullsLast().op("uuid_ops"), table.entityId.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_fkey"
		}).onDelete("set null"),
	check("audit_logs_actor_type_check", sql`actor_type = ANY (ARRAY['user'::text, 'system'::text, 'admin'::text, 'webhook'::text])`),
]);

export const enumChannel = pgTable("enum_channel", {
	channel: text().primaryKey().notNull(),
	description: text(),
});

export const userDevices = pgTable("user_devices", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	deviceType: varchar("device_type", { length: 20 }).notNull(),
	deviceToken: text("device_token").notNull(),
	appVersion: varchar("app_version", { length: 20 }),
	osVersion: varchar("os_version", { length: 20 }),
	deviceName: varchar("device_name", { length: 100 }),
	isActive: boolean("is_active").default(true),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_devices_device_token").using("btree", table.deviceToken.asc().nullsLast().op("text_ops")),
	index("idx_user_devices_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_user_devices_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_devices_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_devices_user_id_device_token_key").on(table.userId, table.deviceToken),
	check("user_devices_device_type_check", sql`(device_type)::text = ANY ((ARRAY['ios'::character varying, 'android'::character varying, 'web'::character varying])::text[])`),
]);

export const analyticsEvents = pgTable("analytics_events", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id"),
	eventType: varchar("event_type", { length: 50 }).notNull(),
	eventName: varchar("event_name", { length: 100 }).notNull(),
	properties: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "analytics_events_user_id_fkey"
		}),
]);

export const supportTickets = pgTable("support_tickets", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id"),
	bookingId: uuid("booking_id"),
	subject: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 50 }),
	priority: varchar({ length: 20 }).default('medium'),
	status: varchar({ length: 20 }).default('open'),
	assignedTo: uuid("assigned_to"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "support_tickets_assigned_to_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "support_tickets_user_id_fkey"
		}),
]);

export const notificationPreferences = pgTable("notification_preferences", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	bookingUpdatesPush: boolean("booking_updates_push").default(true),
	bookingUpdatesEmail: boolean("booking_updates_email").default(true),
	paymentPush: boolean("payment_push").default(true),
	remindersPush: boolean("reminders_push").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_notification_preferences_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_preferences_user_id_fkey"
		}).onDelete("cascade"),
	unique("notification_preferences_user_id_key").on(table.userId),
]);

export const notificationRecipients = pgTable("notification_recipients", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	notificationId: uuid("notification_id").notNull(),
	userId: uuid("user_id").notNull(),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.notificationId],
			foreignColumns: [notifications.id],
			name: "notification_recipients_notification_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_recipients_user_id_fkey"
		}).onDelete("cascade"),
]);

export const doctorSpecialties = pgTable("doctor_specialties", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	specialtyId: uuid("specialty_id").notNull(),
	isPrimary: boolean("is_primary").default(false),
	yearsOfExperience: integer("years_of_experience"),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_specialties_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.specialtyId],
			foreignColumns: [specialties.id],
			name: "doctor_specialties_specialty_id_fkey"
		}).onDelete("cascade"),
	unique("doctor_specialties_doctor_id_specialty_id_key").on(table.doctorId, table.specialtyId),
	check("doctor_specialties_years_of_experience_check", sql`years_of_experience >= 0`),
]);

export const hospitalPlanFeatures = pgTable("hospital_plan_features", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	planId: uuid("plan_id").notNull(),
	maxPatientsPerMonth: integer("max_patients_per_month"),
	includesPremiumDoctors: boolean("includes_premium_doctors").default(false),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "hospital_plan_features_plan_id_fkey"
		}).onDelete("cascade"),
]);

export const doctorAvailability = pgTable("doctor_availability", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	templateId: uuid("template_id"),
	slotDate: date("slot_date").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	status: text().default('available').notNull(),
	isManual: boolean("is_manual").default(false),
	bookedByHospitalId: uuid("booked_by_hospital_id"),
	bookedAt: timestamp("booked_at", { mode: 'string' }),
	notes: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_availability_date").using("btree", table.slotDate.asc().nullsLast().op("date_ops")),
	index("idx_availability_doctor_date").using("btree", table.doctorId.asc().nullsLast().op("date_ops"), table.slotDate.asc().nullsLast().op("date_ops")),
	index("idx_availability_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.bookedByHospitalId],
			foreignColumns: [hospitals.id],
			name: "doctor_availability_booked_by_hospital_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_availability_doctor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.status],
			foreignColumns: [enumStatus.status],
			name: "doctor_availability_status_fkey"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [availabilityTemplates.id],
			name: "doctor_availability_template_id_fkey"
		}).onDelete("set null"),
	check("doctor_availability_check", sql`end_time > start_time`),
]);

export const doctorLeaves = pgTable("doctor_leaves", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	leaveType: text("leave_type").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_leaves_doctor_id_fkey"
		}).onDelete("cascade"),
	check("doctor_leaves_check", sql`end_date >= start_date`),
	check("doctor_leaves_leave_type_check", sql`leave_type = ANY (ARRAY['sick'::text, 'vacation'::text, 'personal'::text, 'emergency'::text, 'other'::text])`),
]);

export const doctorAssignmentUsage = pgTable("doctor_assignment_usage", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	month: varchar("month", { length: 7 }).notNull(), // Format: "2024-03"
	count: integer().default(0).notNull(),
	limitCount: integer("limit_count").notNull(),
	resetDate: timestamp("reset_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_doctor_assignment_usage_doctor_month").using("btree", table.doctorId.asc().nullsLast().op("uuid_ops"), table.month.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_assignment_usage_doctor_id_fkey"
		}).onDelete("cascade"),
	unique("doctor_assignment_usage_doctor_id_month_key").on(table.doctorId, table.month),
]);
