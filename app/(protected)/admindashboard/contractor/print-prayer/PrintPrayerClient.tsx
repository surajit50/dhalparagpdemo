"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import {
  Building,
  FileText,
  AlertCircle,
  FileCheck,
  Shield,
  Receipt,
  Info,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gpcode } from "@/constants/gpinfor";
import PrintPrayerDocument from "./PrintPrayerDocument";

/* ================= TYPES ================= */

type WorkDetail = {
  id: string;
  workslno: number;
  completionDate: Date | null;
  finalEstimateAmount: number;
  paymentDetails: Array<{
    securityDeposit: {
      securityDepositAmt: number;
    } | null;
  }>;
  nitDetails: {
    memoNumber: number;
    memoDate: Date | string;
  };
  ApprovedActionPlanDetails: {
    activityDescription: string;
  };
  AwardofContract: {
    workodermenonumber: string | null;
    workordeermemodate: Date | string | null;
    workorderdetails: Array<{
      Bidagency: {
        agencydetails: {
          name: string;
          contactDetails: string | null;
        } | null;
      } | null;
    }>;
  } | null;
};

type PrayerType =
  | "BILL_PRAYER"
  | "EMD_REFUND"
  | "SECURITY_MONEY_RELEASE"
  | "OTHER_PRAYER";

const PRAYER_TYPES = [
  {
    value: "BILL_PRAYER",
    label: "Bill Prayer",
    icon: Receipt,
    description: "Prayer for bill payment",
  },
  {
    value: "SECURITY_MONEY_RELEASE",
    label: "Security Money Release",
    icon: Shield,
    description: "Prayer for security money",
  },
  {
    value: "EMD_REFUND",
    label: "EMD Refund",
    icon: FileCheck,
    description: "Prayer for earnest money deposit refund",
  },
  {
    value: "OTHER_PRAYER",
    label: "Other Prayer",
    icon: FileText,
    description: "Coming soon",
  },
];

interface PrintPrayerClientProps {
  worklist: WorkDetail[];
  groupedByAgency: Record<string, WorkDetail[]>;
  agencyNames: string[];
}

/* ================= COMPONENT ================= */

export default function PrintPrayerClient({
  groupedByAgency,
  agencyNames,
}: PrintPrayerClientProps) {
  const [selectedPrayerType, setSelectedPrayerType] =
    useState<PrayerType>("BILL_PRAYER");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [open, setOpen] = useState(false);

  const selectedWorks = selectedAgency
    ? groupedByAgency[selectedAgency] || []
    : [];

  const isPrayerTypeAvailable =
    selectedPrayerType === "BILL_PRAYER" ||
    selectedPrayerType === "SECURITY_MONEY_RELEASE" ||
    selectedPrayerType === "EMD_REFUND";

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Print Prayer Documents
          </CardTitle>
          <CardDescription className="text-slate-200">
            Select prayer type and contractor to generate prayer
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* PRAYER TYPE */}
          <div>
            <Label className="font-semibold text-slate-700 mb-2 block">
              Prayer Type
            </Label>

            <Select
              value={selectedPrayerType}
              onValueChange={(v) => setSelectedPrayerType(v as PrayerType)}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select prayer type" />
              </SelectTrigger>

              <SelectContent>
                {PRAYER_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-slate-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {!isPrayerTypeAvailable && (
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md">
                <Info className="h-4 w-4" />
                This prayer type will be available soon.
              </div>
            )}
          </div>

          {/* CONTRACTOR */}
          <div>
            <Label className="font-semibold text-slate-700 mb-2 block">
              Contractor / Agency
            </Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full max-w-md justify-between"
                  disabled={!isPrayerTypeAvailable}
                >
                  {selectedAgency || "Select contractor"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 max-w-md">
                <Command>
                  <CommandInput placeholder="Search contractor..." />
                  <CommandList>
                    <CommandEmpty>No contractor found</CommandEmpty>
                    <CommandGroup>
                      {agencyNames.map((agency) => (
                        <CommandItem
                          key={agency}
                          value={agency}
                          onSelect={() => {
                            setSelectedAgency(agency);
                            setOpen(false);
                          }}
                        >
                          <Building className="mr-2 h-4 w-4" />
                          {agency}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedAgency && (
              <p className="text-xs text-slate-500 mt-1">
                Total works:{" "}
                <span className="font-semibold">{selectedWorks.length}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* EMPTY STATE */}
      {!selectedAgency && isPrayerTypeAvailable && (
        <Card className="border border-dashed py-14 text-center">
          <Building className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="font-medium text-slate-600">
            Please select a contractor to continue
          </p>
        </Card>
      )}

      {/* WORK TABLE */}
      {selectedAgency && isPrayerTypeAvailable && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Awarded Works – {selectedAgency}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead>#</TableHead>
                  <TableHead>Work Description</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {selectedWorks.map((work, i) => {
                  const nitDate = new Date(work.nitDetails.memoDate);
                  const woDate = work.AwardofContract?.workordeermemodate
                    ? new Date(work.AwardofContract.workordeermemodate)
                    : null;

                  const agency =
                    work.AwardofContract?.workorderdetails?.[0]?.Bidagency
                      ?.agencydetails;

                  return (
                    <TableRow key={work.id} className="hover:bg-slate-50">
                      <TableCell>{i + 1}</TableCell>

                      <TableCell>
                        <p className="font-medium">
                          {work.ApprovedActionPlanDetails.activityDescription}
                        </p>
                        <p className="text-xs text-slate-500">
                          Sl No: {work.workslno}
                        </p>
                      </TableCell>

                      <TableCell>
                        <ShowNitDetails
                          nitdetails={work.nitDetails.memoNumber}
                          memoDate={nitDate}
                          workslno={work.workslno}
                        />
                      </TableCell>

                      <TableCell>
                        {woDate ? (
                          <Badge variant="outline">
                            {work.AwardofContract?.workodermenonumber}/{gpcode}/
                            {woDate.getFullYear()}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Missing</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {agency && woDate ? (
                          <PrintPrayerDocument
                            completionDate={work.completionDate}
                            securityDepositAmount={
                              work.paymentDetails[0]?.securityDeposit
                                ?.securityDepositAmt ?? null
                            }
                            emdAmount={Math.round(
                              (work.finalEstimateAmount * 2) / 100
                            )}
                            prayerType={selectedPrayerType}
                            workName={
                              work.ApprovedActionPlanDetails.activityDescription
                            }
                            nitNumber={`${
                              work.nitDetails.memoNumber
                            }/DGP/${nitDate.getFullYear()}`}
                            nitDate={nitDate}
                            workSlNo={work.workslno.toString()}
                            contractorName={agency.name}
                            contractorAddress={agency.contactDetails || ""}
                            workOrderNumber={`${
                              work.AwardofContract?.workodermenonumber
                            }/${gpcode}/${woDate.getFullYear()}`}
                            workOrderDate={woDate}
                          />
                        ) : (
                          <Badge variant="secondary">Incomplete</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* PRAYER NOT AVAILABLE */}
      {selectedAgency && !isPrayerTypeAvailable && (
        <Card className="border border-dashed border-amber-300 py-14 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600 mb-2" />
          <p className="font-medium text-amber-700">
            Selected prayer type is not available yet
          </p>
        </Card>
      )}
    </div>
  );
}
