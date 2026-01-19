import { generate } from "@pdfme/generator";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
  barcodes,
} from "@pdfme/schemas";
import type { Template } from "@pdfme/common";
import { loadJSONTemplate } from "@/lib/loadJSONTemplate";
import { numberToWords } from "@/lib/utils/number-to-words";

export interface MeasurementBookData {
  projectName: string;
  projectLocation: string;
  contractor: string;
  engineer: string;
  activityCode: string;
  agreementAmount: number;
  measurements: Array<{
    slNo: number;
    date: string;
    description: string;
    dimensions: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
  totalAmount: number;
  measuredBy: string;
  verifiedBy: string;
}

export interface AbstractBillData {
  billNumber: string;
  billDate: string;
  projectName: string;
  projectLocation: string;
  contractor: string;
  period: string;
  previousBillAmount: number;
  currentBillAmount: number;
  cumulativeAmount: number;
  deductions: {
    securityDeposit: number;
    workContractTax: number;
    incomeTax: number;
    labourCess: number;
    other: number;
  };
  netPayable: number;
  createdBy: string;
  approvedBy?: string;
}

export interface WorkEstimateDPRData {
  projectName: string;
  projectLocation: string;
  activityCode: string;
  estimateType: string;
  contractor: string;
  engineer: string;
  dimensions: string;
  workItems: Array<{
    slNo: number;
    description: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number;
    category: string;
    schedulePageNo?: string;
  }>;
  subtotal: number;
  sgstPercent: number;
  sgstAmount: number;
  cgstPercent: number;
  cgstAmount: number;
  labourCessPercent: number;
  labourCessAmount: number;
  contingencyPercent: number;
  contingencyAmount: number;
  totalAmount: number;
  sanctionedAmount: number;
  variance: number;
  fund?: string;
}

export interface ProbableEstimateData {
  projectName: string;
  projectLocation: string;
  activityCode: string;
  fund: string;
  workItems: Array<{
    slNo: number;
    schedulePageNo: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
  itemwiseTotal: number;
  gstPercent: number;
  gstAmount: number;
  costCivilWork: number;
  lwcAmount: number;
  costCivilWorkIncl: number;
  contingencyAmount: number;
  grandTotal: number;
  sayAmount: number;
}

export interface BillAbstractFormData {
  billType: string;
  projectName: string;
  projectLocation: string;
  workItems: Array<{
    slNo: number;
    items: string;
    mbNoAndPage: string;
    quantityExecuted: number;
    unit: string;
    rate: number;
    amount: number;
    remarks?: string;
  }>;
  itemwiseTotal: number;
  contractualPercent: number;
  contractualDeduction: number;
  actualValue: number;
  sayAmount: number;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  subTotal: number;
  lwcPercent: number;
  lwcAmount: number;
  grossBillAmount: number;
  mbNumber: string;
  mbPages: string;
}

export interface FinalBillPaymentData {
  projectName: string;
  activityCode: string;
  fund: string;
  estimatedAmount: string;
  nitNumber: string;
  nitDate: string;
  woMemoNumber: string;
  woDate: string;
  agreementNumber: string;
  agreementDate: string;
  commencementDate: string;
  completionDate: string;
  finalMeasurementDate: string;
  contractorName: string;
  contractorAddress: string;
  grossBillAmount: string;
  incomeTaxPercent: number;
  incomeTaxAmount: string;
  gstTdsPercent: number;
  gstTdsAmount: string;
  labourWelfareCessPercent: number;
  labourWelfareCessAmount: string;
  securityDepositPercent: number;
  securityDepositAmount: string;
  totalDeduction: string;
  netPayableAmount: string;
  netPayableInWords: string;
  voucherNumber?: string;
  voucherDate?: string;
  cashBookVoucher?: string;
  cashBookDate?: string;
  cashBookPage?: string;
}

export async function generateMeasurementBookPDF(data: MeasurementBookData): Promise<Uint8Array> {
  try {
    const template = await loadJSONTemplate("/templates/measurement-book.json");

    // Format measurements table - PDFMe table expects array of arrays
    const measurementRows = data.measurements.map((m) => [
      m.slNo.toString(),
      new Date(m.date).toLocaleDateString("en-GB"),
      m.description,
      m.dimensions,
      m.quantity.toFixed(2),
      m.unit,
      m.rate.toLocaleString("en-IN"),
      m.amount.toLocaleString("en-IN"),
    ]);

    const inputs = [
      {
        projectName: data.projectName,
        projectLocation: data.projectLocation,
        contractor: data.contractor,
        engineer: data.engineer,
        activityCode: data.activityCode,
        agreementAmount: `₹${data.agreementAmount.toLocaleString("en-IN")}`,
        measurementtable: JSON.stringify(measurementRows),
        totalAmount: `₹${data.totalAmount.toLocaleString("en-IN")}`,
        measuredBy: data.measuredBy,
        verifiedBy: data.verifiedBy || "Not Verified",
        printDate: new Date().toLocaleDateString("en-GB"),
      },
    ];

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
        ...barcodes,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating Measurement Book PDF:", error);
    throw new Error("Failed to generate Measurement Book PDF");
  }
}

export async function generateAbstractBillPDF(data: AbstractBillData): Promise<Uint8Array> {
  try {
    const template = await loadJSONTemplate("/templates/abstract-bill.json");

    const totalDeductions =
      data.deductions.securityDeposit +
      data.deductions.workContractTax +
      data.deductions.incomeTax +
      data.deductions.labourCess +
      data.deductions.other;

    const inputs = [
      {
        billNumber: data.billNumber,
        billDate: new Date(data.billDate).toLocaleDateString("en-GB"),
        projectName: data.projectName,
        projectLocation: data.projectLocation,
        contractor: data.contractor,
        period: data.period,
        previousBillAmount: `₹${data.previousBillAmount.toLocaleString("en-IN")}`,
        currentBillAmount: `₹${data.currentBillAmount.toLocaleString("en-IN")}`,
        cumulativeAmount: `₹${data.cumulativeAmount.toLocaleString("en-IN")}`,
        securityDeposit: `₹${data.deductions.securityDeposit.toLocaleString("en-IN")}`,
        workContractTax: `₹${data.deductions.workContractTax.toLocaleString("en-IN")}`,
        incomeTax: `₹${data.deductions.incomeTax.toLocaleString("en-IN")}`,
        labourCess: `₹${data.deductions.labourCess.toLocaleString("en-IN")}`,
        otherDeduction: `₹${data.deductions.other.toLocaleString("en-IN")}`,
        totalDeductions: `₹${totalDeductions.toLocaleString("en-IN")}`,
        netPayable: `₹${data.netPayable.toLocaleString("en-IN")}`,
        createdBy: data.createdBy,
        approvedBy: data.approvedBy || "Pending Approval",
        printDate: new Date().toLocaleDateString("en-GB"),
      },
    ];

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
        ...barcodes,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating Abstract Bill PDF:", error);
    throw new Error("Failed to generate Abstract Bill PDF");
  }
}

export async function generateWorkEstimateDPRPDF(data: WorkEstimateDPRData): Promise<Uint8Array> {
  try {
    const template = await loadJSONTemplate("/templates/work-estimate-dpr.json");

    // Format work items table - PDFMe table expects array of arrays
    const workItemRows = data.workItems.map((item) => [
      item.slNo.toString(),
      item.description,
      item.unit,
      item.quantity.toFixed(2),
      item.rate.toLocaleString("en-IN"),
      item.amount.toLocaleString("en-IN"),
      item.category,
    ]);

    const inputs = [
      {
        projectName: data.projectName,
        projectLocation: data.projectLocation,
        activityCode: data.activityCode,
        estimateType: data.estimateType.replace("-", " ").toUpperCase(),
        contractor: data.contractor,
        engineer: data.engineer,
        dimensions: data.dimensions,
        workitemstable: JSON.stringify(workItemRows),
        subtotal: `₹${data.subtotal.toLocaleString("en-IN")}`,
        sgstPercent: data.sgstPercent.toString(),
        sgstAmount: `₹${data.sgstAmount.toLocaleString("en-IN")}`,
        cgstPercent: data.cgstPercent.toString(),
        cgstAmount: `₹${data.cgstAmount.toLocaleString("en-IN")}`,
        labourCessPercent: data.labourCessPercent.toString(),
        labourCessAmount: `₹${data.labourCessAmount.toLocaleString("en-IN")}`,
        contingencyPercent: data.contingencyPercent.toString(),
        contingencyAmount: `₹${data.contingencyAmount.toLocaleString("en-IN")}`,
        totalAmount: `₹${data.totalAmount.toLocaleString("en-IN")}`,
        sanctionedAmount: `₹${data.sanctionedAmount.toLocaleString("en-IN")}`,
        variance: `₹${Math.abs(data.variance).toLocaleString("en-IN")} ${data.variance >= 0 ? "+" : "-"}`,
        printDate: new Date().toLocaleDateString("en-GB"),
      },
    ];

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
        ...barcodes,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating Work Estimate DPR PDF:", error);
    throw new Error("Failed to generate Work Estimate DPR PDF");
  }
}

export async function generateProbableEstimatePDF(data: ProbableEstimateData): Promise<Uint8Array> {
  try {
    const template = await loadJSONTemplate("/templates/probable-estimate.json");

    const workItemRows = data.workItems.map((item) => [
      item.slNo.toString(),
      item.schedulePageNo || "",
      item.description,
      item.quantity.toFixed(2),
      item.unit,
      item.rate.toFixed(2),
      item.amount.toFixed(2),
    ]);

    const inputs = [
      {
        projectName: data.projectName,
        projectLocation: data.projectLocation,
        activityCode: data.activityCode,
        fund: data.fund,
        workitemstable: JSON.stringify(workItemRows),
        itemwiseTotal: data.itemwiseTotal.toFixed(2),
        gstPercent: data.gstPercent.toFixed(2),
        gstAmount: data.gstAmount.toFixed(2),
        costCivilWork: data.costCivilWork.toFixed(2),
        lwcAmount: data.lwcAmount.toFixed(2),
        costCivilWorkIncl: data.costCivilWorkIncl.toFixed(2),
        contingencyAmount: data.contingencyAmount.toFixed(2),
        grandTotal: data.grandTotal.toFixed(2),
        sayAmount: data.sayAmount.toFixed(2),
        amountInWords: numberToWords(data.sayAmount).toUpperCase(),
      },
    ];

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
        ...barcodes,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating Probable Estimate PDF:", error);
    throw new Error("Failed to generate Probable Estimate PDF");
  }
}

export async function generateBillAbstractFormPDF(data: BillAbstractFormData): Promise<Uint8Array> {
  try {
    const template = await loadJSONTemplate("/templates/bill-abstract-form.json");

    const workItemRows = data.workItems.map((item) => [
      item.slNo.toString(),
      item.items,
      item.mbNoAndPage,
      item.quantityExecuted.toFixed(2),
      item.unit,
      item.rate.toFixed(2),
      item.amount.toFixed(2),
      item.remarks || "",
    ]);

    const inputs = [
      {
        billType: data.billType,
        projectName: data.projectName,
        projectLocation: data.projectLocation,
        workitemstable: JSON.stringify(workItemRows),
        itemwiseTotal: data.itemwiseTotal.toFixed(2),
        contractualPercent: data.contractualPercent.toFixed(3),
        contractualDeduction: data.contractualDeduction.toFixed(2),
        actualValue: data.actualValue.toFixed(2),
        sayAmount: data.sayAmount.toFixed(2),
        cgstPercent: data.cgstPercent.toFixed(2),
        cgstAmount: data.cgstAmount.toFixed(2),
        sgstPercent: data.sgstPercent.toFixed(2),
        sgstAmount: data.sgstAmount.toFixed(2),
        subTotal: data.subTotal.toFixed(2),
        lwcPercent: data.lwcPercent.toFixed(2),
        lwcAmount: data.lwcAmount.toFixed(2),
        grossBillAmount: data.grossBillAmount.toFixed(2),
        mbNumber: data.mbNumber,
        mbPages: data.mbPages,
        printDate: new Date().toLocaleDateString("en-GB"),
      },
    ];

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
        ...barcodes,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating Bill Abstract Form PDF:", error);
    throw new Error("Failed to generate Bill Abstract Form PDF");
  }
}

export async function generateFinalBillPaymentPDF(data: FinalBillPaymentData): Promise<Uint8Array> {
  try {
    const template = await loadJSONTemplate("/templates/final-bill-payment.json");

    const inputs = [
      {
        projectName: data.projectName,
        activityCode: data.activityCode,
        fund: data.fund,
        estimatedAmount: data.estimatedAmount,
        nitNumber: data.nitNumber,
        nitDate: data.nitDate,
        woMemoNumber: data.woMemoNumber,
        woDate: data.woDate,
        agreementNumber: data.agreementNumber,
        agreementDate: data.agreementDate,
        commencementDate: data.commencementDate,
        completionDate: data.completionDate,
        finalMeasurementDate: data.finalMeasurementDate,
        contractorName: data.contractorName,
        contractorAddress: data.contractorAddress,
        grossBillAmount: data.grossBillAmount,
        incomeTaxPercent: data.incomeTaxPercent.toFixed(2),
        incomeTaxAmount: data.incomeTaxAmount,
        gstTdsPercent: data.gstTdsPercent.toFixed(2),
        gstTdsAmount: data.gstTdsAmount,
        labourWelfareCessPercent: data.labourWelfareCessPercent.toFixed(2),
        labourWelfareCessAmount: data.labourWelfareCessAmount,
        securityDepositPercent: data.securityDepositPercent.toFixed(2),
        securityDepositAmount: data.securityDepositAmount,
        totalDeduction: data.totalDeduction,
        netPayableAmount: data.netPayableAmount,
        netPayableInWords: data.netPayableInWords,
        voucherNumber: data.voucherNumber || "",
        voucherDate: data.voucherDate || "",
        cashBookVoucher: data.cashBookVoucher || "",
        cashBookDate: data.cashBookDate || "",
        cashBookPage: data.cashBookPage || "",
        printDate: new Date().toLocaleDateString("en-GB"),
      },
    ];

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
        ...barcodes,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating Final Bill Payment PDF:", error);
    throw new Error("Failed to generate Final Bill Payment PDF");
  }
}

// Helper function to download PDF
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

