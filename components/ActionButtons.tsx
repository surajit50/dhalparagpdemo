import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Save } from "lucide-react";

interface ActionButtonsProps {
  items: any[];
  selectedWorkId: string;
  loading: boolean;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  generatePDF: () => Promise<void>;
  handlePrint: () => void;
  saveEstimate: () => Promise<void>;
  isEditing: boolean;
}

export default function ActionButtons({
  items,
  selectedWorkId,
  loading,
  showPreview,
  setShowPreview,
  generatePDF,
  handlePrint,
  saveEstimate,
  isEditing,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
            size="lg"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Hide" : "Preview"}
          </Button>

          <Button
            onClick={generatePDF}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Download PDF"}
          </Button>

          <Button
            onClick={handlePrint}
            disabled={loading}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Print
          </Button>
        </>
      )}

      <Button
        onClick={saveEstimate}
        disabled={loading || items.length === 0 || !selectedWorkId}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        <Save className="mr-2 h-4 w-4" />
        {loading ? (
          "Saving..."
        ) : isEditing ? (
          "Update Estimate"
        ) : (
          "Save Estimate"
        )}
      </Button>
    </div>
  );
}
