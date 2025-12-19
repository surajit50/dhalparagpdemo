"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { bookNitNumber } from "@/action/bookNitNuber";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { NitBookValidationSchema } from "@/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type FormValues = z.infer<typeof NitBookValidationSchema>;

type TenderTermTemplate = {
  id: string;
  name: string;
  description: string | null;
  content?: {
    eligible?: string[];
    qualificationCriteria?: string[];
    termsConditions?: string[];
  };
};

export default function BookNitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TenderTermTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(NitBookValidationSchema),
    defaultValues: {
      tendermemonumber: "",
      tendermemodate: undefined,
      tender_pulishing_Date: undefined,
      tender_document_Download_from: undefined,
      tender_start_time_from: undefined,
      tender_end_date_time_from: undefined,
      tender_techinical_bid_opening_date: undefined,
      tender_financial_bid_opening_date: undefined,
      tender_place_opening_bids: "",
      tender_vilidity_bids: "",
      supplynit: false,
      supplyitemname: "",
      nitCount: "1st call",
      termsTemplateIds: [],
    },
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const response = await fetch("/api/tender-term-templates?isActive=true");
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message ?? "Failed to load templates");
        }
        const data: TenderTermTemplate[] = await response.json();
        setTemplates(data);
      } catch (fetchError) {
        console.error("Failed to load tender term templates", fetchError);
        setTemplatesError(
          fetchError instanceof Error ? fetchError.message : "Failed to load templates",
        );
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await bookNitNumber(values).then((data) => {
          if (data?.success) {
            startTransition(() => {
              formRef.current?.reset();
              setSuccess(data.success ?? null);
              form.reset();
            });
          }

          if (data?.error) {
            setError(data.error ?? null);
          }
        });
      } catch (error) {
        console.error("Failed to create tender:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="mx-auto bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-xl rounded-2xl border-2 border-gray-200/50 my-1 backdrop-blur-sm">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 sm:p-8 space-y-8"
          ref={formRef}
        >
          {/* Messages */}
          <div className="space-y-3">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-300 text-red-800 p-4 rounded-xl flex items-center gap-3 text-sm shadow-md animate-in slide-in-from-top-2">
                <div className="p-1.5 bg-red-500 rounded-full">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-100/50 border-2 border-green-300 text-green-800 p-4 rounded-xl flex items-center gap-3 text-sm shadow-md animate-in slide-in-from-top-2">
                <div className="p-1.5 bg-green-500 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
            )}
          </div>

          {/* Tender Details */}
          <div className="space-y-5 bg-white/60 rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-200">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tender Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="tendermemonumber"
                label="Tender Reference"
                placeholder="NIT Memo Number"
              />
              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="tendermemodate"
                label="Booking Date"
                dateFormat="dd/MM/yyyy"
              />
              <div className="md:col-span-2">
                <CustomFormField
                  fieldType={FormFieldType.SELECT}
                  control={form.control}
                  name="nitCount"
                  label="NIT Count"
                  options={[
                    { value: "1st call", label: "1st call" },
                    { value: "2nd call", label: "2nd call" },
                    { value: "3rd call", label: "3rd call" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Tender Schedule */}
          <div className="space-y-5 bg-white/60 rounded-xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-200">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tender Schedule</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { name: "tender_pulishing_Date", label: "Publishing Date" },
                { name: "tender_document_Download_from", label: "Download From" },
                { name: "tender_start_time_from", label: "Start Time" },
                { name: "tender_end_date_time_from", label: "End Date/Time" },
                { name: "tender_techinical_bid_opening_date", label: "Tech Bid Opening" },
              ].map((field) => (
                <CustomFormField
                  key={field.name}
                  fieldType={FormFieldType.DATE_PICKER}
                  control={form.control}
                  name={field.name as keyof FormValues}
                  label={field.label}
                  dateFormat="dd/MM/yyyy HH:mm"
                  showTimeSelect
                />
              ))}
            </div>
          </div>

          {/* Bid Details */}
          <div className="space-y-5 bg-white/60 rounded-xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-green-200">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Bid Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="tender_place_opening_bids"
                label="Bid Opening Place"
                placeholder="Enter location"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="tender_vilidity_bids"
                label="Bid Validity"
                placeholder="Enter validity period"
              />
              <div className="flex items-center">
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={form.control}
                  name="supplynit"
                  label="For Supply NIT"
                />
              </div>
              {form.watch("supplynit") && (
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  control={form.control}
                  name="supplyitemname"
                  label="Item Name"
                  placeholder="Enter supply item name"
                />
              )}
            </div>
          </div>

        {/* Terms Template Selection */}
        <FormField
          control={form.control}
          name="termsTemplateIds"
          render={({ field }) => {
            const selectedIds = field.value ?? [];

            const handleToggle = (templateId: string, checked: boolean) => {
              if (checked) {
                if (!selectedIds.includes(templateId)) {
                  field.onChange([...selectedIds, templateId]);
                }
              } else {
                field.onChange(selectedIds.filter((id) => id !== templateId));
              }
            };

            return (
              <FormItem>
                <div className="space-y-4 bg-white/60 rounded-xl p-6 border-2 border-teal-100 shadow-sm">
                  <div className="flex items-start gap-3 border-b-2 border-teal-200 pb-4">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-sm mt-1">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <FormLabel className="text-base sm:text-lg font-bold text-gray-800 block mb-1">
                        Tender Term Templates
                      </FormLabel>
                      <FormDescription className="text-sm text-gray-600">
                        Select reusable templates to auto-fill eligibility, qualification, and terms content.
                      </FormDescription>
                    </div>
                  </div>

                  {isLoadingTemplates ? (
                    <div className="flex items-center gap-3 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Clock className="h-5 w-5 animate-spin text-teal-600" />
                      <span className="font-medium">Loading templates...</span>
                    </div>
                  ) : templatesError ? (
                    <div className="text-sm text-red-700 p-4 bg-red-50 rounded-lg border-2 border-red-200 font-medium">
                      {templatesError}
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      No templates available yet. Create templates from the{" "}
                      <Link
                        href="/admindashboard/manage-tender/templates"
                        className="text-teal-600 hover:text-teal-700 underline font-semibold transition-colors"
                      >
                        template manager
                      </Link>
                      .
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templates.map((template) => {
                        const content = template.content ?? {};
                        const counts = {
                          eligible: content.eligible?.length ?? 0,
                          qualification: content.qualificationCriteria?.length ?? 0,
                          terms: content.termsConditions?.length ?? 0,
                        };
                        const checked = selectedIds.includes(template.id);

                        return (
                          <div
                            key={template.id}
                            className={`flex items-start gap-4 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                              checked
                                ? "border-teal-500 bg-gradient-to-r from-teal-50 to-blue-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm"
                            }`}
                            onClick={() => handleToggle(template.id, !checked)}
                          >
                            <Checkbox
                              id={`template-${template.id}`}
                              checked={checked}
                              onCheckedChange={(state) =>
                                handleToggle(template.id, state === true)
                              }
                              className="mt-1"
                            />
                            <label
                              htmlFor={`template-${template.id}`}
                              className="flex-1 cursor-pointer space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className={`font-bold text-base ${
                                  checked ? "text-teal-900" : "text-gray-900"
                                }`}>
                                  {template.name}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-semibold ${
                                      checked 
                                        ? "bg-blue-100 text-blue-800 border-blue-300" 
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    Eligible: {counts.eligible}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-semibold ${
                                      checked 
                                        ? "bg-green-100 text-green-800 border-green-300" 
                                        : "bg-green-50 text-green-700 border-green-200"
                                    }`}
                                  >
                                    Qualification: {counts.qualification}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-semibold ${
                                      checked 
                                        ? "bg-purple-100 text-purple-800 border-purple-300" 
                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                    }`}
                                  >
                                    Terms: {counts.terms}
                                  </Badge>
                                </div>
                              </div>
                              <p className={`text-sm ${
                                checked ? "text-gray-700" : "text-gray-500"
                              }`}>
                                {template.description || "Reusable tender terms template"}
                              </p>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

          {/* Submit Button */}
          <div className="pt-6 border-t-2 border-gray-200">
            <Button
              className="w-full px-6 py-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-3">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Create Tender</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
