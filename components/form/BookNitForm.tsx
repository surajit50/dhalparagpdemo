"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
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

type FormValues = z.infer<typeof NitBookValidationSchema>;

export default function BookNitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<
    { id: string; name: string; isActive: boolean }[]
  >([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);

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
      try {
        const res = await fetch("/api/tender-term-templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(
            (data as any[]).map((t) => ({
              id: t.id,
              name: t.name,
              isActive: t.isActive,
            }))
          );
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingTemplates(false);
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
    <div className="mx-auto bg-white shadow-md rounded-xl border border-gray-200 my-1">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 space-y-6"
          ref={formRef}
        >
          {/* Messages */}
          <div className="space-y-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Tender Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Tender Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Tender Schedule
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "tender_pulishing_Date", label: "Publishing Date" },
                {
                  name: "tender_document_Download_from",
                  label: "Download From",
                },
                { name: "tender_start_time_from", label: "Start Time" },
                { name: "tender_end_date_time_from", label: "End Date/Time" },
                {
                  name: "tender_techinical_bid_opening_date",
                  label: "Tech Bid Opening",
                },
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <MapPin className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Bid Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Terms Templates Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Terms Templates
              </h2>
            </div>
            <div className="space-y-2">
              {loadingTemplates ? (
                <div className="text-sm text-gray-500">
                  Loading templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No templates available
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {templates.map((tpl) => (
                    <label
                      key={tpl.id}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={form
                          .watch("termsTemplateIds")
                          .includes(tpl.id)}
                        onChange={(e) => {
                          const current =
                            form.getValues("termsTemplateIds") || [];
                          const next = e.target.checked
                            ? Array.from(new Set([...current, tpl.id]))
                            : current.filter((id) => id !== tpl.id);
                          form.setValue("termsTemplateIds", next, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <span className="text-sm">
                        {tpl.name}
                        {!tpl.isActive && (
                          <span className="ml-2 text-xs text-gray-500">
                            (inactive)
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-70"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
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
