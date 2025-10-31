"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { landApplicationSchema } from "@/schema/land-conversion";
import { createLandApplication } from "@/action/land-conversion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader as DialogHdr,
  DialogTitle as DialogTtl,
  DialogTrigger,
} from "@/components/ui/dialog";
import LandNOC from "@/components/PrintTemplet/LandNOC";

type LandApplicationFormValues = z.infer<typeof landApplicationSchema>;

type LandRow = {
  mouza: string;
  jlNo: string;
  khatianNumber: string;
  plotNumber: string;
  areaValue: string;
  areaUnit: "sqm" | "acre";
  classification: string;
  proposedUse: string;
};

export function LandConversionForm() {
  const [isPending, startTransition] = useTransition();
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState<string>(
    "Sri Ferdaus Ali Dewan"
  );

  const [landRecords, setLandRecords] = useState<LandRow[]>([
    {
      mouza: "Kismatdapat",
      jlNo: "112",
      khatianNumber: "256",
      plotNumber: "345",
      areaValue: "0.12",
      areaUnit: "acre",
      classification: "Danga (Agricultural)",
      proposedUse: "Residential",
    },
    {
      mouza: "Kismatdapat",
      jlNo: "112",
      khatianNumber: "256",
      plotNumber: "346",
      areaValue: "0.15",
      areaUnit: "acre",
      classification: "Danga (Agricultural)",
      proposedUse: "Residential",
    },
    {
      mouza: "Kismatdapat",
      jlNo: "112",
      khatianNumber: "256",
      plotNumber: "350",
      areaValue: "0.20",
      areaUnit: "acre",
      classification: "Bastu (Vacant Land)",
      proposedUse: "Residential",
    },
  ]);

  const addLandRow = () =>
    setLandRecords((rows) => [
      ...rows,
      {
        mouza: "",
        jlNo: "",
        khatianNumber: "",
        plotNumber: "",
        areaValue: "",
        areaUnit: "sqm",
        classification: "Agricultural",
        proposedUse: "Residential",
      },
    ]);

  const removeLandRow = (index: number) =>
    setLandRecords((rows) => rows.filter((_, i) => i !== index));

  const form = useForm<LandApplicationFormValues>({
    resolver: zodResolver(landApplicationSchema),
    defaultValues: {
      applicantName: "Sri Taimur Ali Dewan",
      applicantMobile: "",
      address:
        "Village – Kismatdapat, P.O. Trimohini, P.S. Hili, Dist. Dakshin Dinajpur",
      // These will be populated from the first land record on submission
      plotNumber: "",
      khatianNumber: "",
      mouza: "",
      jlNo: "",
      landUseCurrent: "",
      landUseProposed: "",
      areaSqm: 0,
    },
  });

  const onSubmit = (values: LandApplicationFormValues) => {
    // Validate at least one land record exists
    if (landRecords.length === 0) {
      toast.error("Please add at least one land record");
      return;
    }

    // Validate all land records
    for (let i = 0; i < landRecords.length; i++) {
      const record = landRecords[i];
      if (
        !record.mouza ||
        !record.jlNo ||
        !record.khatianNumber ||
        !record.plotNumber ||
        !record.areaValue ||
        !record.classification ||
        !record.proposedUse
      ) {
        toast.error(`Please fill all fields in record ${i + 1}`);
        return;
      }

      const areaNum = Number(record.areaValue);
      if (isNaN(areaNum) || areaNum <= 0) {
        toast.error(`Please enter a valid area in record ${i + 1}`);
        return;
      }
    }

    // Use first land record for the main application fields
    const firstRecord = landRecords[0];

    // Convert area to sqm for validation
    const areaNum = Number(firstRecord.areaValue);
    const areaSqm =
      firstRecord.areaUnit === "acre" ? areaNum * 4046.8564224 : areaNum;

    const payload: LandApplicationFormValues = {
      ...values,
      mouza: firstRecord.mouza,
      jlNo: firstRecord.jlNo,
      khatianNumber: firstRecord.khatianNumber,
      plotNumber: firstRecord.plotNumber,
      landUseCurrent: firstRecord.classification,
      landUseProposed: firstRecord.proposedUse,
      areaSqm,
    };

    startTransition(async () => {
      try {
        const data = await createLandApplication(payload);
        toast.success(`Application submitted. No: ${data.applicationNo}`);
        form.reset();
        setLandRecords([
          {
            mouza: "",
            jlNo: "",
            khatianNumber: "",
            plotNumber: "",
            areaValue: "",
            areaUnit: "sqm",
            classification: "Agricultural",
            proposedUse: "Residential",
          },
        ]);
      } catch (err: unknown) {
        toast.error("Failed to submit application");
        console.error(err);
      }
    });
  };

  // Calculate total area
  const totalArea = useMemo(() => {
    return landRecords.reduce((total, record) => {
      const areaNum = Number(record.areaValue) || 0;
      if (record.areaUnit === "acre") {
        return total + areaNum;
      } else {
        return total + areaNum / 4046.8564224; // Convert sqm to acres
      }
    }, 0);
  }, [landRecords]);

  return (
    <Card className=" w-full mx-auto">
      <CardHeader>
        <CardTitle>Land Conversion Application</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Fill applicant details and add one or more land records for conversion
          request.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Applicant Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Father/Husband Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter father/husband name"
                      value={fatherOrHusbandName}
                      onChange={(e) => setFatherOrHusbandName(e.target.value)}
                    />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="applicantMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10-digit mobile number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {[
                  `Name: ${form.getValues("applicantName") || ""}`,
                  fatherOrHusbandName && `S/o: ${fatherOrHusbandName}`,
                  form.getValues("address"),
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </div>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="House no, street, village/town"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multiple Land Records */}
            <Card className="border-l-4 border-amber-500">
              <CardHeader className="bg-amber-50 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-800">Land Records</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-amber-700">
                      Total Area: {totalArea.toFixed(2)} acres
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLandRow}
                      className="bg-white"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Row
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {landRecords.map((row, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-md border border-amber-200 bg-amber-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-amber-800">
                        Record #{index + 1}
                      </div>
                      {landRecords.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLandRow(index)}
                        >
                          <Trash2 className="h-4 w-4 text-amber-700" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <FormLabel>Mouza *</FormLabel>
                        <Input
                          placeholder="Mouza name"
                          value={row.mouza}
                          onChange={(e) =>
                            setLandRecords((r) => {
                              const c = [...r];
                              c[index] = { ...c[index], mouza: e.target.value };
                              return c;
                            })
                          }
                        />
                      </div>

                      <div>
                        <FormLabel>J.L. No. *</FormLabel>
                        <Input
                          placeholder="JL number"
                          value={row.jlNo}
                          onChange={(e) =>
                            setLandRecords((r) => {
                              const c = [...r];
                              c[index] = { ...c[index], jlNo: e.target.value };
                              return c;
                            })
                          }
                        />
                      </div>

                      <div>
                        <FormLabel>Khatian No. *</FormLabel>
                        <Input
                          placeholder="Khatian number"
                          value={row.khatianNumber}
                          onChange={(e) =>
                            setLandRecords((r) => {
                              const c = [...r];
                              c[index] = {
                                ...c[index],
                                khatianNumber: e.target.value,
                              };
                              return c;
                            })
                          }
                        />
                      </div>

                      <div>
                        <FormLabel>Plot/Dag No. *</FormLabel>
                        <Input
                          placeholder="Plot number"
                          value={row.plotNumber}
                          onChange={(e) =>
                            setLandRecords((r) => {
                              const c = [...r];
                              c[index] = {
                                ...c[index],
                                plotNumber: e.target.value,
                              };
                              return c;
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="col-span-1">
                        <FormLabel>Area *</FormLabel>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={
                                row.areaUnit === "acre"
                                  ? "e.g., 0.12"
                                  : "e.g., 120.50"
                              }
                              value={row.areaValue}
                              onChange={(e) =>
                                setLandRecords((r) => {
                                  const c = [...r];
                                  c[index] = {
                                    ...c[index],
                                    areaValue: e.target.value,
                                  };
                                  return c;
                                })
                              }
                            />
                          </div>
                          <div className="col-span-2">
                            <Select
                              value={row.areaUnit}
                              onValueChange={(v: "sqm" | "acre") =>
                                setLandRecords((r) => {
                                  const c = [...r];
                                  c[index] = {
                                    ...c[index],
                                    areaUnit: v,
                                  };
                                  return c;
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sqm">sq. m.</SelectItem>
                                <SelectItem value="acre">Acre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <FormLabel>Classification *</FormLabel>
                        <Select
                          value={row.classification}
                          onValueChange={(v) =>
                            setLandRecords((r) => {
                              const c = [...r];
                              c[index] = { ...c[index], classification: v };
                              return c;
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Agricultural">
                              Agricultural
                            </SelectItem>
                            <SelectItem value="Danga (Agricultural)">
                              Danga (Agricultural)
                            </SelectItem>
                            <SelectItem value="Bastu (Vacant Land)">
                              Bastu (Vacant Land)
                            </SelectItem>
                            <SelectItem value="Residential">
                              Residential
                            </SelectItem>
                            <SelectItem value="Commercial">
                              Commercial
                            </SelectItem>
                            <SelectItem value="Industrial">
                              Industrial
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <FormLabel>Proposed Use *</FormLabel>
                        <Select
                          value={row.proposedUse}
                          onValueChange={(v) =>
                            setLandRecords((r) => {
                              const c = [...r];
                              c[index] = { ...c[index], proposedUse: v };
                              return c;
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select proposed use" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Residential">
                              Residential
                            </SelectItem>
                            <SelectItem value="Commercial">
                              Commercial
                            </SelectItem>
                            <SelectItem value="Industrial">
                              Industrial
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Single-line land summary */}
                    <div className="mt-3 text-sm text-amber-800">
                      {[
                        row.mouza && `Mouza: ${row.mouza}`,
                        row.jlNo && `J.L. No.: ${row.jlNo}`,
                        row.khatianNumber &&
                          `Khatian No.: ${row.khatianNumber}`,
                        row.plotNumber && `Dag/Plot No.: ${row.plotNumber}`,
                        row.areaValue &&
                          `Area: ${row.areaValue} ${
                            row.areaUnit === "acre" ? "Acre" : "sq. m."
                          }`,
                        row.classification && `Class.: ${row.classification}`,
                        row.proposedUse && `Proposed: ${row.proposedUse}`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    Preview NOC
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHdr>
                    <DialogTtl>Preview No Objection Certificate</DialogTtl>
                  </DialogHdr>
                  <div className="max-h-[80vh] overflow-y-auto">
                    <LandNOC
                      gpName="Dhalpara Gram Panchayat"
                      applicantName={form.getValues("applicantName") || ""}
                      fatherOrHusbandName={fatherOrHusbandName}
                      addressLines={[form.getValues("address") || ""]}
                      rows={landRecords.map((r) => ({
                        mouza: r.mouza,
                        jlNo: r.jlNo,
                        khatianNo: r.khatianNumber,
                        plotNo: r.plotNumber,
                        area: `${r.areaValue} ${
                          r.areaUnit === "acre" ? "Acre" : "sq. m."
                        }`,
                        classification: r.classification,
                        proposedUse: r.proposedUse,
                      }))}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isPending}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LandConversionForm;
