import { relations } from "drizzle-orm/relations";
import { subscriptionPlans, doctorPlanFeatures, patients, patientConsents, users, otps, files, doctors, paymentTransactions, planPricing, subscriptions, doctorCredentials, doctorProfilePhotos, hospitals, doctorPreferences, doctorAvailability, doctorAvailabilityHistory, hospitalPreferences, hospitalDocuments, doctorHospitalAffiliations, availabilityTemplates, hospitalUsageTracking, hospitalDepartments, specialties, assignments, enumPriority, enumStatus, doctorAssignmentUsage, auditLogs, orders, assignmentRatings, assignmentPayments, hospitalCancellationFlags, notifications, enumChannel, analyticsEvents, supportTickets, userDevices, notificationPreferences, hospitalPlanFeatures, notificationRecipients, doctorSpecialties, webhookEvents, doctorLeaves } from "./schema";

export const doctorPlanFeaturesRelations = relations(doctorPlanFeatures, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [doctorPlanFeatures.planId],
		references: [subscriptionPlans.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	doctorPlanFeatures: many(doctorPlanFeatures),
	paymentTransactions: many(paymentTransactions),
	orders: many(orders),
	planPricings: many(planPricing),
	subscriptions_nextPlanId: many(subscriptions, {
		relationName: "subscriptions_nextPlanId_subscriptionPlans_id"
	}),
	subscriptions_planId: many(subscriptions, {
		relationName: "subscriptions_planId_subscriptionPlans_id"
	}),
	hospitalPlanFeatures: many(hospitalPlanFeatures),
}));

export const patientConsentsRelations = relations(patientConsents, ({one}) => ({
	patient: one(patients, {
		fields: [patientConsents.patientId],
		references: [patients.id]
	}),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	patientConsents: many(patientConsents),
	hospital: one(hospitals, {
		fields: [patients.hospitalId],
		references: [hospitals.id]
	}),
	assignments: many(assignments),
}));

export const otpsRelations = relations(otps, ({one}) => ({
	user: one(users, {
		fields: [otps.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	otps: many(otps),
	doctors: many(doctors),
	paymentTransactions: many(paymentTransactions),
	hospitals: many(hospitals),
	doctorAvailabilityHistories: many(doctorAvailabilityHistory),
	auditLogs: many(auditLogs),
	orders: many(orders),
	analyticsEvents: many(analyticsEvents),
	supportTickets_assignedTo: many(supportTickets, {
		relationName: "supportTickets_assignedTo_users_id"
	}),
	supportTickets_userId: many(supportTickets, {
		relationName: "supportTickets_userId_users_id"
	}),
	userDevices: many(userDevices),
	notificationPreferences: many(notificationPreferences),
	subscriptions: many(subscriptions),
	notificationRecipients: many(notificationRecipients),
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
	doctorCredentials: many(doctorCredentials),
	doctorProfilePhotos: many(doctorProfilePhotos),
	hospitals: many(hospitals),
	hospitalDocuments: many(hospitalDocuments),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one, many}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [paymentTransactions.planId],
		references: [subscriptionPlans.id]
	}),
	planPricing: one(planPricing, {
		fields: [paymentTransactions.pricingId],
		references: [planPricing.id]
	}),
	subscription: one(subscriptions, {
		fields: [paymentTransactions.subscriptionId],
		references: [subscriptions.id],
		relationName: "paymentTransactions_subscriptionId_subscriptions_id"
	}),
	user: one(users, {
		fields: [paymentTransactions.userId],
		references: [users.id]
	}),
	subscriptions: many(subscriptions, {
		relationName: "subscriptions_paymentTransactionId_paymentTransactions_id"
	}),
	webhookEvents: many(webhookEvents),
}));

