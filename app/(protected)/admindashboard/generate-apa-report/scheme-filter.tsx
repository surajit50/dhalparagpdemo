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
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SchemeFilterProps {
  availableSchemes: string[];
}

export function SchemeFilter({ availableSchemes }: SchemeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedSchemes = searchParams.get("schemes")
    ? searchParams.get("schemes")!.split(",").filter(Boolean)
    : [];

  const handleSchemeToggle = (scheme: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSchemes = params.get("schemes")
      ? params.get("schemes")!.split(",").filter(Boolean)
      : [];
    
    const isSelected = currentSchemes.includes(scheme);
    let newSchemes: string[];
    
    if (isSelected) {
      newSchemes = currentSchemes.filter((s) => s !== scheme);
    } else {
      newSchemes = [...currentSchemes, scheme];
    }
    
    if (newSchemes.length > 0) {
      params.set("schemes", newSchemes.join(","));
    } else {
      params.delete("schemes");
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("schemes");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Filter by Scheme:</Label>
        {selectedSchemes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableSchemes.map((scheme) => {
          const isSelected = selectedSchemes.includes(scheme);
          return (
            <Badge
              key={scheme}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer hover:bg-primary/80 transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              onClick={() => handleSchemeToggle(scheme)}
            >
              {scheme}
              {isSelected && (
                <X className="ml-1 h-3 w-3 inline-block" />
              )}
            </Badge>
          );
        })}
      </div>
      
      {selectedSchemes.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedSchemes.length} scheme(s) selected
        </div>
      )}
    </div>
  );
}

