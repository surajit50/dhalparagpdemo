"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { LandNOCStatus, EnquiryStatus, ApprovalStatus } from "@prisma/client";
import {
  landApplicationSchema,
  LandApplicationInput,
  documentUploadSchema,
  DocumentUploadInput,
  documentVerifySchema,
  DocumentVerifyInput,
  assignmentSchema,
  AssignmentInput,
  inspectionSchema,
  InspectionInput,
  approvalSchema,
  ApprovalInput,
  issueNocSchema,
  IssueNocInput,
  complianceSchema,
  ComplianceInput,
} from "@/schema/land-conversion";

function padNumber(num: number, size: number) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

async function generateApplicationNo(): Promise<string> {
  const year = new Date().getFullYear();
  const latest = await db.landConversionApplication.findFirst({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    orderBy: { createdAt: "desc" },
    select: { applicationNo: true },
  });
  const seq = latest?.applicationNo?.split("/").pop();
  const next = seq ? parseInt(seq) + 1 : 1;
  return `LC/${year}/${padNumber(next, 4)}`;
}

export async function createLandApplication(input: LandApplicationInput) {
  const data = landApplicationSchema.parse(input);
  const applicationNo = await generateApplicationNo();
  const app = await db.landConversionApplication.create({
    data: {
      applicationNo,
      applicantName: data.applicantName,
      applicantMobile: data.applicantMobile,
      address: data.address,
      plotNumber: data.plotNumber,
      khatianNumber: data.khatianNumber,
      mouza: data.mouza,
      jlNo: data.jlNo,
      areaSqm: data.areaSqm,
      landUseCurrent: data.landUseCurrent,
      landUseProposed: data.landUseProposed,
      status: LandNOCStatus.SUBMITTED,
    },
  });
  revalidatePath("/admindashboard/manage-land-conversion/application");
  return app;
}

export async function listLandApplications(status?: LandNOCStatus) {
  return db.landConversionApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function uploadLandDocument(input: DocumentUploadInput) {
  const data = documentUploadSchema.parse(input);
  const doc = await db.landConversionDocument.create({
    data: {
      applicationId: data.applicationId,
      docType: data.docType,
      fileUrl: data.fileUrl,
      fileKey: data.fileKey,
    },
  });

  await db.landConversionApplication.update({
    where: { id: data.applicationId },
    data: { status: LandNOCStatus.DOCUMENT_VERIFICATION_PENDING },
  });

  revalidatePath("/admindashboard/manage-land-conversion/verify");
  return doc;
}

export async function verifyLandDocument(input: DocumentVerifyInput) {
  const data = documentVerifySchema.parse(input);
  const updated = await db.landConversionDocument.update({
    where: { id: data.documentId },
    data: { verified: data.verified, verificationNote: data.verificationNote },
  });

  const appDocs = await db.landConversionDocument.findMany({
    where: { applicationId: updated.applicationId },
  });
  const allVerified = appDocs.length > 0 && appDocs.every((d) => d.verified);
  if (allVerified) {
    await db.landConversionApplication.update({
      where: { id: updated.applicationId },
      data: { status: LandNOCStatus.INSPECTION_PENDING },
    });
  }

  revalidatePath("/admindashboard/manage-land-conversion/verify");
  return updated;
}

export async function assignLandApplication(input: AssignmentInput) {
  const data = assignmentSchema.parse(input);
  const app = await db.landConversionApplication.update({
    where: { id: data.applicationId },
    data: { assignedStaffId: data.staffId },
  });
  revalidatePath("/admindashboard/manage-land-conversion/application");
  return app;
}

export async function submitLandInspection(input: InspectionInput) {
  const data = inspectionSchema.parse(input);
  const inspection = await db.landInspection.upsert({
    where: { applicationId: data.applicationId },
    create: {
      applicationId: data.applicationId,
      officerName: data.officerName,
      inspectionDate: data.inspectionDate,
      findings: data.findings,
      recommendations: data.recommendations,
      witnessNames: data.witnessNames,
      documentsChecked: data.documentsChecked,
      status: EnquiryStatus.COMPLETED,
    },
    update: {
      officerName: data.officerName,
      inspectionDate: data.inspectionDate,
      findings: data.findings,
      recommendations: data.recommendations,
      witnessNames: data.witnessNames,
      documentsChecked: data.documentsChecked,
      status: EnquiryStatus.COMPLETED,
    },
  });

  await db.landConversionApplication.update({
    where: { id: data.applicationId },
    data: { status: LandNOCStatus.APPROVAL_PENDING },
  });

  revalidatePath("/admindashboard/manage-land-conversion/inspection");
  return inspection;
}

export async function approveLandApplication(input: ApprovalInput) {
  const data = approvalSchema.parse(input);
  const approval = await db.landApproval.create({
    data: {
      applicationId: data.applicationId,
      approverName: data.approverName,
      designation: data.designation,
      approvalDate: new Date(),
      status: data.status as ApprovalStatus,
      comments: data.comments,
      level: data.level,
    },
  });

  let newStatus: LandNOCStatus = LandNOCStatus.APPROVAL_PENDING;
  if (data.status === "APPROVED") newStatus = LandNOCStatus.APPROVED;
  if (data.status === "REJECTED") newStatus = LandNOCStatus.REJECTED;
  if (data.status === "RETURNED_FOR_CLARIFICATION") newStatus = LandNOCStatus.RETURNED_FOR_CLARIFICATION;

  await db.landConversionApplication.update({
    where: { id: data.applicationId },
    data: { status: newStatus },
  });

  revalidatePath("/admindashboard/manage-land-conversion/approve");
  return approval;
}

export async function issueLandNoc(input: IssueNocInput) {
  const data = issueNocSchema.parse(input);
  const expiry = new Date(data.nocDate);
  expiry.setMonth(expiry.getMonth() + (data.validityMonths ?? 6));

  const app = await db.landConversionApplication.update({
    where: { id: data.applicationId },
    data: {
      nocNo: data.nocNo,
      nocDate: data.nocDate,
      validityMonths: data.validityMonths,
      expiryDate: expiry,
      issuedBy: data.issuedBy,
      issuerDesignation: data.issuerDesignation,
      status: LandNOCStatus.NOC_ISSUED,
    },
  });
  revalidatePath("/admindashboard/manage-land-conversion/issue");
  return app;
}

export async function completeLandCompliance(input: ComplianceInput) {
  const data = complianceSchema.parse(input);
  const app = await db.landConversionApplication.update({
    where: { id: data.applicationId },
    data: {
      complianceRemarks: data.remarks,
      status: LandNOCStatus.COMPLIANCE_COMPLETED,
    },
  });
  revalidatePath("/admindashboard/manage-land-conversion/compliance");
  return app;
}


