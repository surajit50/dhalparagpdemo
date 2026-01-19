"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, FileText, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generate } from "@pdfme/generator";
import { billAbstractTemplate } from "@/lib/pdf-templates";

interface MBEntry {
  id: string;
  mbNumber: string;
  mbPageNumber: string;
  workItemDescription: string;
  unit: string;
  quantityExecuted: number;
  rate: number;
  amount: number;
  measuredDate: string;
  measuredBy: string;
}

interface BillAbstractEntry {
  id?: string;
  mbEntryId: string;
  mbNumber: string;
  mbPageNumber: string;
  workItemDescription: string;
  unit: string;
  quantityExecuted: number;
  rate: number;
  amount: number;
  remarks?: string;
}

export default function BillAbstractPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [mbEntries, setMbEntries] = useState<MBEntry[]>([]);
  const [billEntries, setBillEntries] = useState<BillAbstractEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    billType: "1st & Final Bill",
    period: "",
    contractualPercentage: "0.150",
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWorkId) {
      fetchMBEntries(selectedWorkId);
      fetchBillAbstract(selectedWorkId);
    } else {
      setMbEntries([]);
      setBillEntries([]);
    }
  }, [selectedWorkId]);

  const fetchWorks = async () => {
    try {
      const response = await fetch("/api/works");
      const data = await response.json();
      setWorks(data);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };

  const fetchMBEntries = async (workId: string) => {
    try {
      const response = await fetch(
        `/api/work-measurement-books?workId=${workId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMbEntries(data);
      }
    } catch (error) {
      console.error("Error fetching MB entries:", error);
    }
  };

  const fetchBillAbstract = async (workId: string) => {
    try {
      const response = await fetch(`/api/work-bill-abstracts?workId=${workId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setBillEntries(data);
        }
      }
    } catch (error) {
      console.error("Error fetching bill abstract:", error);
    }
  };

  const generateBillFromMB = () => {
    const entries: BillAbstractEntry[] = mbEntries.map((mb) => ({
      mbEntryId: mb.id,
      mbNumber: mb.mbNumber,
      mbPageNumber: mb.mbPageNumber,
      workItemDescription: mb.workItemDescription,
      unit: mb.unit,
      quantityExecuted: mb.quantityExecuted,
      rate: mb.rate,
      amount: mb.amount,
    }));

    setBillEntries(entries);
  };

  const calculateItemwiseTotal = () => {
    return billEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const calculateContractualDeduction = () => {
    const total = calculateItemwiseTotal();
    const percentage = parseFloat(formData.contractualPercentage) || 0;
    return (total * percentage) / 100;
  };

  const handleGeneratePDF = async () => {
    if (billEntries.length === 0) {
      alert("No bill entries to print");
      return;
    }

    setGeneratingPDF(true);
    try {
      const work = works.find((w) => w.id === selectedWorkId);
      const workName =
        work?.ApprovedActionPlanDetails?.activityDescription ||
        `Work ${work?.workslno}`;

      const inputs = [
        {
          billNumber: formData.billType,
          date: new Date().toISOString().split("T")[0],
          workName: workName,
          table: JSON.stringify(
            billEntries.map((entry, idx) => [
              (idx + 1).toString(),
              entry.workItemDescription,
              entry.quantityExecuted.toFixed(2),
              entry.unit,
              entry.rate.toFixed(2),
              entry.amount.toFixed(2),
            ])
          ),
          totalAmount: calculateActualValue().toFixed(2),
        },
      ];

      const pdf = await generate({ template: billAbstractTemplate, inputs });
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const calculateActualValue = () => {
    return calculateItemwiseTotal() - calculateContractualDeduction();
  };

  const handleSave = async () => {
    if (!selectedWorkId) {
      alert("Please select a work");
      return;
    }

    if (billEntries.length === 0) {
      alert("Please generate bill entries from MB");
      return;
    }

    setLoading(true);
    try {
      const itemwiseTotal = calculateItemwiseTotal();
      const contractualDeduction = calculateContractualDeduction();
      const actualValue = calculateActualValue();

      const response = await fetch("/api/work-bill-abstracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workId: selectedWorkId,
          billType: formData.billType,
          period: formData.period,
          contractualPercentage: parseFloat(formData.contractualPercentage),
          itemwiseTotal,
          contractualDeduction,
          actualValue,
          entries: billEntries,
        }),
      });

      if (response.ok) {
        alert("Bill Abstract saved successfully");
        fetchBillAbstract(selectedWorkId);
      } else {
        alert("Failed to save Bill Abstract");
      }
    } catch (error) {
      console.error("Error saving Bill Abstract:", error);
      alert("Error saving Bill Abstract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bill Abstract</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate bill abstract from Measurement Book entries
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="work">Select Work</Label>
              <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                <SelectTrigger id="work">
                  <SelectValue placeholder="Select a work" />
                </SelectTrigger>
                <SelectContent>
                  {works.map((work) => (
                    <SelectItem key={work.id} value={work.id}>
                      {work.ApprovedActionPlanDetails?.description ||
                        `Work ${work.workslno}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billType">Bill Type</Label>
              <Input
                id="billType"
                value={formData.billType}
                onChange={(e) =>
                  setFormData({ ...formData, billType: e.target.value })
                }
                placeholder="e.g., 1st & Final Bill"
              />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                placeholder="e.g., 2024-25"
              />
            </div>
          </div>

          {selectedWorkId && mbEntries.length > 0 && (
            <>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Bill Abstract Entries
                  </h3>
                  {billEntries.length === 0 && (
                    <Button onClick={generateBillFromMB} variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Bill from MB
                    </Button>
                  )}
                </div>

                {billEntries.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>MB No & Page No</TableHead>
                            <TableHead className="min-w-[300px]">
                              Items
                            </TableHead>
                            <TableHead className="text-right">
                              Quantity Executed
                            </TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">
                              Rate (Rs.)
                            </TableHead>
                            <TableHead className="text-right">
                              Amount (Rs.)
                            </TableHead>
                            <TableHead>Remarks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billEntries.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {entry.mbNumber}, {entry.mbPageNumber}
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.workItemDescription}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.quantityExecuted.toFixed(2)}
                              </TableCell>
                              <TableCell>{entry.unit}</TableCell>
                              <TableCell className="text-right">
                                {entry.rate.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {entry.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={entry.remarks || ""}
                                  onChange={(e) => {
                                    const updated = [...billEntries];
                                    updated[index].remarks = e.target.value;
                                    setBillEntries(updated);
                                  }}
                                  placeholder="Remarks"
                                  className="w-32"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex justify-end">
                        <div className="space-y-2 text-right w-64">
                          <div className="flex justify-between">
                            <span>Itemwise Total =</span>
                            <span className="font-medium">
                              ₹ {calculateItemwiseTotal().toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              Less contractual percentage @{" "}
                              {formData.contractualPercentage}%:
                            </span>
                            <Input
                              type="number"
                              step="0.001"
                              value={formData.contractualPercentage}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  contractualPercentage: e.target.value,
                                })
                              }
                              className="w-24 text-right"
                            />
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">
                              Actual Value of Work done:
                            </span>
                            <span className="font-semibold">
                              ₹ {calculateActualValue().toFixed(2)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">
                              SAY: ₹ {Math.round(calculateActualValue())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Bill Abstract"}
                      </Button>
                      <Button
                        onClick={handleGeneratePDF}
                        disabled={generatingPDF}
                        variant="outline"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        {generatingPDF
                          ? "Generating PDF..."
                          : "Print Bill Abstract"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Click &quot;Generate Bill from MB&quot; to create bill
                    entries
                  </div>
                )}
              </div>
            </>
          )}

          {selectedWorkId && mbEntries.length === 0 && (
            <div className="border-t pt-4 text-center py-8 text-muted-foreground">
              No MB entries found for this work. Please create MB entries first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function setGeneratingPDF(arg0: boolean) {
  throw new Error("Function not implemented.");
}

