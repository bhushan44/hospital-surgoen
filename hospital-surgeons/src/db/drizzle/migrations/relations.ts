import { relations } from "drizzle-orm/relations";
import { assignments, notifications, enumChannel, subscriptionPlans, doctorPlanFeatures, orders, users, paymentTransactions, files, doctors, hospitals, doctorCredentials, doctorProfilePhotos, doctorPreferences, hospitalUsageTracking, hospitalDocuments, hospitalPreferences, doctorHospitalAffiliations, availabilityTemplates, hospitalDepartments, specialties, doctorAvailability, patients, enumPriority, enumStatus, doctorAvailabilityHistory, doctorAssignmentUsage, patientConsents, assignmentRatings, assignmentPayments, hospitalCancellationFlags, auditLogs, userDevices, analyticsEvents, supportTickets, notificationPreferences, planPricing, subscriptions, hospitalPlanFeatures, notificationRecipients, doctorSpecialties, doctorLeaves } from "./schema";

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

export const assignmentsRelations = relations(assignments, ({one, many}) => ({
	notifications: many(notifications),
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
}));

export const enumChannelRelations = relations(enumChannel, ({many}) => ({
	notifications: many(notifications),
}));

export const doctorPlanFeaturesRelations = relations(doctorPlanFeatures, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [doctorPlanFeatures.planId],
		references: [subscriptionPlans.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	doctorPlanFeatures: many(doctorPlanFeatures),
	orders: many(orders),
	planPricings: many(planPricing),
	subscriptions_planId: many(subscriptions, {
		relationName: "subscriptions_planId_subscriptionPlans_id"
	}),
	subscriptions_upgradeFromPlanId: many(subscriptions, {
		relationName: "subscriptions_upgradeFromPlanId_subscriptionPlans_id"
	}),
	hospitalPlanFeatures: many(hospitalPlanFeatures),
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
	doctors: many(doctors),
	hospitals: many(hospitals),
	doctorAvailabilityHistories: many(doctorAvailabilityHistory),
	auditLogs: many(auditLogs),
	userDevices: many(userDevices),
	analyticsEvents: many(analyticsEvents),
	supportTickets_assignedTo: many(supportTickets, {
		relationName: "supportTickets_assignedTo_users_id"
	}),
	supportTickets_userId: many(supportTickets, {
		relationName: "supportTickets_userId_users_id"
	}),
	notificationPreferences: many(notificationPreferences),
	subscriptions: many(subscriptions),
	notificationRecipients: many(notificationRecipients),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one, many}) => ({
	order: one(orders, {
		fields: [paymentTransactions.orderId],
		references: [orders.id]
	}),
	subscriptions: many(subscriptions),
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
	doctorCredentials: many(doctorCredentials),
	doctorProfilePhotos: many(doctorProfilePhotos),
	doctorPreferences: many(doctorPreferences),
	doctorHospitalAffiliations: many(doctorHospitalAffiliations),
	availabilityTemplates: many(availabilityTemplates),
	assignments: many(assignments),
	doctorAssignmentUsages: many(doctorAssignmentUsage),
	assignmentRatings: many(assignmentRatings),
	assignmentPayments: many(assignmentPayments),
	doctorSpecialties: many(doctorSpecialties),
	doctorAvailabilities: many(doctorAvailability),
	doctorLeaves: many(doctorLeaves),
}));

