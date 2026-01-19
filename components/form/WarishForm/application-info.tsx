import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WarishFormValuesType } from "@/schema/warishSchema";
import { BilingualLabel } from "./bilingual-label";
import { villagenameOption } from "@/constants";
import { formatDate } from "@/utils/utils";

/* =======================
   Proper Case Formatter
======================= */
const toProperCase = (value: string) =>
  value
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, " ")
    .trimStart();

interface ApplicationInfoProps {
  form: UseFormReturn<WarishFormValuesType>;
}

export const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ form }) => {
  const materialdece = form.watch("maritialStatus");
  const relationValue = form.watch("relationwithdeceased");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">

      {/* ================= Reporting Date ================= */}
      <FormField
        control={form.control}
        name="reportingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <FormLabel>
              <BilingualLabel english="Reporting Date" bengali="রিপোর্টিং তারিখ" />
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled
                    className={cn(
                      "w-full h-10 text-left",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? formatDate(field.value) : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Applicant Name ================= */}
      <FormField
        control={form.control}
        name="applicantName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Applicant Name" bengali="আবেদনকারীর নাম" />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(toProperCase(e.target.value))
                }
                placeholder="Applicant Name / আবেদনকারীর নাম"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Mobile Number ================= */}
      <FormField
        control={form.control}
        name="applicantMobileNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Mobile Number" bengali="মোবাইল নম্বর" />
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Mobile Number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Relation With Deceased ================= */}
      <FormField
        control={form.control}
        name="relationwithdeceased"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel
                english="Relation with Deceased"
                bengali="মৃত ব্যক্তির সাথে সম্পর্ক"
              />
            </FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="son">Son</SelectItem>
                  <SelectItem value="daughter">Daughter</SelectItem>
                  <SelectItem value="wife">Wife</SelectItem>
                  <SelectItem value="husband">Husband</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="brother">Brother</SelectItem>
                  <SelectItem value="sister">Sister</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Name of Deceased ================= */}
      <FormField
        control={form.control}
        name="nameOfDeceased"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Name of Deceased" bengali="মৃত ব্যক্তির নাম" />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(toProperCase(e.target.value))
                }
                placeholder="Name of Deceased"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Date of Death ================= */}
      <FormField
        control={form.control}
        name="dateOfDeath"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Date of Death" bengali="মৃত্যুর তারিখ" />
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className="w-full text-left">
                    {field.value ? formatDate(field.value) : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Gender ================= */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Gender" bengali="লিঙ্গ" />
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <RadioGroupItem value="male" /> Male
                <RadioGroupItem value="female" /> Female
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Marital Status ================= */}
      <FormField
        control={form.control}
        name="maritialStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Marital Status" bengali="বৈবাহিক অবস্থা" />
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <RadioGroupItem value="married" /> Married
                <RadioGroupItem value="unmarried" /> Unmarried
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Father Name ================= */}
      <FormField
        control={form.control}
        name="fatherName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <BilingualLabel english="Father Name" bengali="পিতার নাম" />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(toProperCase(e.target.value))
                }
                placeholder="Father Name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ================= Spouse Name ================= */}
      {materialdece === "married" && (
        <FormField
          control={form.control}
          name="spouseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <BilingualLabel english="Spouse Name" bengali="স্বামী/স্ত্রীর নাম" />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toProperCase(e.target.value))
                  }
                  placeholder="Spouse Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* ================= Village ================= */}
      <FormField
        control={form.control}
        name="villageName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Village Name" bengali="গ্রামের নাম" />
            </FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Automatically set post office based on village selection
                  if (value === "Purbba Gobindapur") {
                    form.setValue("postOffice", "Fatepur");
                  } else {
                    form.setValue("postOffice", "Trimohini");
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Enter Village / গ্রামের নাম লিখুন" />
                </SelectTrigger>
                <SelectContent>
                  {villagenameOption.map((item) => (
                    <SelectItem value={item.value} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="postOffice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Post Office" bengali="ডাকঘর" />
            </FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled
              >
                <SelectTrigger className="w-full h-10 text-sm bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed">
                  <SelectValue placeholder="Auto-filled based on village / গ্রাম অনুযায়ী স্বয়ংক্রিয়ভাবে পূরণ করা হবে" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trimohini">Trimohini</SelectItem>
                  <SelectItem value="Fatepur">Fatepur</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />
    </div>
  );
};
