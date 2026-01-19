import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { convertToWords } from "@/utils/convertToWords";

interface PrintPreviewProps {
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  projectInfo: any;
  items: any[];
  contingency: number;
  itemTotal: number;
  gst: number;
  costExclLWC: number;
  lwc: number;
  costInclLWC: number;
  finalCost: number;
}

export default function PrintPreview({
  showPreview,
  setShowPreview,
  projectInfo,
  items,
  contingency,
  itemTotal,
  gst,
  costExclLWC,
  lwc,
  costInclLWC,
  finalCost,
}: PrintPreviewProps) {
  if (!showPreview) return null;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white flex flex-row items-center justify-between">
        <CardTitle>Print Preview</CardTitle>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowPreview(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div
          id="estimate-print"
          className="bg-white p-12 text-slate-900 space-y-6"
        >
          {/* HEADER */}
          <div className="border-b-2 border-slate-300 pb-6">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
              DETAILED ESTIMATE
            </h1>
            <div className="text-center text-sm text-slate-700 space-y-1">
              <p className="font-semibold">
                Project: {projectInfo.projectName || "---"}
              </p>
              <p>
                Code: {projectInfo.projectCode || "---"} | Location:{" "}
                {projectInfo.location || "---"}
              </p>
              <p>
                Prepared By: {projectInfo.preparedBy || "---"} | Date:{" "}
                {projectInfo.date}
              </p>
            </div>
          </div>

          {/* TABLE */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-slate-400 px-2 py-2 text-left font-bold">
                  Sl No
                </th>
                <th className="border border-slate-400 px-2 py-2 text-left font-bold">
                  Page/Schedule
                </th>
                <th className="border border-slate-400 px-2 py-2 text-left font-bold">
                  Items of Work
                </th>
                <th className="border border-slate-400 px-2 py-2 text-center font-bold">
                  Nos
                </th>
                <th className="border border-slate-400 px-2 py-2 text-center font-bold">
                  Length (M)
                </th>
                <th className="border border-slate-400 px-2 py-2 text-center font-bold">
                  Breadth (M)
                </th>
                <th className="border border-slate-400 px-2 py-2 text-center font-bold">
                  Depth (M)
                </th>
                <th className="border border-slate-400 px-2 py-2 text-right font-bold">
                  Quantity
                </th>
                <th className="border border-slate-400 px-2 py-2 text-center font-bold">
                  Unit
                </th>
                <th className="border border-slate-400 px-2 py-2 text-right font-bold">
                  Rate (₹/Unit)
                </th>
                <th className="border border-slate-400 px-2 py-2 text-right font-bold">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <>
                  {/* Item Description Row */}
                  <tr key={`item-${idx}-desc`}>
                    <td className="border border-slate-300 px-2 py-1 text-center align-top">
                      {item.slNo}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 align-top">
                      {item.schedulePageNo}
                    </td>
                    <td colSpan={9} className="border border-slate-300 px-2 py-1 text-xs whitespace-pre-wrap align-top">
                      {item.description}
                    </td>
                  </tr>

                  {/* Measurement Rows */}
                  {item.measurements && item.measurements.length > 0 ? (
                    item.measurements.map((m: any, mIdx: number) => (
                      <tr key={`item-${idx}-meas-${mIdx}`}>
                        <td colSpan={2} className="border-l border-slate-300"></td>
                        <td className="border border-slate-300 px-2 py-1 text-xs pl-8 text-slate-600">
                          {m.description}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center">
                          {m.nos}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center">
                          {m.length}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center">
                          {m.breadth}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center">
                          {m.depth}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          {m.quantity.toFixed(2)}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300"></td>
                      </tr>
                    ))
                  ) : (
                    <tr key={`item-${idx}-simple`}>
                      <td colSpan={2} className="border-l border-slate-300"></td>
                      <td className="border border-slate-300 px-2 py-1 text-xs pl-8 text-slate-600">
                        Measurement
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {item.nos ? Number(item.nos).toFixed(2) : ""}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {item.length > 0 ? Number(item.length).toFixed(2) : "-"}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {item.breadth > 0 ? Number(item.breadth).toFixed(2) : "-"}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {item.depth > 0 ? Number(item.depth).toFixed(2) : "-"}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-right">
                        {item.quantity ? Number(item.quantity).toFixed(2) : "0.00"}
                      </td>
                      <td colSpan={3} className="border-r border-slate-300"></td>
                    </tr>
                  )}

                  {/* Total Row */}
                  <tr key={`item-${idx}-total`} className="font-semibold bg-slate-50">
                    <td colSpan={7} className="border border-slate-300 px-2 py-1 text-right">
                      Total
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      {Number(item.quantity).toFixed(2)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {item.unit}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      {Number(item.rate).toFixed(2)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-bold">
                      {Number(item.amount).toFixed(2)}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>

          {/* ABSTRACT */}
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>A. Itemwise Total</span>
                <span className="font-semibold">
                  {itemTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>B. GST @18%</span>
                <span className="font-semibold">{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>C = A + B</span>
                <span className="font-semibold">
                  {costExclLWC.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>D. Labour Welfare Cess @1%</span>
                <span className="font-semibold">{lwc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2 font-semibold">
                <span>E = C + D</span>
                <span>{costInclLWC.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>F. Contingency (LS)</span>
                <span className="font-semibold">
                  {contingency.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between bg-blue-50 px-3 py-2 rounded font-bold text-base">
                <span>SAY / Final Cost (G)</span>
                <span>₹{finalCost.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-600 italic pt-4">
                In Words: Rupees{" "}
                {convertToWords(finalCost)} Only
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t-2 border-slate-300 pt-6 text-xs text-slate-600 grid grid-cols-3 gap-4">
            <div>
              <p className="mb-8 font-semibold">Prepared By:</p>
              <p>_____________________</p>
              <p>{projectInfo.preparedBy}</p>
            </div>
            <div>
              <p className="mb-8 font-semibold">Checked By:</p>
              <p>_____________________</p>
            </div>
            <div>
              <p className="mb-8 font-semibold">Approved By:</p>
              <p>_____________________</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
