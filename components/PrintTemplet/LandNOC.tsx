"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type LandRow = {
  mouza: string;
  jlNo: string | number;
  khatianNo: string | number;
  plotNo: string | number;
  area: string; // keep human-readable like "0.12 Acre"
  classification: string;
  proposedUse: string;
};

export type LandNOCProps = {
  title?: string;
  applicantName: string;
  fatherOrHusbandName: string;
  addressLines: string[]; // e.g., ["Village – Kismatdapat", "P.O. Trimohini", "P.S. Hili", "Dist. Dakshin Dinajpur"]
  rows: LandRow[];
  gpName?: string; // Gram Panchayat name to show in header/footer if needed
  showPrint?: boolean;
};

export default function LandNOC({
  title = "NO OBJECTION CERTIFICATE",
  applicantName,
  fatherOrHusbandName,
  addressLines,
  rows,
  gpName,
  showPrint = true,
}: LandNOCProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow print:shadow-none print:p-0">
      <div className="text-center mb-6">
        {gpName && <div className="text-sm text-gray-600">{gpName}</div>}
        <h1 className="text-2xl font-semibold tracking-wide">{title}</h1>
      </div>

      <div className="space-y-4 text-justify leading-7 text-gray-900">
        <p>
          This is to certify that{" "}
          <span className="font-medium">{applicantName}</span> S/o
          <span className="font-medium"> {fatherOrHusbandName}</span>, resident
          of{" "}
          {addressLines.filter(Boolean).map((l, i) => (
            <span key={i}>
              {i > 0 ? ", " : " "}
              {l}
            </span>
          ))}
          , is the recorded owner of the following land(s):
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Sl. No.
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Mouza
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  J.L. No.
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Khatian No.
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Dag/Plot No.
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Area of Land
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Classification of Land
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left">
                  Proposed Use
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-2">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {r.mouza}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">{r.jlNo}</td>
                  <td className="border border-gray-300 px-2 py-2">
                    {r.khatianNo}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {r.plotNo}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">{r.area}</td>
                  <td className="border border-gray-300 px-2 py-2">
                    {r.classification}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {r.proposedUse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          The applicant has applied for conversion of the above-mentioned lands
          from Agricultural/Other use to Residential use.
        </p>

        <p>
          After verifying the records and considering the matter, the Gram
          Panchayat has no objection to such conversion of the said land(s),
          subject to approval from the appropriate authority as per rules.
        </p>

        <p>
          This certificate is issued for the purpose of land conversion only and
          does not confer any ownership right beyond what is recorded in
          Government Records.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="h-16" />
          <div className="border-t border-gray-400 pt-2 w-56">
            Secretary/Authorized Signatory
          </div>
        </div>
        <div className="text-right">
          <div className="h-16" />
          <div className="border-t border-gray-400 pt-2 inline-block w-56">
            Pradhan/Authorized Signatory
          </div>
        </div>
      </div>

      {showPrint && (
        <div className="mt-8 flex justify-end print:hidden">
          <Button onClick={handlePrint}>Print</Button>
        </div>
      )}
    </div>
  );
}
