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
import { Plus, Trash2, Save, FileText, Ruler } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MBMeasurementDialog } from "@/components/MBMeasurementDialog";
import { generate } from "@pdfme/generator";
import { mbTemplate } from "@/lib/pdf-templates";

interface Measurement {
  id: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

interface EstimateItem {
  id: string;
  slNo: number;
  schedulePageNo: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  measurements?: Measurement[];
}

interface MBEntry {
  id?: string;
  estimateItemId: string;
  mbNumber: string;
  mbPageNumber: string;
  workItemDescription: string;
  unit: string;
  quantityExecuted: number;
  rate: number;
  amount: number;
  measuredDate: string;
  measuredBy: string;
  remarks?: string;
  measurements?: Measurement[];
}

export default function MBCreatePage() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [mbEntries, setMbEntries] = useState<MBEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<EstimateItem | null>(null);
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number | null>(null);
  const [dialogMeasurements, setDialogMeasurements] = useState<Measurement[]>([]);

  const [formData, setFormData] = useState({
    mbNumber: "",
    mbPageNumber: "",
    measuredDate: new Date().toISOString().split("T")[0],
    measuredBy: "",
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWorkId) {
      fetchEstimateItems(selectedWorkId);
      fetchMBEntries(selectedWorkId);
    } else {
      setEstimateItems([]);
      setMbEntries([]);
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

  const fetchEstimateItems = async (workId: string) => {
    try {
      const response = await fetch(`/api/work-estimate-items?workId=${workId}`);
      if (response.ok) {
        const data = await response.json();
        setEstimateItems(data.items || data || []); // Handle both response formats
      }
    } catch (error) {
      console.error("Error fetching estimate items:", error);
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

  const openAddDialog = (estimateItem: EstimateItem) => {
    if (!formData.mbNumber || !formData.mbPageNumber || !formData.measuredBy) {
      alert("Please fill MB Number, MB Page Number, and Measured By");
      return;
    }
    setCurrentItem(estimateItem);
    setDialogMeasurements(estimateItem.measurements || []);
    setCurrentEntryIndex(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const entry = mbEntries[index];
    // Reconstruct a temporary EstimateItem for display context
    const tempItem: EstimateItem = {
      id: entry.estimateItemId,
      slNo: 0,
      schedulePageNo: "",
      description: entry.workItemDescription,
      quantity: 0,
      unit: entry.unit,
      rate: entry.rate,
      amount: 0,
    };
    setCurrentItem(tempItem);
    setDialogMeasurements(entry.measurements || []);
    setCurrentEntryIndex(index);
    setIsDialogOpen(true);
  };

  const handleMeasurementsSave = (
    measurements: Measurement[],
    totalQuantity: number
  ) => {
    if (currentEntryIndex !== null) {
      // Edit existing entry
      const updatedEntries = [...mbEntries];
      const entry = updatedEntries[currentEntryIndex];
      entry.measurements = measurements;
      entry.quantityExecuted = totalQuantity;
      entry.amount = totalQuantity * entry.rate;
      setMbEntries(updatedEntries);
    } else if (currentItem) {
      // Add new entry
      const newEntry: MBEntry = {
        estimateItemId: currentItem.id,
        mbNumber: formData.mbNumber,
        mbPageNumber: formData.mbPageNumber,
        workItemDescription: currentItem.description,
        unit: currentItem.unit,
        quantityExecuted: totalQuantity,
        rate: currentItem.rate,
        amount: totalQuantity * currentItem.rate,
        measuredDate: formData.measuredDate,
        measuredBy: formData.measuredBy,
        measurements: measurements,
      };
      setMbEntries([...mbEntries, newEntry]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteEntry = (index: number) => {
    const newEntries = mbEntries.filter((_, i) => i !== index);
    setMbEntries(newEntries);
  };

  const handleSave = async () => {
    if (!selectedWorkId) {
      alert("Please select a work");
      return;
    }

    if (mbEntries.length === 0) {
      alert("Please add at least one MB entry");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/work-measurement-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workId: selectedWorkId,
          entries: mbEntries,
        }),
      });

      if (response.ok) {
        alert("Measurement Book entries saved successfully");
        fetchMBEntries(selectedWorkId);
      } else {
        alert("Failed to save MB entries");
      }
    } catch (error) {
      console.error("Error saving MB entries:", error);
      alert("Error saving MB entries");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (mbEntries.length === 0) {
      alert("No MB entries to print");
      return;
    }

    setGeneratingPDF(true);
    try {
      const work = works.find((w) => w.id === selectedWorkId);
      const workName =
        work?.ApprovedActionPlanDetails?.activityDescription ||
        `Work ${work?.workslno}`;

      // Flatten entries for the table
      // We might need to format the table data to show measurements
      // For now, let's just show basic info
      const inputs = [
        {
          mbNumber: formData.mbNumber,
          pageNumber: formData.mbPageNumber,
          workName: workName,
          table: JSON.stringify(
            mbEntries.map((entry, idx) => [
              (idx + 1).toString(),
              entry.workItemDescription,
              entry.measurements
                ? entry.measurements
                    .map(
                      (m) =>
                        `${m.description}: ${m.nos}x${m.length}x${m.breadth}x${m.depth} = ${m.quantity}`
                    )
                    .join("\n")
                : "",
              entry.quantityExecuted.toFixed(2),
              entry.unit,
              entry.rate.toFixed(2),
              entry.amount.toFixed(2),
            ])
          ),
          totalAmount: mbEntries
            .reduce((sum, entry) => sum + entry.amount, 0)
            .toFixed(2),
        },
      ];

      // Note: pdfme table schema expects an array of objects or array of arrays depending on config.
      // My template defined columns: slNo, description, measurements, quantity, unit, rate, amount.
      // The input 'table' should be the content.
      // pdfme table plugin usually takes a JSON string of array of arrays if using the standard table schema.
      
      const pdf = await generate({ template: mbTemplate, inputs });
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MB Create</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create Measurement Book entries from estimate items
            </p>
          </div>
          {mbEntries.length > 0 && (
            <Button onClick={handleGeneratePDF} disabled={generatingPDF}>
              <FileText className="mr-2 h-4 w-4" />
              {generatingPDF ? "Generating..." : "Print MB"}
            </Button>
          )}
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work">Select Work</Label>
              <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                <SelectTrigger id="work">
                  <SelectValue placeholder="Select a work" />
                </SelectTrigger>
                <SelectContent>
                  {works.map((work) => (
                    <SelectItem key={work.id} value={work.id}>
                      {work.ApprovedActionPlanDetails?.activityDescription ||
                        `Work ${work.workslno}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedWorkId && estimateItems.length > 0 && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">MB Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="mbNumber">MB Number</Label>
                    <Input
                      id="mbNumber"
                      value={formData.mbNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, mbNumber: e.target.value })
                      }
                      placeholder="e.g., MB-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mbPageNumber">MB Page Number</Label>
                    <Input
                      id="mbPageNumber"
                      value={formData.mbPageNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, mbPageNumber: e.target.value })
                      }
                      placeholder="e.g., P-03"
                    />
                  </div>
                  <div>
                    <Label htmlFor="measuredDate">Measured Date</Label>
                    <Input
                      id="measuredDate"
                      type="date"
                      value={formData.measuredDate}
                      onChange={(e) =>
                        setFormData({ ...formData, measuredDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="measuredBy">Measured By</Label>
                    <Input
                      id="measuredBy"
                      value={formData.measuredBy}
                      onChange={(e) =>
                        setFormData({ ...formData, measuredBy: e.target.value })
                      }
                      placeholder="Name of measurer"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Available Estimate Items
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SL No</TableHead>
                        <TableHead>Schedule Page No</TableHead>
                        <TableHead className="min-w-[300px]">
                          Description
                        </TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimateItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.slNo}</TableCell>
                          <TableCell>{item.schedulePageNo}</TableCell>
                          <TableCell className="text-sm">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity.toFixed(2)}
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">
                            {item.rate.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddDialog(item)}
                              disabled={
                                !formData.mbNumber ||
                                !formData.mbPageNumber ||
                                !formData.measuredBy
                              }
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Measure
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {mbEntries.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">MB Entries</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>MB No & Page</TableHead>
                          <TableHead className="min-w-[300px]">
                            Description
                          </TableHead>
                          <TableHead className="text-right">
                            Quantity Executed
                          </TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mbEntries.map((entry, index) => (
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
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(index)}
                                >
                                  <Ruler className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEntry(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <div className="text-right space-y-1">
                      <div className="text-lg font-semibold">
                        Total: ₹{" "}
                        {mbEntries
                          .reduce((sum, entry) => sum + entry.amount, 0)
                          .toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save MB Entries"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {selectedWorkId && estimateItems.length === 0 && (
            <div className="border-t pt-4 text-center py-8 text-muted-foreground">
              No estimate items found for this work. Please create an estimate
              first.
            </div>
          )}
        </div>
      </div>

      <MBMeasurementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        estimateItem={currentItem}
        onSave={handleMeasurementsSave}
        initialMeasurements={dialogMeasurements}
      />
    </div>
  );
}