export const planPricingRelations = relations(planPricing, ({one, many}) => ({
	paymentTransactions: many(paymentTransactions),
	orders: many(orders),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [planPricing.planId],
		references: [subscriptionPlans.id]
	}),
	subscriptions_nextPricingId: many(subscriptions, {
		relationName: "subscriptions_nextPricingId_planPricing_id"
	}),
	subscriptions_pricingId: many(subscriptions, {
		relationName: "subscriptions_pricingId_planPricing_id"
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one, many}) => ({
	paymentTransactions: many(paymentTransactions, {
		relationName: "paymentTransactions_subscriptionId_subscriptions_id"
	}),
	subscriptionPlan_nextPlanId: one(subscriptionPlans, {
		fields: [subscriptions.nextPlanId],
		references: [subscriptionPlans.id],
		relationName: "subscriptions_nextPlanId_subscriptionPlans_id"
	}),
	planPricing_nextPricingId: one(planPricing, {
		fields: [subscriptions.nextPricingId],
		references: [planPricing.id],
		relationName: "subscriptions_nextPricingId_planPricing_id"
	}),
	paymentTransaction: one(paymentTransactions, {
		fields: [subscriptions.paymentTransactionId],
		references: [paymentTransactions.id],
		relationName: "subscriptions_paymentTransactionId_paymentTransactions_id"
	}),
	subscriptionPlan_planId: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id],
		relationName: "subscriptions_planId_subscriptionPlans_id"
	}),
	planPricing_pricingId: one(planPricing, {
		fields: [subscriptions.pricingId],
		references: [planPricing.id],
		relationName: "subscriptions_pricingId_planPricing_id"
	}),
	subscription: one(subscriptions, {
		fields: [subscriptions.replacedBySubscriptionId],
		references: [subscriptions.id],
		relationName: "subscriptions_replacedBySubscriptionId_subscriptions_id"
	}),
	subscriptions: many(subscriptions, {
		relationName: "subscriptions_replacedBySubscriptionId_subscriptions_id"
	}),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
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

export const hospitalsRelations = relations(hospitals, ({one, many}) => ({
	file: one(files, {
		fields: [hospitals.logoId],
		references: [files.id]
	}),
	user: one(users, {
		fields: [hospitals.userId],
		references: [users.id]
	}),
	hospitalPreferences: many(hospitalPreferences),
	hospitalDocuments: many(hospitalDocuments),
	doctorHospitalAffiliations: many(doctorHospitalAffiliations),
	hospitalUsageTrackings: many(hospitalUsageTracking),
	hospitalDepartments: many(hospitalDepartments),
	patients: many(patients),
	assignments: many(assignments),
	assignmentRatings: many(assignmentRatings),
	assignmentPayments: many(assignmentPayments),
	hospitalCancellationFlags: many(hospitalCancellationFlags),
	doctorAvailabilities: many(doctorAvailability),
}));

export const doctorPreferencesRelations = relations(doctorPreferences, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorPreferences.doctorId],
		references: [doctors.id]
	}),
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

export const doctorAvailabilityRelations = relations(doctorAvailability, ({one, many}) => ({
	doctorAvailabilityHistories: many(doctorAvailabilityHistory),
	assignments: many(assignments),
	hospital: one(hospitals, {
		fields: [doctorAvailability.bookedByHospitalId],
		references: [hospitals.id]
	}),
	doctor: one(doctors, {
		fields: [doctorAvailability.doctorId],
		references: [doctors.id]
	}),
	doctorAvailability: one(doctorAvailability, {
		fields: [doctorAvailability.parentSlotId],
		references: [doctorAvailability.id],
		relationName: "doctorAvailability_parentSlotId_doctorAvailability_id"
	}),
	doctorAvailabilities: many(doctorAvailability, {
		relationName: "doctorAvailability_parentSlotId_doctorAvailability_id"
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

export const hospitalPreferencesRelations = relations(hospitalPreferences, ({one}) => ({
	hospital: one(hospitals, {
		fields: [hospitalPreferences.hospitalId],
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

export const hospitalUsageTrackingRelations = relations(hospitalUsageTracking, ({one}) => ({
	hospital: one(hospitals, {
		fields: [hospitalUsageTracking.hospitalId],
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

export const specialtiesRelations = relations(specialties, ({many}) => ({
	hospitalDepartments: many(hospitalDepartments),
	doctorSpecialties: many(doctorSpecialties),
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

export const enumStatusRelations = relations(enumStatus, ({many}) => ({
	assignments: many(assignments),
	doctorAvailabilities: many(doctorAvailability),
}));

export const doctorAssignmentUsageRelations = relations(doctorAssignmentUsage, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorAssignmentUsage.doctorId],
		references: [doctors.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({one}) => ({
	subscriptionPlan: one(subscriptionPlans, {
		fields: [orders.planId],
		references: [subscriptionPlans.id]
	}),
	planPricing: one(planPricing, {
		fields: [orders.pricingId],
		references: [planPricing.id]
	}),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
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

export const userDevicesRelations = relations(userDevices, ({one}) => ({
	user: one(users, {
		fields: [userDevices.userId],
		references: [users.id]
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	user: one(users, {
		fields: [notificationPreferences.userId],
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

export const webhookEventsRelations = relations(webhookEvents, ({one}) => ({
	paymentTransaction: one(paymentTransactions, {
		fields: [webhookEvents.paymentTransactionId],
		references: [paymentTransactions.id]
	}),
}));

export const doctorLeavesRelations = relations(doctorLeaves, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorLeaves.doctorId],
		references: [doctors.id]
	}),
}));