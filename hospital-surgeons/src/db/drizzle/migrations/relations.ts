import { relations } from "drizzle-orm/relations";
import { subscriptionPlans, hospitalPlanFeatures, doctorPlanFeatures, orders, users, paymentTransactions, subscriptions, files, doctors, doctorSpecialties, specialties, doctorCredentials, doctorProfilePhotos, doctorPreferences, doctorLeaves, hospitals, hospitalDocuments, hospitalDepartments, hospitalPreferences, doctorHospitalAffiliations, availabilityTemplates, doctorAvailability, enumStatus, doctorAvailabilityHistory, patients, patientConsents, assignments, enumPriority, assignmentRatings, assignmentPayments, hospitalCancellationFlags, auditLogs, notifications, enumChannel, notificationRecipients, userDevices, analyticsEvents, supportTickets, notificationPreferences } from "./schema";

export const hospitalPlanFeaturesRelations = relations(hospitalPlanFeatures, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [hospitalPlanFeatures.planId],
		references: [subscriptionPlans.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	hospitalPlanFeatures: many(hospitalPlanFeatures),
	doctorPlanFeatures: many(doctorPlanFeatures),
	orders: many(orders),
	subscriptions: many(subscriptions),
}));

export const doctorPlanFeaturesRelations = relations(doctorPlanFeatures, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [doctorPlanFeatures.planId],
		references: [subscriptionPlans.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [orders.planId],
		references: [subscriptionPlans.id]
	}),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	paymentTransactions: many(paymentTransactions),
	subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({many}) => ({
	orders: many(orders),
	subscriptions: many(subscriptions),
	doctors: many(doctors),
	hospitals: many(hospitals),
	doctorAvailabilityHistories: many(doctorAvailabilityHistory),
	auditLogs: many(auditLogs),
	notificationRecipients: many(notificationRecipients),
	userDevices: many(userDevices),
	analyticsEvents: many(analyticsEvents),
	supportTickets_assignedTo: many(supportTickets, {
		relationName: "supportTickets_assignedTo_users_id"
	}),
	supportTickets_userId: many(supportTickets, {
		relationName: "supportTickets_userId_users_id"
	}),
	notificationPreferences: many(notificationPreferences),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one, many}) => ({
	order: one(orders, {
		fields: [paymentTransactions.orderId],
		references: [orders.id]
	}),
	subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	order: one(orders, {
		fields: [subscriptions.orderId],
		references: [orders.id]
	}),
	paymentTransaction: one(paymentTransactions, {
		fields: [subscriptions.paymentTransactionId],
		references: [paymentTransactions.id]
	}),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id]
	}),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	file: one(files, {
		fields: [doctors.profilePhotoId],
		references: [files.id]
	}),
	user: one(users, {
		fields: [doctors.userId],
		references: [users.id]
	}),
	doctorSpecialties: many(doctorSpecialties),
	doctorCredentials: many(doctorCredentials),
	doctorProfilePhotos: many(doctorProfilePhotos),
	doctorPreferences: many(doctorPreferences),
	doctorLeaves: many(doctorLeaves),
	doctorHospitalAffiliations: many(doctorHospitalAffiliations),
	availabilityTemplates: many(availabilityTemplates),
	doctorAvailabilities: many(doctorAvailability),
	assignments: many(assignments),
	assignmentRatings: many(assignmentRatings),
	assignmentPayments: many(assignmentPayments),
}));

export const filesRelations = relations(files, ({many}) => ({
	doctors: many(doctors),
	doctorCredentials: many(doctorCredentials),
	doctorProfilePhotos: many(doctorProfilePhotos),
	hospitals: many(hospitals),
	hospitalDocuments: many(hospitalDocuments),
}));

export const doctorSpecialtiesRelations = relations(doctorSpecialties, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorSpecialties.doctorId],
		references: [doctors.id]
	}),
	specialty: one(specialties, {
		fields: [doctorSpecialties.specialtyId],
		references: [specialties.id]
	}),
}));

export const specialtiesRelations = relations(specialties, ({many}) => ({
	doctorSpecialties: many(doctorSpecialties),
	hospitalDepartments: many(hospitalDepartments),
}));

