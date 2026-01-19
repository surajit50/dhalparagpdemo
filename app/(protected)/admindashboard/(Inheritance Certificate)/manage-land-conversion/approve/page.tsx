"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ApprovalItem {
  id: string;
  applicantName: string;
  applicantAddress: string;
  applicationNo: string;
  khatianNo: string;
  plotNo: string;
  mouza: string;
  landAreaDec: string;
  presentLandUse: string;
  proposedLandUse: string;
  inspectionRemarks?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function ApprovalWorkflowPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<ApprovalItem[]>([]);
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    setQueue([
      {
        id: "a1",
        applicantName: "Rahul Das",
        applicantAddress: "Vill-Kismatdapat, PO-Trimohini, PS-Hili, Dakshin Dinajpur",
        applicationNo: "LC-2025-0001",
        khatianNo: "1234",
        plotNo: "56",
        mouza: "Beltala",
        landAreaDec: "5.5",
        presentLandUse: "agriculture",
        proposedLandUse: "residential",
        inspectionRemarks: "Site inspection completed. All documents verified. No objections found.",
        status: "PENDING",
      },
      {
        id: "a2",
        applicantName: "Anita Roy",
        applicantAddress: "Vill-Madhyamgram, PO-Madhyamgram, PS-Madhyamgram, North 24 Parganas",
        applicationNo: "LC-2025-0002",
        khatianNo: "9876",
        plotNo: "12",
        mouza: "Madhyamgram",
        landAreaDec: "3.2",
        presentLandUse: "agriculture",
        proposedLandUse: "commercial",
        inspectionRemarks: "Site inspection completed. Documents verified. Ready for approval.",
        status: "PENDING",
      },
    ]);
  }, []);

  const takeAction = (approve: boolean) => {
    if (!selected) return;
    toast({
      title: approve ? "Approved" : "Rejected",
      description: approve ? "Application moved to NOC issuance." : "Application rejected.",
    });
    setComments("");
    setSelected(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5"/> Approval Workflow</CardTitle>
          <CardDescription>Review inspection reports and decide.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {queue.map((item)=> (
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
              <CardTitle>Decision Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected ? (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Application No</Label>
                        <p className="font-medium">{selected.applicationNo}</p>
                      </div>
                      <div>
                        <Label>Applicant</Label>
                        <p className="font-medium">{selected.applicantName}</p>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <p className="text-xs">{selected.applicantAddress}</p>
                      </div>
                      <div>
                        <Label>Land Details</Label>
                        <p className="text-xs">Khatian: {selected.khatianNo}, Plot: {selected.plotNo}, Mouza: {selected.mouza}</p>
                      </div>
                      <div>
                        <Label>Land Area</Label>
                        <p className="font-medium">{selected.landAreaDec} Decimal</p>
                      </div>
                      <div>
                        <Label>Conversion</Label>
                        <p className="font-medium capitalize">{selected.presentLandUse} → {selected.proposedLandUse}</p>
                      </div>
                    </div>
                    {selected.inspectionRemarks && (
                      <div>
                        <Label>Inspection Remarks</Label>
                        <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">{selected.inspectionRemarks}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea id="comments" rows={4} value={comments} onChange={(e)=>setComments(e.target.value)} placeholder="Add approval/rejection comments" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={()=>takeAction(true)}><CheckCircle className="h-4 w-4 mr-2"/> Approve</Button>
                    <Button variant="destructive" onClick={()=>takeAction(false)}><XCircle className="h-4 w-4 mr-2"/> Reject</Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">Select an application from the list.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
