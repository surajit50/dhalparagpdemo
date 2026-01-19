"use server";

import { generate } from "@pdfme/generator";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
} from "@pdfme/schemas";
import { formatDate } from "@/utils/utils";
import { gpname } from "@/constants/gpinfor";
import { loadJSONTemplate } from "@/lib/loadJSONTemplate";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { LandConversionStatus, ApprovalStatus } from "@prisma/client";
import { currentUser } from "@/lib/auth";

export interface LandConversionData {
  applicationNo: string;
  certificateNo: string;
  memoNumber: string;
  issueDate: Date | string;
  applicantName: string;
  applicantAddress: string;
  applicantPhone?: string;
  applicantEmail?: string;
  khatianNo: string;
  plotNo: string;
  mouza: string;
  jlNo: string;
  policeStation: string;
  block: string;
  district: string;
  state: string;
  landAreaDec: string;
  presentLandUse: string;
  proposedLandUse: string;
  applicationDate?: Date | string;
  inspectionRemarks?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
}

export interface CreateApplicationData {
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantAddress: string;
  khatianNo: string;
  plotNo: string;
  mouza: string;
  jlNo: string;
  policeStation: string;
  block: string;
  district: string;
  state: string;
  landAreaDec: string;
  presentLandUse: string;
  proposedLandUse: string;
}

export type ActionResult<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

// Generate application number
async function generateApplicationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.landConversionApplication.count({
    where: {
      applicationNo: {
        startsWith: `LC-${year}-`,
      },
    },
  });
  const serial = String(count + 1).padStart(4, "0");
  return `LC-${year}-${serial}`;
}

// Create application
export async function createLandConversionApplication(
  data: CreateApplicationData
): Promise<ActionResult> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const applicationNo = await generateApplicationNumber();

    const application = await db.landConversionApplication.create({
      data: {
        applicationNo,
        status: LandConversionStatus.DRAFT,
        ...data,
        createdById: user.id,
      },
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return {
      success: true,
      message: "Application created successfully",
      data: application,
    };
  } catch (error: any) {
    console.error("Error creating application:", error);
    return {
      success: false,
      message: error.message || "Failed to create application",
    };
  }
}

