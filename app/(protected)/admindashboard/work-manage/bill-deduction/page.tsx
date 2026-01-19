"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Calculator } from "lucide-react";
import { generate } from "@pdfme/generator";
import { billDeductionTemplate } from "@/lib/pdf-templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillAbstract {
  id: string;
  billType: string;
  period: string;
  itemwiseTotal: number;
  contractualDeduction: number;
  actualValue: number;
  grossBillAmount: number;
}

interface Deductions {
  incomeTaxPercentage: string;
  incomeTaxAmount: number;
  gstTdsPercentage: string;
  gstTdsAmount: number;
  labourWelfareCessPercentage: string;
  labourWelfareCessAmount: number;
  securityDepositPercentage: string;
  securityDepositAmount: number;
}

export default function BillDeductionPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [billAbstract, setBillAbstract] = useState<BillAbstract | null>(null);
  const [loading, setLoading] = useState(false);

  const [deductions, setDeductions] = useState<Deductions>({
    incomeTaxPercentage: "1.00",
    incomeTaxAmount: 0,
    gstTdsPercentage: "0.00",
    gstTdsAmount: 0,
    labourWelfareCessPercentage: "1.00",
    labourWelfareCessAmount: 0,
    securityDepositPercentage: "10.00",
    securityDepositAmount: 0,
  });

  const [formData, setFormData] = useState({
    billPaymentDate: new Date().toISOString().split("T")[0],
    eGramVoucher: "",
    eGramVoucherDate: new Date().toISOString().split("T")[0],
    gpmsVoucherNumber: "",
    gpmsVoucherDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWorkId) {
      fetchBillAbstract(selectedWorkId);
    } else {
      setBillAbstract(null);
    }
  }, [selectedWorkId]);

  useEffect(() => {
    if (billAbstract) {
      calculateDeductions();
    }
  }, [
    deductions.incomeTaxPercentage,
    deductions.gstTdsPercentage,
    deductions.labourWelfareCessPercentage,
    deductions.securityDepositPercentage,
    billAbstract,
  ]);

  const fetchWorks = async () => {
    try {
      const response = await fetch("/api/works");
      const data = await response.json();
      setWorks(data);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };

  const fetchBillAbstract = async (workId: string) => {
    try {
      const response = await fetch(
        `/api/work-bill-abstracts?workId=${workId}&latest=true`
      );
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setBillAbstract(data);
        }
      }
    } catch (error) {
      console.error("Error fetching bill abstract:", error);
    }
  };

  const calculateDeductions = () => {
    if (!billAbstract) return;

    const grossAmount = billAbstract.actualValue;

    const incomeTaxPct = parseFloat(deductions.incomeTaxPercentage) || 0;
    const gstTdsPct = parseFloat(deductions.gstTdsPercentage) || 0;
    const labourCessPct =
      parseFloat(deductions.labourWelfareCessPercentage) || 0;
    const securityDepositPct =
      parseFloat(deductions.securityDepositPercentage) || 0;

    const incomeTax = (grossAmount * incomeTaxPct) / 100;
    const gstTds = (grossAmount * gstTdsPct) / 100;
    const labourCess = (grossAmount * labourCessPct) / 100;
    const securityDeposit = (grossAmount * securityDepositPct) / 100;

    setDeductions((prev) => ({
      ...prev,
      incomeTaxAmount: incomeTax,
      gstTdsAmount: gstTds,
      labourWelfareCessAmount: labourCess,
      securityDepositAmount: securityDeposit,
    }));
  };

  const calculateTotalDeduction = () => {
    return (
      deductions.incomeTaxAmount +
      deductions.gstTdsAmount +
      deductions.labourWelfareCessAmount +
      deductions.securityDepositAmount
    );
  };

  const calculateNetPayable = () => {
    if (!billAbstract) return 0;
    return billAbstract.actualValue - calculateTotalDeduction();
  };

  const handlePercentageChange = (field: keyof Deductions, value: string) => {
    setDeductions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedWorkId || !billAbstract) {
      alert("Please select a work and ensure bill abstract exists");
      return;
    }

    if (!formData.eGramVoucher || !formData.gpmsVoucherNumber) {
      alert("Please fill in eGram Voucher and GPMS Voucher Number");
      return;
    }

    setLoading(true);
    try {
      const grossBillAmount = billAbstract.actualValue;
      const totalDeduction = calculateTotalDeduction();
      const netPayable = calculateNetPayable();

      const response = await fetch("/api/work-bill-deductions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workId: selectedWorkId,
          billAbstractId: billAbstract.id,
          grossBillAmount,
          deductions: {
            incomeTax: {
              percentage: parseFloat(deductions.incomeTaxPercentage),
              amount: deductions.incomeTaxAmount,
            },
            gstTds: {
              percentage: parseFloat(deductions.gstTdsPercentage),
              amount: deductions.gstTdsAmount,
            },
            labourWelfareCess: {
              percentage: parseFloat(deductions.labourWelfareCessPercentage),
              amount: deductions.labourWelfareCessAmount,
            },
            securityDeposit: {
              percentage: parseFloat(deductions.securityDepositPercentage),
              amount: deductions.securityDepositAmount,
            },
          },
          totalDeduction,
          netPayable,
          ...formData,
        }),
      });

      if (response.ok) {
        alert("Bill deduction saved successfully");
      } else {
        alert("Failed to save bill deduction");
      }
    } catch (error) {
      console.error("Error saving bill deduction:", error);
      alert("Error saving bill deduction");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedWorkId || !billAbstract) {
      alert("Please select a work and ensure bill abstract exists");
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
          billNumber: formData.gpmsVoucherNumber || "N/A",
          date: formData.billPaymentDate,
          workName: workName,
          grossAmount: billAbstract.actualValue.toFixed(2),
          deductionsTable: JSON.stringify([
            ["Income Tax", deductions.incomeTaxAmount.toFixed(2)],
            ["GST TDS", deductions.gstTdsAmount.toFixed(2)],
            [
              "Labour Welfare Cess",
              deductions.labourWelfareCessAmount.toFixed(2),
            ],
            ["Security Deposit", deductions.securityDepositAmount.toFixed(2)],
            ["Total Deduction", calculateTotalDeduction().toFixed(2)],
          ]),
          netAmount: calculateNetPayable().toFixed(2),
        },
      ];

      const pdf = await generate({ template: billDeductionTemplate, inputs });
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

  const formatNumberToWords = (num: number): string => {
    // Simple implementation - can be enhanced
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      return (
        ones[hundred] +
        " Hundred" +
        (remainder ? " " + formatNumberToWords(remainder) : "")
      );
    }
    if (num < 100000) {
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;
      return (
        formatNumberToWords(thousand) +
        " Thousand" +
        (remainder ? " " + formatNumberToWords(remainder) : "")
      );
    }
    if (num < 10000000) {
      const lakh = Math.floor(num / 100000);
      const remainder = num % 100000;
      return (
        formatNumberToWords(lakh) +
        " Lakh" +
        (remainder ? " " + formatNumberToWords(remainder) : "")
      );
    }
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bill Deduction</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Apply deductions to bill abstract and calculate net payable amount
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
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
                      {work.ApprovedActionPlanDetails?.description ||
                        `Work ${work.workslno}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {billAbstract && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Bill Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>Bill Type</Label>
                    <div className="text-sm font-medium">
                      {billAbstract.billType}
                    </div>
                  </div>
                  <div>
                    <Label>Period</Label>
                    <div className="text-sm font-medium">
                      {billAbstract.period}
                    </div>
                  </div>
                  <div>
                    <Label>Actual Value of Work Done</Label>
                    <div className="text-lg font-semibold">
                      ₹ {billAbstract.actualValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Deductions
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="incomeTax">Less Income Tax @</Label>
                      <div className="flex gap-2">
                        <Input
                          id="incomeTax"
                          type="number"
                          step="0.01"
                          value={deductions.incomeTaxPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "incomeTaxPercentage",
                              e.target.value
                            )
                          }
                          className="w-20"
                        />
                        <span className="self-center">%</span>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm font-medium">
                        ₹ {deductions.incomeTaxAmount.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gstTds">Less GST(TDS) @</Label>
                      <div className="flex gap-2">
                        <Input
                          id="gstTds"
                          type="number"
                          step="0.01"
                          value={deductions.gstTdsPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "gstTdsPercentage",
                              e.target.value
                            )
                          }
                          className="w-20"
                        />
                        <span className="self-center">%</span>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm font-medium">
                        ₹ {deductions.gstTdsAmount.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="labourCess">
                        Less Labour Welfare Cess @
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="labourCess"
                          type="number"
                          step="0.01"
                          value={deductions.labourWelfareCessPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "labourWelfareCessPercentage",
                              e.target.value
                            )
                          }
                          className="w-20"
                        />
                        <span className="self-center">%</span>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm font-medium">
                        ₹ {deductions.labourWelfareCessAmount.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="securityDeposit">
                        Less Security Deposit @
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="securityDeposit"
                          type="number"
                          step="0.01"
                          value={deductions.securityDepositPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "securityDepositPercentage",
                              e.target.value
                            )
                          }
                          className="w-20"
                        />
                        <span className="self-center">%</span>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm font-medium">
                        ₹ {deductions.securityDepositAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Gross Bill Amount</Label>
                    <div className="text-lg font-semibold">
                      ₹ {billAbstract.actualValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Total Deduction</Label>
                    <div className="text-lg font-semibold text-destructive">
                      ₹ {calculateTotalDeduction().toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <Label className="text-lg font-semibold">
                      Net Payable Amount
                    </Label>
                    <div className="text-xl font-bold">
                      ₹ {calculateNetPayable().toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground mt-2">
                    In Words: Rupees{" "}
                    {formatNumberToWords(Math.round(calculateNetPayable()))}{" "}
                    Only
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billPaymentDate">Bill Payment Date</Label>
                    <Input
                      id="billPaymentDate"
                      type="date"
                      value={formData.billPaymentDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billPaymentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="eGramVoucher">eGram Voucher</Label>
                    <Input
                      id="eGramVoucher"
                      value={formData.eGramVoucher}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eGramVoucher: e.target.value,
                        })
                      }
                      placeholder="Voucher number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eGramVoucherDate">eGram Voucher Date</Label>
                    <Input
                      id="eGramVoucherDate"
                      type="date"
                      value={formData.eGramVoucherDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eGramVoucherDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpmsVoucherNumber">
                      GPMS Voucher Number
                    </Label>
                    <Input
                      id="gpmsVoucherNumber"
                      value={formData.gpmsVoucherNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gpmsVoucherNumber: e.target.value,
                        })
                      }
                      placeholder="Voucher number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpmsVoucherDate">GPMS Voucher Date</Label>
                    <Input
                      id="gpmsVoucherDate"
                      type="date"
                      value={formData.gpmsVoucherDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gpmsVoucherDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <Button onClick={handleSave} disabled={loading} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Bill Deduction"}
                </Button>
              </div>
            </>
          )}

          {selectedWorkId && !billAbstract && (
            <div className="border-t pt-4 text-center py-8 text-muted-foreground">
              No bill abstract found for this work. Please create a bill
              abstract first.
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

