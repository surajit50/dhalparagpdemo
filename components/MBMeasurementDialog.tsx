import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface Measurement {
  id: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

interface MBMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateItem: any;
  onSave: (measurements: Measurement[], totalQuantity: number) => void;
  initialMeasurements?: Measurement[];
}

export function MBMeasurementDialog({
  open,
  onOpenChange,
  estimateItem,
  onSave,
  initialMeasurements = [],
}: MBMeasurementDialogProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeas, setCurrentMeas] = useState({
    description: "",
    nos: "1",
    length: "",
    breadth: "",
    depth: "",
  });

  useEffect(() => {
    if (open) {
      if (initialMeasurements.length > 0) {
        setMeasurements(initialMeasurements);
      } else if (estimateItem?.measurements) {
        // Initialize with estimate measurements if no MB measurements exist yet
        setMeasurements(estimateItem.measurements);
      } else {
        setMeasurements([]);
      }
    }
  }, [open, estimateItem, initialMeasurements]);

  const calculateQty = (m: typeof currentMeas, unit: string) => {
    const nos = Number(m.nos) || 0;
    const length = Number(m.length) || 0;
    const breadth = Number(m.breadth) || 0;
    const depth = Number(m.depth) || 0;

    let qty = 0;
    if (unit === "m") qty = nos * length;
    else if (unit === "sqm") qty = nos * length * breadth;
    else if (unit === "cum") qty = nos * length * breadth * depth;
    else if (unit === "no") qty = nos;
    else qty = nos; // Default fallback

    return qty;
  };

  const addMeasurement = () => {
    const qty = calculateQty(currentMeas, estimateItem?.unit || "");
    const newMeas: Measurement = {
      id: Math.random().toString(36).substr(2, 9),
      description: currentMeas.description,
      nos: Number(currentMeas.nos) || 0,
      length: Number(currentMeas.length) || 0,
      breadth: Number(currentMeas.breadth) || 0,
      depth: Number(currentMeas.depth) || 0,
      quantity: qty,
    };

    setMeasurements([...measurements, newMeas]);
    setCurrentMeas({
      description: "",
      nos: "1",
      length: "",
      breadth: "",
      depth: "",
    });
  };

  const removeMeasurement = (id: string) => {
    setMeasurements(measurements.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    const totalQty = measurements.reduce((sum, m) => sum + m.quantity, 0);
    onSave(measurements, totalQty);
    onOpenChange(false);
  };

  const totalQuantity = measurements.reduce((sum, m) => sum + m.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Record Measurements</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Item:</span> {estimateItem?.description}
            </div>
            <div>
              <span className="font-semibold">Unit:</span> {estimateItem?.unit}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
            <h3 className="font-semibold text-slate-800">Measurements</h3>

            {measurements.length > 0 && (
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
                  {measurements.map((m, idx) => (
                    <TableRow key={m.id || idx}>
                      <TableCell className="text-xs">
                        {m.description || "-"}
                      </TableCell>
                      <TableCell>{m.nos}</TableCell>
                      <TableCell>{m.length}</TableCell>
                      <TableCell>{m.breadth}</TableCell>
                      <TableCell>{m.depth}</TableCell>
                      <TableCell className="text-right">
                        {m.quantity.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMeasurement(m.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
              <div className="md:col-span-2">
                <Label className="text-xs">Sub-Description</Label>
                <Input
                  value={currentMeas.description}
                  onChange={(e) =>
                    setCurrentMeas({
                      ...currentMeas,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. In Foundation"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Nos</Label>
                <Input
                  type="number"
                  value={currentMeas.nos}
                  onChange={(e) =>
                    setCurrentMeas({ ...currentMeas, nos: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">L</Label>
                <Input
                  type="number"
                  value={currentMeas.length}
                  onChange={(e) =>
                    setCurrentMeas({ ...currentMeas, length: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">B</Label>
                <Input
                  type="number"
                  value={currentMeas.breadth}
                  onChange={(e) =>
                    setCurrentMeas({ ...currentMeas, breadth: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">D</Label>
                <Input
                  type="number"
                  value={currentMeas.depth}
                  onChange={(e) =>
                    setCurrentMeas({ ...currentMeas, depth: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={addMeasurement}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Measurement
            </Button>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-bold">
              Total Quantity: {totalQuantity.toFixed(2)} {estimateItem?.unit}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Confirm Measurements</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