export const doctorCredentialsRelations = relations(doctorCredentials, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorCredentials.doctorId],
		references: [doctors.id]
	}),
	file: one(files, {
		fields: [doctorCredentials.fileId],
		references: [files.id]
	}),
}));

export const doctorProfilePhotosRelations = relations(doctorProfilePhotos, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorProfilePhotos.doctorId],
		references: [doctors.id]
	}),
	file: one(files, {
		fields: [doctorProfilePhotos.fileId],
		references: [files.id]
	}),
}));

export const doctorPreferencesRelations = relations(doctorPreferences, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorPreferences.doctorId],
		references: [doctors.id]
	}),
}));

export const doctorLeavesRelations = relations(doctorLeaves, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorLeaves.doctorId],
		references: [doctors.id]
	}),
}));

export const hospitalsRelations = relations(hospitals, ({one, many}) => ({
	file: one(files, {
		fields: [hospitals.logoId],
		references: [files.id]
	}),
	user: one(users, {
		fields: [hospitals.userId],
		references: [users.id]
	}),
	hospitalDocuments: many(hospitalDocuments),
	hospitalDepartments: many(hospitalDepartments),
	hospitalPreferences: many(hospitalPreferences),
	doctorHospitalAffiliations: many(doctorHospitalAffiliations),
	doctorAvailabilities: many(doctorAvailability),
	patients: many(patients),
	assignments: many(assignments),
	assignmentRatings: many(assignmentRatings),
	assignmentPayments: many(assignmentPayments),
	hospitalCancellationFlags: many(hospitalCancellationFlags),
}));

export const hospitalDocumentsRelations = relations(hospitalDocuments, ({one}) => ({
	file: one(files, {
		fields: [hospitalDocuments.fileId],
		references: [files.id]
	}),
	hospital: one(hospitals, {
		fields: [hospitalDocuments.hospitalId],
		references: [hospitals.id]
	}),
}));

export const hospitalDepartmentsRelations = relations(hospitalDepartments, ({one}) => ({
	hospital: one(hospitals, {
		fields: [hospitalDepartments.hospitalId],
		references: [hospitals.id]
	}),
	specialty: one(specialties, {
		fields: [hospitalDepartments.specialtyId],
		references: [specialties.id]
	}),
}));

export const hospitalPreferencesRelations = relations(hospitalPreferences, ({one}) => ({
	hospital: one(hospitals, {
		fields: [hospitalPreferences.hospitalId],
		references: [hospitals.id]
	}),
}));

export const doctorHospitalAffiliationsRelations = relations(doctorHospitalAffiliations, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorHospitalAffiliations.doctorId],
		references: [doctors.id]
	}),
	hospital: one(hospitals, {
		fields: [doctorHospitalAffiliations.hospitalId],
		references: [hospitals.id]
	}),
}));

export const availabilityTemplatesRelations = relations(availabilityTemplates, ({one, many}) => ({
	doctor: one(doctors, {
		fields: [availabilityTemplates.doctorId],
		references: [doctors.id]
	}),
	doctorAvailabilities: many(doctorAvailability),
}));

export const doctorAvailabilityRelations = relations(doctorAvailability, ({one, many}) => ({
	hospital: one(hospitals, {
		fields: [doctorAvailability.bookedByHospitalId],
		references: [hospitals.id]
	}),
	doctor: one(doctors, {
		fields: [doctorAvailability.doctorId],
		references: [doctors.id]
	}),
	enumStatus: one(enumStatus, {
		fields: [doctorAvailability.status],
		references: [enumStatus.status]
	}),
	availabilityTemplate: one(availabilityTemplates, {
		fields: [doctorAvailability.templateId],
		references: [availabilityTemplates.id]
	}),
	doctorAvailabilityHistories: many(doctorAvailabilityHistory),
	assignments: many(assignments),
}));

export const enumStatusRelations = relations(enumStatus, ({many}) => ({
	doctorAvailabilities: many(doctorAvailability),
	assignments: many(assignments),
}));

export const doctorAvailabilityHistoryRelations = relations(doctorAvailabilityHistory, ({one}) => ({
	doctorAvailability: one(doctorAvailability, {
		fields: [doctorAvailabilityHistory.availabilityId],
		references: [doctorAvailability.id]
	}),
	user: one(users, {
		fields: [doctorAvailabilityHistory.changedById],
		references: [users.id]
	}),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	hospital: one(hospitals, {
		fields: [patients.hospitalId],
		references: [hospitals.id]
	}),
	patientConsents: many(patientConsents),
	assignments: many(assignments),
}));

