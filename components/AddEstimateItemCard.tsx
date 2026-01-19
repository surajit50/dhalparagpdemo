import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Measurement {
  id: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

// Define the form interface
interface EstimateForm {
  schedulePageNo: string;
  description: string;
  nos: string;
  length: string;
  breadth: string;
  depth: string;
  quantity: string;
  unit: string;
  rate: string;
  measurements: Measurement[];
}

// Define the props interface
interface AddEstimateItemCardProps {
  form: EstimateForm;
  setForm: (form: EstimateForm | ((prev: EstimateForm) => EstimateForm)) => void;
  addItem: (item: any) => void;
  estimateExists: boolean;
  isEditing: boolean;
  setItems: (items: any) => void;
  items: any[];
}

export default function AddEstimateItemCard({
  form,
  setForm,
  addItem,
  estimateExists,
  isEditing,
  setItems,
  items,
}: AddEstimateItemCardProps) {
  const [meas, setMeas] = useState({
    description: "",
    nos: "1",
    length: "",
    breadth: "",
    depth: "",
  });

  const calculateMeasurementQty = (m: typeof meas, unit: string) => {
    const nos = Number(m.nos) || 0;
    const length = Number(m.length) || 0;
    const breadth = Number(m.breadth) || 0;
    const depth = Number(m.depth) || 0;
    
    let qty = 0;
    if (unit === 'm') qty = nos * length;
    else if (unit === 'sqm') qty = nos * length * breadth;
    else if (unit === 'cum') qty = nos * length * breadth * depth;
    else if (unit === 'no') qty = nos;
    
    return qty;
  };

  const addMeasurement = () => {
    const qty = calculateMeasurementQty(meas, form.unit);
    
    const newMeasurement: Measurement = {
      id: Math.random().toString(36).substr(2, 9),
      description: meas.description,
      nos: Number(meas.nos) || 0,
      length: Number(meas.length) || 0,
      breadth: Number(meas.breadth) || 0,
      depth: Number(meas.depth) || 0,
      quantity: qty
    };

    const updatedMeasurements = [...(form.measurements || []), newMeasurement];
    const totalQty = updatedMeasurements.reduce((sum, m) => sum + m.quantity, 0);

    setForm(prev => ({
      ...prev,
      measurements: updatedMeasurements,
      quantity: totalQty.toFixed(2)
    }));

    setMeas({
      description: "",
      nos: "1",
      length: "",
      breadth: "",
      depth: "",
    });
  };

  const removeMeasurement = (id: string) => {
    const updatedMeasurements = form.measurements.filter(m => m.id !== id);
    const totalQty = updatedMeasurements.reduce((sum, m) => sum + m.quantity, 0);
    
    setForm(prev => ({
      ...prev,
      measurements: updatedMeasurements,
      quantity: totalQty.toFixed(2)
    }));
  };

  const calculateQuantity = () => {
    // If we have measurements, use them
    if (form.measurements && form.measurements.length > 0) {
      return form.measurements.reduce((sum, m) => sum + m.quantity, 0).toFixed(2);
    }

    const nos = Number(form.nos) || 1;
    const length = Number(form.length) || 0;
    const breadth = Number(form.breadth) || 0;
    const depth = Number(form.depth) || 0;
    
    let calculatedQuantity = 0;

    switch (form.unit) {
      case 'm':
        calculatedQuantity = nos * length;
        break;
      case 'sqm':
        calculatedQuantity = nos * length * breadth;
        break;
      case 'cum':
        calculatedQuantity = nos * length * breadth * depth;
        break;
      case 'no':
        calculatedQuantity = nos;
        break;
      default:
        return form.quantity;
    }

    return calculatedQuantity > 0 ? calculatedQuantity.toFixed(2) : "0";
  };

  // Auto-update quantity when dimensions change (only if no measurements)
  useEffect(() => {
    if (!form.measurements || form.measurements.length === 0) {
      if (form.unit === 'm' || form.unit === 'sqm' || form.unit === 'cum' || form.unit === 'no') {
        const calculatedQty = calculateQuantity();
        if (calculatedQty !== form.quantity && calculatedQty !== "0") {
          setForm((prev: EstimateForm) => ({ 
            ...prev, 
            quantity: calculatedQty 
          }));
        }
      }
    }
  }, [form.nos, form.length, form.breadth, form.depth, form.unit, form.measurements]);

  const handleAddItem = () => {
    let quantityToUse = Number(form.quantity);
    
    // Validate
    if (!form.description || !quantityToUse || !form.rate || !form.unit) {
      alert("Please fill all required fields");
      return;
    }

    const newItem = {
      slNo: items.length + 1,
      schedulePageNo: form.schedulePageNo || "---",
      description: form.description,
      measurements: form.measurements || [],
      nos: Number(form.nos) || 1,
      length: Number(form.length) || 0,
      breadth: Number(form.breadth) || 0,
      depth: Number(form.depth) || 0,
      quantity: quantityToUse,
      unit: form.unit,
      rate: Number(form.rate),
      amount: quantityToUse * Number(form.rate),
    };

    addItem(newItem);
    setForm({
      schedulePageNo: "",
      description: "",
      nos: "",
      length: "",
      breadth: "",
      depth: "",
      quantity: "",
      unit: "m",
      rate: "",
      measurements: []
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Estimate Item
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Main Item Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Schedule Page No.
              </label>
              <Input
                placeholder="e.g., P-49, P-50"
                value={form.schedulePageNo}
                onChange={(e) =>
                  setForm({ ...form, schedulePageNo: e.target.value })
                }
                className="border-slate-300"
                disabled={estimateExists && !isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unit
              </label>
              <Select
                value={form.unit}
                onValueChange={(value) =>
                  setForm({ ...form, unit: value })
                }
                disabled={estimateExists && !isEditing}
              >
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Meter (m)</SelectItem>
                  <SelectItem value="sqm">Square Meter (sqm)</SelectItem>
                  <SelectItem value="cum">Cubic Meter (cum)</SelectItem>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="no">Number (no)</SelectItem>
                  <SelectItem value="LS">Lumpsum (LS)</SelectItem>
                  <SelectItem value="ha">Hectare (ha)</SelectItem>
                  <SelectItem value="l">Liter (l)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description of Work
            </label>
            <Textarea
              placeholder="Detailed description of work item"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border-slate-300 min-h-[80px] resize-none"
              disabled={estimateExists && !isEditing}
            />
          </div>
        </div>

        {/* Measurements Section */}
        <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
          <h3 className="font-semibold text-slate-800">Measurements</h3>
          
          {/* List of added measurements */}
          {form.measurements && form.measurements.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desc</TableHead>
                  <TableHead className="w-16">Nos</TableHead>
                  <TableHead className="w-20">L</TableHead>
                  <TableHead className="w-20">B</TableHead>
                  <TableHead className="w-20">D</TableHead>
                  <TableHead className="w-24 text-right">Qty</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.measurements.map((m, idx) => (
                  <TableRow key={m.id || idx}>
                    <TableCell className="text-xs">{m.description || "-"}</TableCell>
                    <TableCell>{m.nos}</TableCell>
                    <TableCell>{m.length}</TableCell>
                    <TableCell>{m.breadth}</TableCell>
                    <TableCell>{m.depth}</TableCell>
                    <TableCell className="text-right">{m.quantity.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeMeasurement(m.id)} disabled={estimateExists && !isEditing}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add New Measurement Input */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="text-xs font-medium">Sub-Description</label>
              <Input 
                value={meas.description} 
                onChange={e => setMeas({...meas, description: e.target.value})}
                placeholder="e.g. In Foundation"
                className="h-8 text-xs"
                disabled={estimateExists && !isEditing}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Nos</label>
              <Input 
                type="number" value={meas.nos} onChange={e => setMeas({...meas, nos: e.target.value})}
                className="h-8 text-xs"
                disabled={estimateExists && !isEditing}
              />
            </div>
            <div>
              <label className="text-xs font-medium">L</label>
              <Input 
                type="number" value={meas.length} onChange={e => setMeas({...meas, length: e.target.value})}
                className="h-8 text-xs"
                disabled={estimateExists && !isEditing}
              />
            </div>
            <div>
              <label className="text-xs font-medium">B</label>
              <Input 
                type="number" value={meas.breadth} onChange={e => setMeas({...meas, breadth: e.target.value})}
                className="h-8 text-xs"
                disabled={estimateExists && !isEditing}
              />
            </div>
            <div>
              <label className="text-xs font-medium">D</label>
              <Input 
                type="number" value={meas.depth} onChange={e => setMeas({...meas, depth: e.target.value})}
                className="h-8 text-xs"
                disabled={estimateExists && !isEditing}
              />
            </div>
          </div>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={addMeasurement}
            disabled={estimateExists && !isEditing}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Measurement
          </Button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Quantity
            </label>
            <Input
              type="number"
              value={form.quantity}
              readOnly
              className="bg-slate-100 font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rate (₹)
            </label>
            <Input
              type="number"
              value={form.rate}
              onChange={(e) =>
                setForm({ ...form, rate: e.target.value })
              }
              step="0.01"
              disabled={estimateExists && !isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount (₹)
            </label>
            <Input
              value={(Number(form.quantity) * Number(form.rate)).toFixed(2)}
              readOnly
              className="bg-slate-100 font-bold"
            />
          </div>
        </div>

        <Button
          onClick={handleAddItem}
          disabled={estimateExists && !isEditing}
          className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item to Estimate
        </Button>
      </CardContent>
    </Card>
  );
}
