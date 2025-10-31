"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer } from "lucide-react";
import { generatePDF } from "../pdfgeneratortwo";
import { fetchnitdetailsType } from "@/types/nitDetails";

import { formatDate, formatDateTimeCustom } from "@/utils/utils";
import { tenderForwardedTo } from "@/constants/tenderterm";

interface TenderTerm {
  id: string;
  category: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const templatePath = "/templates/nitsamplecopy.json";

export const NITCopy = ({
  nitdetails,
}: {
  nitdetails: fetchnitdetailsType;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tenderTerms, setTenderTerms] = useState<TenderTerm[]>([]);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const [templateTerms, setTemplateTerms] = useState<string[]>([]);

  // Fetch global tender terms and any selected templates for this NIT
  useEffect(() => {
    const run = async () => {
      try {
        const [termsRes, tplRes] = await Promise.all([
          fetch("/api/tender-terms"),
          (nitdetails as any).termsTemplateIds?.length
            ? fetch(
                `/api/tender-term-templates?ids=${(
                  nitdetails as any
                ).termsTemplateIds.join(",")}`
              )
            : Promise.resolve(null as any),
        ]);
        if (termsRes?.ok) {
          setTenderTerms(await termsRes.json());
        }
        if (tplRes && tplRes.ok) {
          const tpls = await tplRes.json();
          setTemplateTerms((tpls as any[]).map((t) => String(t.content)));
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoadingTerms(false);
      }
    };
    run();
  }, [nitdetails]);

  // Helper function to get terms by category
  const getTermsByCategory = (category: string) => {
    return tenderTerms
      .filter((term) => term.category === category && term.isActive)
      .sort((a, b) => a.order - b.order)
      .map((term, i) => [`${i + 1}. ${term.content}`]);
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const workItems = nitdetails.WorksDetail.map((work, i) => [
        (i + 1).toString(),
        `${work.ApprovedActionPlanDetails?.activityDescription}-${work.ApprovedActionPlanDetails?.activityCode}`,
        work.ApprovedActionPlanDetails?.schemeName || "N/A",
        work.finalEstimateAmount.toFixed(2),
        work.participationFee.toFixed(2),
        (work.finalEstimateAmount * 0.02).toFixed(2),
        (work.finalEstimateAmount * 0.6).toFixed(2),
        "30 days",
      ]);

      const input = {
        field4: `(E-Procurement- ${nitdetails.nitCount})`,
        memono1: `Memo No: ${
          nitdetails.memoNumber
        }/DGP/${nitdetails.memoDate.getFullYear()}`,
        memono2: `Memo No: ${
          nitdetails.memoNumber
        }/DGP/${nitdetails.memoDate.getFullYear()}`,
        memoDate1: `Date: ${formatDate(nitdetails.memoDate)}`,
        memoDate2: `Date: ${formatDate(nitdetails.memoDate)}`,
        worklist: workItems,
        forwat: tenderForwardedTo.map((term, i) => [`${i + 1}. ${term}`]) || [],
        elegible: getTermsByCategory("ELIGIBLE"),
        qualify: getTermsByCategory("QUALIFICATION_CRITERIA"),
        termcondition: [
          ...getTermsByCategory("TERMS_CONDITIONS"),
          ...templateTerms.map((c, i) => [`${i + 1}. ${c}`]),
        ],
        timetable: [
          [
            "Tender Publishing Date",
            formatDateTimeCustom(nitdetails.publishingDate),
          ],
          [
            "Bid Submission Start Date",
            formatDateTimeCustom(nitdetails.startTime),
          ],
          ["Bid Submission End Date", formatDateTimeCustom(nitdetails.endTime)],
          [
            "Technical Bid Opening Date",
            formatDateTimeCustom(nitdetails.technicalBidOpeningDate),
          ],
          ["Financial Bid Opening Date", "To be Notified later on"],
          [
            "Place of Opening Bids",
            "Office of The Pradhan, DHALPARA Gram Panchayat.",
          ],
          ["Validity of Bids", "120 days"],
        ],
      };

      const pdf = await generatePDF(templatePath, [input]);
      const blob = new Blob([new Uint8Array(pdf.buffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NIT_${nitdetails.nitCount}_${formatDate(
        new Date()
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "NIT Copy PDF generated successfully",
      });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
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
        disabled={isGenerating || isLoadingTerms}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        aria-busy={isGenerating || isLoadingTerms}
        title={isLoadingTerms ? "Loading terms..." : "Generate NIT PDF"}
      >
        {isGenerating || isLoadingTerms ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