// Submit application
export async function submitLandConversionApplication(
  applicationId: string
): Promise<ActionResult> {
  try {
    const application = await db.landConversionApplication.update({
      where: { id: applicationId },
      data: {
        status: LandConversionStatus.SUBMITTED,
      },
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return {
      success: true,
      message: "Application submitted successfully",
      data: application,
    };
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      message: error.message || "Failed to submit application",
    };
  }
}

// Get all applications
export async function getLandConversionApplications(filters?: {
  status?: LandConversionStatus;
  search?: string;
}) {
  try {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { applicantName: { contains: filters.search, mode: "insensitive" } },
        { applicationNo: { contains: filters.search, mode: "insensitive" } },
        { khatianNo: { contains: filters.search, mode: "insensitive" } },
        { plotNo: { contains: filters.search, mode: "insensitive" } },
        { mouza: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const applications = await db.landConversionApplication.findMany({
      where,
      include: {
        verification: true,
        inspection: true,
        approval: true,
        certificate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: applications };
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return { success: false, message: error.message || "Failed to fetch applications" };
  }
}

// Get application by ID
export async function getLandConversionApplicationById(
  applicationId: string
): Promise<ActionResult> {
  try {
    const application = await db.landConversionApplication.findUnique({
      where: { id: applicationId },
      include: {
        verification: true,
        inspection: true,
        approval: true,
        certificate: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    return { success: true, message: "Application fetched successfully", data: application };
  } catch (error: any) {
    console.error("Error fetching application:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch application",
    };
  }
}

// Verify application
export async function verifyLandConversionApplication(
  applicationId: string,
  data: {
    verifiedBy: string;
    remarks?: string;
    status: ApprovalStatus;
  }
): Promise<ActionResult> {
  try {
    await db.$transaction(async (tx) => {
      // Create or update verification
      await tx.landConversionVerification.upsert({
        where: { applicationId },
        create: {
          applicationId,
          verifiedBy: data.verifiedBy,
          verificationDate: new Date(),
          remarks: data.remarks,
          status: data.status,
          documentsVerified: data.status === ApprovalStatus.APPROVED,
        },
        update: {
          verifiedBy: data.verifiedBy,
          verificationDate: new Date(),
          remarks: data.remarks,
          status: data.status,
          documentsVerified: data.status === ApprovalStatus.APPROVED,
        },
      });

      // Update application status
      const newStatus =
        data.status === ApprovalStatus.APPROVED
          ? LandConversionStatus.VERIFIED
          : LandConversionStatus.VERIFICATION_REJECTED;

      await tx.landConversionApplication.update({
        where: { id: applicationId },
        data: { status: newStatus },
      });
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return { success: true, message: "Verification completed successfully" };
  } catch (error: any) {
    console.error("Error verifying application:", error);
    return {
      success: false,
      message: error.message || "Failed to verify application",
    };
  }
}

// Schedule inspection
export async function scheduleLandConversionInspection(
  applicationId: string,
  data: {
    inspectorName: string;
    scheduledDate: Date;
    siteAddress?: string;
  }
): Promise<ActionResult> {
  try {
    await db.$transaction(async (tx) => {
      // Create or update inspection
      await tx.landConversionInspection.upsert({
        where: { applicationId },
        create: {
          applicationId,
          inspectorName: data.inspectorName,
          scheduledDate: data.scheduledDate,
          siteAddress: data.siteAddress,
          status: ApprovalStatus.PENDING,
        },
        update: {
          inspectorName: data.inspectorName,
          scheduledDate: data.scheduledDate,
          siteAddress: data.siteAddress,
        },
      });

      // Update application status
      await tx.landConversionApplication.update({
        where: { id: applicationId },
        data: { status: LandConversionStatus.INSPECTION_PENDING },
      });
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return { success: true, message: "Inspection scheduled successfully" };
  } catch (error: any) {
    console.error("Error scheduling inspection:", error);
    return {
      success: false,
      message: error.message || "Failed to schedule inspection",
    };
  }
}

// Complete inspection
export async function completeLandConversionInspection(
  applicationId: string,
  data: {
    report?: string;
    findings?: string;
    recommendations?: string;
    status: ApprovalStatus;
  }
): Promise<ActionResult> {
  try {
    await db.$transaction(async (tx) => {
      // Update inspection
      await tx.landConversionInspection.update({
        where: { applicationId },
        data: {
          inspectionDate: new Date(),
          report: data.report,
          findings: data.findings,
          recommendations: data.recommendations,
          status: data.status,
        },
      });

      // Update application status
      const newStatus =
        data.status === ApprovalStatus.APPROVED
          ? LandConversionStatus.INSPECTION_COMPLETED
          : LandConversionStatus.INSPECTION_REJECTED;

      await tx.landConversionApplication.update({
        where: { id: applicationId },
        data: { status: newStatus },
      });
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return { success: true, message: "Inspection completed successfully" };
  } catch (error: any) {
    console.error("Error completing inspection:", error);
    return {
      success: false,
      message: error.message || "Failed to complete inspection",
    };
  }
}

// Approve application
export async function approveLandConversionApplication(
  applicationId: string,
  data: {
    approverName: string;
    designation: string;
    comments?: string;
    status: ApprovalStatus;
  }
): Promise<ActionResult> {
  try {
    await db.$transaction(async (tx) => {
      // Create approval record
      await tx.landConversionApproval.create({
        data: {
          applicationId,
          approverName: data.approverName,
          designation: data.designation,
          approvalDate: new Date(),
          comments: data.comments,
          status: data.status,
        },
      });

      // Update application status
      const newStatus =
        data.status === ApprovalStatus.APPROVED
          ? LandConversionStatus.APPROVED
          : LandConversionStatus.REJECTED;

      await tx.landConversionApplication.update({
        where: { id: applicationId },
        data: { status: newStatus },
      });
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return { success: true, message: "Approval processed successfully" };
  } catch (error: any) {
    console.error("Error approving application:", error);
    return {
      success: false,
      message: error.message || "Failed to process approval",
    };
  }
}

// Issue certificate
export async function issueLandConversionCertificate(
  applicationId: string,
  data: {
    certificateNo: string;
    memoNumber: string;
    issueDate: Date;
    signatoryName?: string;
    signatoryDesignation?: string;
  }
): Promise<ActionResult> {
  try {
    await db.$transaction(async (tx) => {
      // Create certificate
      await tx.landConversionCertificate.create({
        data: {
          applicationId,
          certificateNo: data.certificateNo,
          memoNumber: data.memoNumber,
          issueDate: data.issueDate,
          signatoryName: data.signatoryName,
          signatoryDesignation: data.signatoryDesignation,
        },
      });

      // Update application status
      await tx.landConversionApplication.update({
        where: { id: applicationId },
        data: { status: LandConversionStatus.ISSUED },
      });
    });

    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    revalidatePath("/admindashboard/(Inheritance Certificate)/manage-land-conversion");
    return { success: true, message: "Certificate issued successfully" };
  } catch (error: any) {
    console.error("Error issuing certificate:", error);
    return {
      success: false,
      message: error.message || "Failed to issue certificate",
    };
  }
}



export async function generateLandConversionPDF(data: LandConversionData) {
  try {
    // Load template
    const template = await loadJSONTemplate("/templates/land-conversion-certificate.json");

    // Format dates
    const issueDateFormatted = formatDate(
      typeof data.issueDate === "string" ? new Date(data.issueDate) : data.issueDate
    );
    const applicationDateFormatted = data.applicationDate
      ? formatDate(
          typeof data.applicationDate === "string"
            ? new Date(data.applicationDate)
            : data.applicationDate
        )
      : issueDateFormatted;

    // Format land details
    const landDetails = `Khatian No: ${data.khatianNo}, Plot No: ${data.plotNo}, Mouza: ${data.mouza}, JL No: ${data.jlNo}, Police Station: ${data.policeStation}, Block: ${data.block}, District: ${data.district}, State: ${data.state}. Land Area: ${data.landAreaDec} Decimal.`;

    // Format conversion details
    const conversionDetails = `The land use is proposed to be converted from "${data.presentLandUse}" to "${data.proposedLandUse}".`;

    // Format paragraph 1 with application date
    const paragraph1 = `With reference to your application dated ${applicationDateFormatted} for conversion of land use, this is to certify that after due verification of documents and site inspection, the Gram Panchayat has no objection to the conversion of land use as per the details mentioned below:`;

    // Prepare input data
    const inputs = [
      {
        gpname: gpname,
        certificateNumber: data.certificateNo || data.applicationNo,
        memoNumber: data.memoNumber,
        issueDate: issueDateFormatted,
        applicantName: data.applicantName,
        applicantAddress: data.applicantAddress,
        subjectText: "No Objection Certificate for Land Conversion",
        paragraph1: paragraph1,
        landDetails: landDetails,
        conversionDetails: conversionDetails,
        conditions: "1. The conversion is subject to compliance with all applicable laws and regulations.\n2. The applicant must maintain proper setbacks as per building regulations.\n3. Any violation of the conditions may result in cancellation of this certificate.\n4. This certificate is valid only for the purpose stated above.",
        signatoryName: data.signatoryName || "Executive Officer",
        signatoryDesignation: data.signatoryDesignation || "Executive Officer",
      },
    ];

    // Generate PDF
    const pdf = await generate({
      template,
      inputs,
      plugins: {
        text,
        image,
        table,
        line,
        multiVariableText,
        rectangle,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

