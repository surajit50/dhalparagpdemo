import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Download, MapPin, IndianRupee } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/* =======================
   Tender Status Enum
======================= */
enum TenderStatus {
  publish = "publish",
  published = "published",
  ToBeOpened = "ToBeOpened",
  TechnicalBidOpening = "TechnicalBidOpening",
  TechnicalEvaluation = "TechnicalEvaluation",
  FinancialBidOpening = "FinancialBidOpening",
  FinancialEvaluation = "FinancialEvaluation",
  AOC = "AOC",
  Retender = "Retender",
  Cancelled = "Cancelled",
}

/* =======================
   Status Variant Mapping
======================= */
const tenderStatusVariantMap: Record<TenderStatus, BadgeProps["variant"]> = {
  publish: "outline",
  published: "default",
  ToBeOpened: "secondary",
  TechnicalBidOpening: "secondary",
  TechnicalEvaluation: "secondary",
  FinancialBidOpening: "secondary",
  FinancialEvaluation: "secondary",
  AOC: "success",
  Retender: "destructive",
  Cancelled: "destructive",
};

/* =======================
   Status Label Mapping
======================= */
const tenderStatusLabelMap: Record<TenderStatus, string> = {
  publish: "Publish Initiated",
  published: "Published",
  ToBeOpened: "To Be Opened",
  TechnicalBidOpening: "Technical Bid Opening",
  TechnicalEvaluation: "Technical Evaluation",
  FinancialBidOpening: "Financial Bid Opening",
  FinancialEvaluation: "Financial Evaluation",
  AOC: "AOC Issued",
  Retender: "Re-Tender",
  Cancelled: "Cancelled",
};

/* =======================
   IST Date Time Formatter
======================= */
const formatDateTimeIST = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* =======================
   IST Time Only Formatter
======================= */
const formatTimeIST = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default async function NITDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const nit = await db.nitDetails.findUnique({
    where: { id },
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  if (!nit) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 md:py-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">NIT Details</h1>
            <p className="text-muted-foreground mt-1">Memo Number: {nit.memoNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={nit.isPublished ? "default" : "outline"} 
              className="px-3 py-1"
            >
              {nit.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge 
              variant={nit.isSupply ? "default" : "outline"} 
              className="px-3 py-1"
            >
              {nit.isSupply ? "Supply" : "Works"}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download NIT
            </Button>
          </div>
        </div>
        <Separator />
      </div>

      {/* Main Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Basic Information Card */}
        <Card className="lg:col-span-1 border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Memo Number</p>
              <p className="font-medium">{nit.memoNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Memo Date</p>
                <p className="font-medium">{formatDateTimeIST(nit.memoDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Publishing Date</p>
                <p className="font-medium">{formatDateTimeIST(nit.publishingDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bid Validity</p>
              <p className="font-medium">{nit.bidValidity} days</p>
            </div>
          </CardContent>
        </Card>

        {/* Document Download Card */}
        <Card className="lg:col-span-1 border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-green-600" />
              Document Download
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Download Period</p>
              <p className="font-medium">{formatDateTimeIST(nit.documentDownloadFrom)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{formatTimeIST(nit.startTime)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{formatTimeIST(nit.endTime)}</p>
                </div>
              </div>
            </div>
            <Button className="w-full mt-2" variant="default">
              <Download className="h-4 w-4 mr-2" />
              Download Documents
            </Button>
          </CardContent>
        </Card>

        {/* Bid Opening Card */}
        <Card className="lg:col-span-1 border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
              Bid Opening
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Technical Bid Opening</p>
              <p className="font-medium">{formatDateTimeIST(nit.technicalBidOpeningDate)}</p>
            </div>
            {nit.financialBidOpeningDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Financial Bid Opening</p>
                <p className="font-medium">{formatDateTimeIST(nit.financialBidOpeningDate)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Place of Opening</p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="font-medium">{nit.placeOfOpeningBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =======================
           Work Details Section
      ======================= */}
      {nit.WorksDetail?.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold">Work Details</h2>
            <p className="text-muted-foreground mt-1">
              Total {nit.WorksDetail.length} work{nit.WorksDetail.length > 1 ? 's' : ''} associated with this NIT
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nit.WorksDetail.map((work, idx) => (
              <Card key={work.id} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {/* Work Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {work.ApprovedActionPlanDetails?.activityCode || "No Activity Code"}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {work.ApprovedActionPlanDetails?.activityName || "No Activity Name"}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={tenderStatusVariantMap[work.tenderStatus as TenderStatus]}
                      className="px-3 py-1"
                    >
                      {tenderStatusLabelMap[work.tenderStatus as TenderStatus]}
                    </Badge>
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Estimate Cost</p>
                      </div>
                      <p className="font-bold text-lg">
                        ₹{work.finalEstimateAmount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Form Fee</p>
                      </div>
                      <p className="font-bold text-lg">
                        ₹{work.participationFee?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Theme</p>
                        <p className="font-medium">{work.ApprovedActionPlanDetails?.themeName || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Financial Year</p>
                        <p className="font-medium">{work.ApprovedActionPlanDetails?.financialYear || "-"}</p>
                      </div>
                    </div>

                    {work.ApprovedActionPlanDetails?.activityDescription && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm line-clamp-2">
                          {work.ApprovedActionPlanDetails.activityDescription}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      View Work Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
