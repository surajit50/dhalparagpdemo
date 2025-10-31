import * as z from "zod"

export const landApplicationSchema = z.object({
  applicantName: z.string().min(2),
  applicantMobile: z.string().min(10),
  address: z.string().optional(),
  plotNumber: z.string().min(1),
  khatianNumber: z.string().min(1),
  mouza: z.string().min(1),
  jlNo: z.string().min(1),
  areaSqm: z.number().positive(),
  landUseCurrent: z.string().min(1),
  landUseProposed: z.string().min(1),
})

export type LandApplicationInput = z.infer<typeof landApplicationSchema>

export const documentUploadSchema = z.object({
  applicationId: z.string().min(1),
  docType: z.string().min(1),
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
})

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>

export const documentVerifySchema = z.object({
  documentId: z.string().min(1),
  verified: z.boolean(),
  verificationNote: z.string().optional(),
})

export type DocumentVerifyInput = z.infer<typeof documentVerifySchema>

export const assignmentSchema = z.object({
  applicationId: z.string().min(1),
  staffId: z.string().min(1),
})

export type AssignmentInput = z.infer<typeof assignmentSchema>

export const inspectionSchema = z.object({
  applicationId: z.string().min(1),
  officerName: z.string().min(2),
  inspectionDate: z.date(),
  findings: z.string().min(1),
  recommendations: z.string().min(1),
  witnessNames: z.array(z.string()).default([]),
  documentsChecked: z.array(z.string()).default([]),
})

export type InspectionInput = z.infer<typeof inspectionSchema>

export const approvalSchema = z.object({
  applicationId: z.string().min(1),
  approverName: z.string().min(2),
  designation: z.string().min(2),
  status: z.enum(["APPROVED", "REJECTED", "RETURNED_FOR_CLARIFICATION"]),
  comments: z.string().optional(),
  level: z.number().int().positive().default(1),
})

export type ApprovalInput = z.infer<typeof approvalSchema>

export const issueNocSchema = z.object({
  applicationId: z.string().min(1),
  nocNo: z.string().min(1),
  nocDate: z.date(),
  validityMonths: z.number().int().positive().default(6),
  issuedBy: z.string().min(2),
  issuerDesignation: z.string().min(2),
})

export type IssueNocInput = z.infer<typeof issueNocSchema>

export const complianceSchema = z.object({
  applicationId: z.string().min(1),
  remarks: z.string().min(1),
})

export type ComplianceInput = z.infer<typeof complianceSchema>