export const patientConsentsRelations = relations(patientConsents, ({one}) => ({
	patient: one(patients, {
		fields: [patientConsents.patientId],
		references: [patients.id]
	}),
}));

export const assignmentsRelations = relations(assignments, ({one, many}) => ({
	doctorAvailability: one(doctorAvailability, {
		fields: [assignments.availabilitySlotId],
		references: [doctorAvailability.id]
	}),
	doctor: one(doctors, {
		fields: [assignments.doctorId],
		references: [doctors.id]
	}),
	hospital: one(hospitals, {
		fields: [assignments.hospitalId],
		references: [hospitals.id]
	}),
	patient: one(patients, {
		fields: [assignments.patientId],
		references: [patients.id]
	}),
	enumPriority: one(enumPriority, {
		fields: [assignments.priority],
		references: [enumPriority.priority]
	}),
	enumStatus: one(enumStatus, {
		fields: [assignments.status],
		references: [enumStatus.status]
	}),
	assignmentRatings: many(assignmentRatings),
	assignmentPayments: many(assignmentPayments),
	hospitalCancellationFlags: many(hospitalCancellationFlags),
	notifications: many(notifications),
}));

export const enumPriorityRelations = relations(enumPriority, ({many}) => ({
	assignments: many(assignments),
}));

export const assignmentRatingsRelations = relations(assignmentRatings, ({one}) => ({
	assignment: one(assignments, {
		fields: [assignmentRatings.assignmentId],
		references: [assignments.id]
	}),
	doctor: one(doctors, {
		fields: [assignmentRatings.doctorId],
		references: [doctors.id]
	}),
	hospital: one(hospitals, {
		fields: [assignmentRatings.hospitalId],
		references: [hospitals.id]
	}),
}));

export const assignmentPaymentsRelations = relations(assignmentPayments, ({one}) => ({
	assignment: one(assignments, {
		fields: [assignmentPayments.assignmentId],
		references: [assignments.id]
	}),
	doctor: one(doctors, {
		fields: [assignmentPayments.doctorId],
		references: [doctors.id]
	}),
	hospital: one(hospitals, {
		fields: [assignmentPayments.hospitalId],
		references: [hospitals.id]
	}),
}));

export const hospitalCancellationFlagsRelations = relations(hospitalCancellationFlags, ({one}) => ({
	assignment: one(assignments, {
		fields: [hospitalCancellationFlags.assignmentId],
		references: [assignments.id]
	}),
	hospital: one(hospitals, {
		fields: [hospitalCancellationFlags.hospitalId],
		references: [hospitals.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one, many}) => ({
	assignment: one(assignments, {
		fields: [notifications.assignmentId],
		references: [assignments.id]
	}),
	enumChannel: one(enumChannel, {
		fields: [notifications.channel],
		references: [enumChannel.channel]
	}),
	notificationRecipients: many(notificationRecipients),
}));

export const enumChannelRelations = relations(enumChannel, ({many}) => ({
	notifications: many(notifications),
}));

export const notificationRecipientsRelations = relations(notificationRecipients, ({one}) => ({
	notification: one(notifications, {
		fields: [notificationRecipients.notificationId],
		references: [notifications.id]
	}),
	user: one(users, {
		fields: [notificationRecipients.userId],
		references: [users.id]
	}),
}));

export const userDevicesRelations = relations(userDevices, ({one}) => ({
	user: one(users, {
		fields: [userDevices.userId],
		references: [users.id]
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	user: one(users, {
		fields: [analyticsEvents.userId],
		references: [users.id]
	}),
}));

export const supportTicketsRelations = relations(supportTickets, ({one}) => ({
	user_assignedTo: one(users, {
		fields: [supportTickets.assignedTo],
		references: [users.id],
		relationName: "supportTickets_assignedTo_users_id"
	}),
	user_userId: one(users, {
		fields: [supportTickets.userId],
		references: [users.id],
		relationName: "supportTickets_userId_users_id"
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	user: one(users, {
		fields: [notificationPreferences.userId],
		references: [users.id]
	}),
}));