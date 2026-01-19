import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface ItemsTableProps {
  items: any[];
  deleteItem: (index: number) => void;
  estimateExists: boolean;
  isEditing: boolean;
}

export default function ItemsTable({
  items,
  deleteItem,
  estimateExists,
  isEditing,
}: ItemsTableProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardTitle>Detailed Estimate</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead className="font-bold text-slate-900 w-12">#</TableHead>
                <TableHead className="font-bold text-slate-900 w-20">Page/Schedule</TableHead>
                <TableHead className="font-bold text-slate-900">Items of Work</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-16">Nos</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-20">Length (M)</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-20">Breadth (M)</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-20">Depth (M)</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-20">Quantity</TableHead>
                <TableHead className="font-bold text-slate-900 w-16">Unit</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-24">Rate (₹/Unit)</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-24">Amount (₹)</TableHead>
                <TableHead className="font-bold text-slate-900 w-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <>
                  {/* Item Description Row */}
                  <TableRow key={`item-${idx}-desc`} className="bg-slate-50/50">
                    <TableCell className="font-semibold align-top">{item.slNo}</TableCell>
                    <TableCell className="text-sm align-top">{item.schedulePageNo}</TableCell>
                    <TableCell colSpan={9} className="text-sm font-medium whitespace-pre-wrap align-top">
                      {item.description}
                    </TableCell>
                    <TableCell className="align-top">
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteItem(idx)}
                        className="h-8 w-8"
                        disabled={estimateExists && !isEditing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Measurement Rows */}
                  {item.measurements && item.measurements.length > 0 ? (
                    item.measurements.map((m: any, mIdx: number) => (
                      <TableRow key={`item-${idx}-meas-${mIdx}`} className="border-0">
                        <TableCell colSpan={2} className="border-0"></TableCell>
                        <TableCell className="pl-8 text-xs text-slate-600 border-0">{m.description}</TableCell>
                        <TableCell className="text-right text-xs border-0">{m.nos}</TableCell>
                        <TableCell className="text-right text-xs border-0">{m.length}</TableCell>
                        <TableCell className="text-right text-xs border-0">{m.breadth}</TableCell>
                        <TableCell className="text-right text-xs border-0">{m.depth}</TableCell>
                        <TableCell className="text-right text-xs border-0">{m.quantity.toFixed(2)}</TableCell>
                        <TableCell colSpan={4} className="border-0"></TableCell>
                      </TableRow>
                    ))
                  ) : (
                     // Fallback for simple items
                     <TableRow key={`item-${idx}-simple`} className="border-0">
                        <TableCell colSpan={2} className="border-0"></TableCell>
                        <TableCell className="pl-8 text-xs text-slate-600 border-0">Measurement</TableCell>
                        <TableCell className="text-right text-xs border-0">{item.nos}</TableCell>
                        <TableCell className="text-right text-xs border-0">{item.length}</TableCell>
                        <TableCell className="text-right text-xs border-0">{item.breadth}</TableCell>
                        <TableCell className="text-right text-xs border-0">{item.depth}</TableCell>
                        <TableCell className="text-right text-xs border-0">{item.quantity.toFixed(2)}</TableCell>
                        <TableCell colSpan={4} className="border-0"></TableCell>
                     </TableRow>
                  )}

                  {/* Total Row */}
                  <TableRow key={`item-${idx}-total`} className="font-semibold bg-slate-100 border-b-2 border-slate-200">
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right text-sm">Total</TableCell>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right text-sm">{item.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-center text-sm"><Badge variant="outline">{item.unit}</Badge></TableCell>
                    <TableCell className="text-right text-sm">{item.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm text-green-600">
                      ₹{item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
