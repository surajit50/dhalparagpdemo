"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

import { formatDate } from "@/utils/utils";
import { gpname } from "@/constants/gpinfor";
import { generatePDF } from "../pdfgenerator";

const templatePath = "/templates/printprayer.json";

interface PrintPrayerDocumentProps {
  workName: string;
  nitNumber: string;
  nitDate: Date | string;
  workSlNo: number | string;
  contractorName: string;
  contractorAddress: string;
  workOrderNumber: string;
  workOrderDate: Date | string;
}

export default function PrintPrayerDocument({
  workName,
  nitNumber,
  nitDate,
  workSlNo,
  contractorName,
  contractorAddress,
  workOrderNumber,
  workOrderDate,
}: PrintPrayerDocumentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Format dates
      const nitDateObj =
        typeof nitDate === "string" ? new Date(nitDate) : nitDate;
      const workOrderDateObj =
        typeof workOrderDate === "string"
          ? new Date(workOrderDate)
          : workOrderDate;

      const nitDateFormatted = formatDate(nitDateObj);
      const workOrderDateFormatted = formatDate(workOrderDateObj);
      const currentDateFormatted = formatDate(new Date());

      // Format NIT details
      const nitDetails = `${nitNumber}/${nitDateObj.getFullYear()}`;
      const paragraph2 = `in NIT No ${nitDetails} dated ${nitDateFormatted} for Work Order No ${workOrderNumber} dated ${workOrderDateFormatted} (Work Sl. No: ${workSlNo.toString()}) for the work "${workName}".`;
      // Prepare input data
      const inputs = [
        {
          gpname: gpname,
          nitDetails: nitDetails,
          nitDate: nitDateFormatted,
          workOrderNumber: workOrderNumber,
          workOrderDate: workOrderDateFormatted,
          workSlNo: workSlNo.toString(),
          workName: workName,
          contractorName: contractorName,
          contractorAddress: contractorAddress || "N/A",
          contractor_name: contractorName,
          contractor_address: contractorAddress || "N/A",
          paragraph2: paragraph2,
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);

      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workOrderNumber}-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
      toast({
        title: "Success",
        description: "Print Prayer PDF generated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      let errorMessage = "An unknown error occurred while generating the PDF.";

      if (error instanceof Error) {
        if (error.message.includes("value.split is not a function")) {
          errorMessage =
            "Error processing text data. Please check the input values and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