export const filesRelations = relations(files, ({many}) => ({
	doctors: many(doctors),
	hospitals: many(hospitals),
	doctorCredentials: many(doctorCredentials),
	doctorProfilePhotos: many(doctorProfilePhotos),
	hospitalDocuments: many(hospitalDocuments),
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
	hospitalUsageTrackings: many(hospitalUsageTracking),
	hospitalDocuments: many(hospitalDocuments),
	hospitalPreferences: many(hospitalPreferences),
	doctorHospitalAffiliations: many(doctorHospitalAffiliations),
	hospitalDepartments: many(hospitalDepartments),
	assignments: many(assignments),
	patients: many(patients),
	assignmentRatings: many(assignmentRatings),
	assignmentPayments: many(assignmentPayments),
	hospitalCancellationFlags: many(hospitalCancellationFlags),
	doctorAvailabilities: many(doctorAvailability),
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

export const hospitalUsageTrackingRelations = relations(hospitalUsageTracking, ({one}) => ({
	hospital: one(hospitals, {
		fields: [hospitalUsageTracking.hospitalId],
		references: [hospitals.id]
	}),
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

export const specialtiesRelations = relations(specialties, ({many}) => ({
	hospitalDepartments: many(hospitalDepartments),
	doctorSpecialties: many(doctorSpecialties),
}));

export const doctorAvailabilityRelations = relations(doctorAvailability, ({one, many}) => ({
	assignments: many(assignments),
	doctorAvailabilityHistories: many(doctorAvailabilityHistory),
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
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	assignments: many(assignments),
	hospital: one(hospitals, {
		fields: [patients.hospitalId],
		references: [hospitals.id]
	}),
	patientConsents: many(patientConsents),
}));

export const enumPriorityRelations = relations(enumPriority, ({many}) => ({
	assignments: many(assignments),
}));

export const enumStatusRelations = relations(enumStatus, ({many}) => ({
	assignments: many(assignments),
	doctorAvailabilities: many(doctorAvailability),
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

export const doctorAssignmentUsageRelations = relations(doctorAssignmentUsage, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorAssignmentUsage.doctorId],
		references: [doctors.id]
	}),
}));

export const patientConsentsRelations = relations(patientConsents, ({one}) => ({
	patient: one(patients, {
		fields: [patientConsents.patientId],
		references: [patients.id]
	}),
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

export const planPricingRelations = relations(planPricing, ({one, many}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [planPricing.planId],
		references: [subscriptionPlans.id]
	}),
	subscriptions_pricingId: many(subscriptions, {
		relationName: "subscriptions_pricingId_planPricing_id"
	}),
	subscriptions_upgradeFromPricingId: many(subscriptions, {
		relationName: "subscriptions_upgradeFromPricingId_planPricing_id"
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one, many}) => ({
	order: one(orders, {
		fields: [subscriptions.orderId],
		references: [orders.id]
	}),
	paymentTransaction: one(paymentTransactions, {
		fields: [subscriptions.paymentTransactionId],
		references: [paymentTransactions.id]
	}),
	subscriptionPlan_planId: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id],
		relationName: "subscriptions_planId_subscriptionPlans_id"
	}),
	subscription: one(subscriptions, {
		fields: [subscriptions.previousSubscriptionId],
		references: [subscriptions.id],
		relationName: "subscriptions_previousSubscriptionId_subscriptions_id"
	}),
	subscriptions: many(subscriptions, {
		relationName: "subscriptions_previousSubscriptionId_subscriptions_id"
	}),
	planPricing_pricingId: one(planPricing, {
		fields: [subscriptions.pricingId],
		references: [planPricing.id],
		relationName: "subscriptions_pricingId_planPricing_id"
	}),
	subscriptionPlan_upgradeFromPlanId: one(subscriptionPlans, {
		fields: [subscriptions.upgradeFromPlanId],
		references: [subscriptionPlans.id],
		relationName: "subscriptions_upgradeFromPlanId_subscriptionPlans_id"
	}),
	planPricing_upgradeFromPricingId: one(planPricing, {
		fields: [subscriptions.upgradeFromPricingId],
		references: [planPricing.id],
		relationName: "subscriptions_upgradeFromPricingId_planPricing_id"
	}),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const hospitalPlanFeaturesRelations = relations(hospitalPlanFeatures, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [hospitalPlanFeatures.planId],
		references: [subscriptionPlans.id]
	}),
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

export const doctorLeavesRelations = relations(doctorLeaves, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorLeaves.doctorId],
		references: [doctors.id]
	}),
}));