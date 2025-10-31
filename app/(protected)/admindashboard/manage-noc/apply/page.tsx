"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const nocApplicationSchema = z.object({
  applicantName: z.string().min(2, "Name must be at least 2 characters"),
  applicantMobile: z
    .string()
    .regex(/^\d{10}$/g, "Enter a valid 10-digit mobile number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  purpose: z.string().min(1, "Please select a purpose"),
  additionalDetails: z
    .string()
    .max(500, "Additional details too long")
    .optional(),
});

type NOCApplicationFormValues = z.infer<typeof nocApplicationSchema>;

export default function ApplyNOC() {
  const [isPending, startTransition] = useTransition();
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<
    (NOCApplicationFormValues & { fatherOrHusbandName?: string }) | null
  >(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<NOCApplicationFormValues>({
    resolver: zodResolver(nocApplicationSchema),
    defaultValues: {
      applicantName: "",
      applicantMobile: "",
      address: "",
      purpose: "",
      additionalDetails: "",
    },
  });

  // Autosave functionality
  const watchedValues = form.watch();
  useEffect(() => {
    const timer = setTimeout(() => {
      const formData = {
        ...watchedValues,
        fatherOrHusbandName,
      };
      localStorage.setItem("nocApplicationDraft", JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [watchedValues, fatherOrHusbandName]);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("nocApplicationDraft");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
      setFatherOrHusbandName(parsedData.fatherOrHusbandName || "");
    }
  }, [form]);

  const getPurposeLabel = (value: string) => {
    const map: Record<string, string> = {
      residential_construction: "Residential House Construction",
      water_connection: "Water Connection",
      electricity_connection: "Electricity Connection",
      trade_license: "Trade License / Shop Establishment",
      mutation: "Land Mutation / Record Purpose",
      passport_verification: "Passport / Police Verification",
      sale_permission: "Permission for Sale / Transfer",
      tree_cutting: "Tree Cutting Permission",
      fiber_optic_installation: "Fiber Optic Cable Laying / Establishment",
      road_cutting: "Road Cutting / Right of Way",
      drainage_connection: "Drainage / Sewer Connection",
      borewell_installation: "Borewell / Tube Well Installation",
      mobile_tower: "Mobile Tower / Infrastructure",
      public_event: "Public Event / Temporary Structure",
      other: "Other",
    };
    return map[value] || value.replace(/_/g, " ");
  };

  const onSubmit = (values: NOCApplicationFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    startTransition(async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));
        toast.success("NOC application submitted successfully");
        setSubmittedData({ ...values, fatherOrHusbandName });
        setIsPreviewOpen(true);
        const now = new Date();
        setIssuedAt(now);
        const seq = String(Date.now()).slice(-6);
        setRefNo(`NOC/${now.getFullYear()}/${seq}`);

        // Clear saved form after successful submission
        localStorage.removeItem("nocApplicationDraft");
      } catch (err) {
        setSubmitError("Failed to submit application. Please try again.");
        toast.error("Failed to submit NOC application");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the form? All data will be lost."
      )
    ) {
      form.reset();
      setFatherOrHusbandName("");
      localStorage.removeItem("nocApplicationDraft");
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || "";
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document
      .write(`<!doctype html><html><head><title>NOC Print</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @page { size: A4; margin: 18mm 15mm; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #111827; }
        .noc { max-width: 190mm; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 8px; margin-bottom: 12px; }
        .gp-name { font-size: 18px; font-weight: 700; }
        .gp-sub { font-size: 12px; color: #374151; }
        .cert-title { text-align: center; font-size: 16px; font-weight: 700; text-decoration: underline; margin: 12px 0; }
        .meta { display: flex; justify-content: space-between; font-size: 12px; margin: 12px 0; }
        .subject { font-size: 14px; margin: 10px 0; }
        .label { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 13px; }
        td { padding: 6px 8px; vertical-align: top; border: 1px solid #E5E7EB; }
        .body { font-size: 13px; line-height: 1.7; text-align: justify; }
        .sign { display: flex; justify-content: space-between; margin-top: 28px; font-size: 12px; }
        .seal { text-align: right; }
      </style>
    </head><body onload="window.print();setTimeout(()=>window.close(), 200)"><div class="noc">${content}</div></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gram Panchayat Portal
          </h1>
          <p className="text-gray-600">
            No Objection Certificate Application System
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 py-4 px-6 text-white">
            <h2 className="text-xl font-bold">NOC Application Form</h2>
            <p className="text-blue-100 text-sm mt-1">
              Apply for No Objection Certificate for various purposes from Gram
              Panchayat.
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Applicant Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Applicant Name *
                    </label>
                    <input
                      placeholder="Full name as per ID proof"
                      {...form.register("applicantName")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.applicantName && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.applicantName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Father/Husband Name
                    </label>
                    <input
                      placeholder="Enter father/husband name"
                      value={fatherOrHusbandName}
                      onChange={(e) => setFatherOrHusbandName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mobile Number *
                    </label>
                    <input
                      placeholder="10-digit mobile number"
                      {...form.register("applicantMobile")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.applicantMobile && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.applicantMobile.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <textarea
                    placeholder="House no, street, village/town, district, state, PIN code"
                    {...form.register("address")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-xs">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="mt-3 bg-white p-3 rounded border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-700 mb-1">
                    Application Summary
                  </h4>
                  <div className="text-sm text-gray-600">
                    {[
                      `Name: ${
                        form.getValues("applicantName") || "Not provided"
                      }`,
                      fatherOrHusbandName && `S/o: ${fatherOrHusbandName}`,
                      form.getValues("address") &&
                        `Address: ${form
                          .getValues("address")
                          .substring(0, 40)}${
                          form.getValues("address").length > 40 ? "..." : ""
                        }`,
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  NOC Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Purpose of NOC *
                    </label>
                    <select
                      {...form.register("purpose")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select purpose</option>
                      <option value="residential_construction">
                        Residential House Construction
                      </option>
                      <option value="water_connection">Water Connection</option>
                      <option value="electricity_connection">
                        Electricity Connection
                      </option>
                      <option value="trade_license">
                        Trade License/Shop Establishment
                      </option>
                      <option value="mutation">
                        Land Mutation/Record Purpose
                      </option>
                      <option value="passport_verification">
                        Passport/Police Verification
                      </option>
                      <option value="sale_permission">
                        Permission for Sale/Transfer
                      </option>
                      <option value="tree_cutting">
                        Tree Cutting Permission
                      </option>
                      <option value="fiber_optic_installation">
                        Fiber Optic Cable Laying
                      </option>
                      <option value="road_cutting">
                        Road Cutting / Right of Way
                      </option>
                      <option value="drainage_connection">
                        Drainage / Sewer Connection
                      </option>
                      <option value="borewell_installation">
                        Borewell / Tube Well Installation
                      </option>
                      <option value="mobile_tower">
                        Mobile Tower / Infrastructure
                      </option>
                      <option value="public_event">
                        Public Event / Temporary Structure
                      </option>
                      <option value="other">Other</option>
                    </select>
                    {form.formState.errors.purpose && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.purpose.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Additional Details (optional)
                    </label>
                    <input
                      placeholder="Brief description"
                      {...form.register("additionalDetails")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.formState.errors.additionalDetails && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.additionalDetails.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Error: {submitError}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Fields marked with * are mandatory
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {submittedData && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">
                      Application submitted successfully!
                    </div>
                    <div>Reference No: {refNo || "Generating..."}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Preview NOC
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>

                {isPreviewOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold">
                          No Objection Certificate Preview
                        </h3>
                        <button
                          onClick={() => setIsPreviewOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="overflow-y-auto p-6">
                        <div
                          ref={printRef}
                          className="p-6 border border-gray-200"
                        >
                          <div className="header">
                            <div style={{ fontSize: 12 }}>
                              Office of The Pradhan
                            </div>
                            <div
                              className="gp-name"
                              style={{ color: "#1e40af" }}
                            >
                              No 3 Dhalpara Gram Panchayat
                            </div>
                            <div className="gp-sub">
                              Hili Development Block, Dakshin Dinajpur
                            </div>
                          </div>
                          <div
                            className="meta"
                            style={{
                              borderTop: "2px solid #111827",
                              paddingTop: 6,
                            }}
                          >
                            <div>
                              <span className="font-medium">
                                Certificate No:
                              </span>{" "}
                              {refNo || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {(issuedAt || new Date()).toLocaleDateString()}
                            </div>
                          </div>
                          <div
                            className="cert-title"
                            style={{ color: "#059669" }}
                          >
                            No Objection Certificate
                          </div>
                          <div className="subject">
                            <span className="font-medium">Subject:</span> No
                            Objection Certificate for{" "}
                            {getPurposeLabel(submittedData.purpose)}
                          </div>
                          <table>
                            <tbody>
                              <tr>
                                <td className="w-[35%]">
                                  <span className="label">Applicant</span>
                                </td>
                                <td>{submittedData.applicantName}</td>
                              </tr>
                              {submittedData.fatherOrHusbandName && (
                                <tr>
                                  <td>
                                    <span className="label">S/o</span>
                                  </td>
                                  <td>{submittedData.fatherOrHusbandName}</td>
                                </tr>
                              )}
                              <tr>
                                <td>
                                  <span className="label">Address</span>
                                </td>
                                <td>{submittedData.address}</td>
                              </tr>
                              <tr>
                                <td>
                                  <span className="label">Purpose</span>
                                </td>
                                <td>
                                  {getPurposeLabel(submittedData.purpose)}
                                </td>
                              </tr>
                              {submittedData.additionalDetails && (
                                <tr>
                                  <td>
                                    <span className="label">Details</span>
                                  </td>
                                  <td>{submittedData.additionalDetails}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <div className="body">
                            This is to certify that the Gram Panchayat has no
                            objection to the above request for the stated
                            purpose, as mentioned by the applicant, subject to
                            the following: (a) compliance with all applicable
                            Acts/Rules/Regulations, (b) obtaining permissions
                            from concerned competent authorities wherever
                            required, (c) no encroachment upon public property,
                            right-of-way, or utilities, and (d) restoration of
                            any public assets, if affected.
                          </div>
                          <div className="sign">
                            <div>Place: Dhalpara</div>
                            <div
                              className="seal"
                              style={{ textAlign: "right" }}
                            >
                              <div>Signature of Pradhan</div>
                              <div
                                className="text-gray-500"
                                style={{ marginTop: 8 }}
                              >
                                Prodhan
                              </div>
                              <div className="text-gray-500">
                                Dhalpara Gram Panchayat
                              </div>
                              <div className="text-gray-500">
                                Hili Block, Dakshin Dinajpur
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 p-4 border-t">
                        <button
                          onClick={() => setIsPreviewOpen(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Close
                        </button>
                        <button
                          onClick={handlePrint}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Gram Panchayat Portal. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
