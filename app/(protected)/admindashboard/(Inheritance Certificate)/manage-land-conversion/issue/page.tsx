"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateLandConversionPDF, type LandConversionData } from "../actions";

interface IssueItem {
  id: string;
  applicationNo: string;
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
  applicationDate?: string;
  status: "APPROVED" | "ISSUED";
}

export default function IssueNOCPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<IssueItem[]>([]);
  const [selected, setSelected] = useState<IssueItem | null>(null);
  const [memoNumber, setMemoNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [certificateNo, setCertificateNo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setItems([
      {
        id: "n1",
        applicationNo: "LC-2025-0001",
        applicantName: "Rahul Das",
        applicantAddress: "Vill-Kismatdapat, PO-Trimohini, PS-Hili, Dakshin Dinajpur",
        applicantPhone: "9876543210",
        applicantEmail: "rahul@example.com",
        khatianNo: "1234",
        plotNo: "56",
        mouza: "Beltala",
        jlNo: "12",
        policeStation: "Hili",
        block: "Hili Dev.",
        district: "Dakshin Dinajpur",
        state: "West Bengal",
        landAreaDec: "5.5",
        presentLandUse: "agriculture",
        proposedLandUse: "residential",
        applicationDate: new Date().toISOString(),
        status: "APPROVED",
      },
      {
        id: "n2",
        applicationNo: "LC-2025-0002",
        applicantName: "Anita Roy",
        applicantAddress: "Vill-Madhyamgram, PO-Madhyamgram, PS-Madhyamgram, North 24 Parganas",
        applicantPhone: "9876543211",
        applicantEmail: "anita@example.com",
        khatianNo: "9876",
        plotNo: "12",
        mouza: "Madhyamgram",
        jlNo: "45",
        policeStation: "Madhyamgram",
        block: "Madhyamgram",
        district: "North 24 Parganas",
        state: "West Bengal",
        landAreaDec: "3.2",
        presentLandUse: "agriculture",
        proposedLandUse: "commercial",
        applicationDate: new Date().toISOString(),
        status: "APPROVED",
      },
    ]);
  }, []);

  useEffect(() => {
    if (selected && !certificateNo) {
      setCertificateNo(selected.applicationNo);
    }
  }, [selected, certificateNo]);

  const handleGeneratePDF = async () => {
    if (!selected || !memoNumber || !issueDate || !certificateNo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Memo Number, Issue Date, Certificate No)",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdfData: LandConversionData = {
        applicationNo: selected.applicationNo,
        certificateNo: certificateNo,
        memoNumber: memoNumber,
        issueDate: issueDate,
        applicantName: selected.applicantName,
        applicantAddress: selected.applicantAddress,
        applicantPhone: selected.applicantPhone,
        applicantEmail: selected.applicantEmail,
        khatianNo: selected.khatianNo,
        plotNo: selected.plotNo,
        mouza: selected.mouza,
        jlNo: selected.jlNo,
        policeStation: selected.policeStation,
        block: selected.block,
        district: selected.district,
        state: selected.state,
        landAreaDec: selected.landAreaDec,
        presentLandUse: selected.presentLandUse,
        proposedLandUse: selected.proposedLandUse,
        applicationDate: selected.applicationDate,
      };

      const pdf = await generateLandConversionPDF(pdfData);

      // Handle PDF buffer
      const pdfBuffer = pdf instanceof Uint8Array ? pdf : (pdf as any).buffer;
      const buffer =
        pdfBuffer instanceof ArrayBuffer
          ? new Uint8Array(pdfBuffer)
          : pdfBuffer instanceof Uint8Array
          ? pdfBuffer
          : new Uint8Array(pdfBuffer as any);

      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Land-Conversion-Certificate-${certificateNo}-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Certificate PDF generated successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const issueNoc = async () => {
    if (!selected || !memoNumber || !issueDate || !certificateNo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsIssuing(true);
    try {
      // First generate the PDF
      await handleGeneratePDF();

      // Then mark as issued (in a real app, this would update the database)
      toast({
        title: "NOC Issued",
        description: `NOC issued for ${selected.applicationNo}`,
      });

      // Update the item status
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...item, status: "ISSUED" as const } : item
        )
      );

      setMemoNumber("");
      setIssueDate("");
      setCertificateNo("");
      setSelected(null);
    } catch (error) {
      console.error("Error issuing NOC:", error);
      toast({
        title: "Error",
        description: "Failed to issue NOC. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> NOC Issuance</CardTitle>
          <CardDescription>Generate and issue conversion NOC.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {items.map((item)=> (
            <Card key={item.id} className={`cursor-pointer ${selected?.id===item.id?"border-blue-500 bg-blue-50":"hover:bg-gray-50"}`} onClick={()=>setSelected(item)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.applicationNo}</CardTitle>
                <CardDescription>{item.applicantName}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>{item.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Issue NOC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected ? (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="certificateNo">Certificate No *</Label>
                        <Input
                          id="certificateNo"
                          value={certificateNo}
                          onChange={(e) => setCertificateNo(e.target.value)}
                          placeholder="e.g., LC-2025-0001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="memoNumber">Memo Number *</Label>
                        <Input
                          id="memoNumber"
                          value={memoNumber}
                          onChange={(e) => setMemoNumber(e.target.value)}
                          placeholder="e.g., 123/LC/2025"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="issueDate">Issue Date *</Label>
                      <Input
                        id="issueDate"
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                      />
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Label className="text-sm font-semibold">Application Details</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Applicant:</span>{" "}
                          <span className="font-medium">{selected.applicantName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Application No:</span>{" "}
                          <span className="font-medium">{selected.applicationNo}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Khatian/Plot:</span>{" "}
                          <span className="font-medium">
                            {selected.khatianNo}/{selected.plotNo}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mouza:</span>{" "}
                          <span className="font-medium">{selected.mouza}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Land Area:</span>{" "}
                          <span className="font-medium">{selected.landAreaDec} Decimal</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversion:</span>{" "}
                          <span className="font-medium">
                            {selected.presentLandUse} → {selected.proposedLandUse}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={issueNoc} disabled={isIssuing || isGenerating}>
                      {isIssuing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Issue NOC
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGeneratePDF}
                      disabled={isGenerating || isIssuing}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Generate PDF
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">Select an approved application to issue NOC.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
