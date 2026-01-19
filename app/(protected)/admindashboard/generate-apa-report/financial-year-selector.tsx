"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { generateFinancialYears, getCurrentFinancialYear, getFinancialYearDateRange } from "@/utils/financialYear";

export function FinancialYearSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = getCurrentFinancialYear();
  const financialYears = generateFinancialYears(2020);
  
  const selectedYear = searchParams.get("financialYear") || currentYear;

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("financialYear", value);
    router.push(`?${params.toString()}`);
  };

  const { financialYearStart, financialYearEnd } = getFinancialYearDateRange(selectedYear);

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="financial-year" className="text-sm font-medium">
          Financial Year:
        </Label>
      </div>
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger id="financial-year" className="w-[180px]">
          <SelectValue placeholder="Select Financial Year" />
        </SelectTrigger>
        <SelectContent>
          {financialYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-sm text-muted-foreground">
        ({financialYearStart.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} - {financialYearEnd.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })})
      </div>
    </div>
  );
}

