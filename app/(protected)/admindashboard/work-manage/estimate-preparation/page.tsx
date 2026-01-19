"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";
import WorkSelectionCard from "@/components/WorkSelectionCard";
import ProjectInfoCard from "@/components/ProjectInfoCard";
import AddEstimateItemCard from "@/components/AddEstimateItemCard";
import ItemsTable from "@/components/ItemsTable";
import AbstractEstimateCard from "@/components/AbstractEstimateCard";
import ActionButtons from "@/components/ActionButtons";
import PrintPreview from "@/components/PrintPreview";
import { FileText } from "lucide-react";
import Header from "@/components/Header";

import ExistingEstimateAlert from "@/components/ExistingEstimateAlert";

interface Measurement {
  id: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

interface EstimateItem {
  slNo: number;
  schedulePageNo: string;
  description: string;
  measurements: Measurement[];
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface ProjectInfo {
  projectName: string;
  projectCode: number | string;
  location: string;
  preparedBy: string;
  date: string;
}

export default function EstimatePreparationPage() {
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contingency, setContingency] = useState<number>(0);
  const [existingEstimate, setExistingEstimate] = useState<any>(null);
  const [estimateExists, setEstimateExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [workSelected, setWorkSelected] = useState(false);

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectName: "",
    projectCode: "",
    location: "",
    preparedBy: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [form, setForm] = useState({
    schedulePageNo: "",
    description: "",
    nos: "",
    length: "",
    breadth: "",
    depth: "",
    quantity: "",
    unit: "m",
    rate: "",
    measurements: [] as Measurement[],
  });

  /* ============ FETCH WORKS ============ */
  useEffect(() => {
    fetchWorks();
    setInitialLoad(false);
  }, []);

  const fetchWorks = async () => {
    try {
      setLoadingWorks(true);
      const response = await fetch("/api/works");
      if (response.ok) {
        const data = await response.json();
        setWorks(data || []);
      }
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setLoadingWorks(false);
    }
  };

  /* ============ FETCH EXISTING ESTIMATE FOR SELECTED WORK ============ */
  const fetchExistingEstimate = async (workId: string) => {
    try {
      const response = await fetch(`/api/work-estimate-items?workId=${workId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.items && data.items.length > 0) {
          setExistingEstimate(data);
          setEstimateExists(true);
        } else {
          setExistingEstimate(null);
          setEstimateExists(false);
        }
      }
    } catch (error) {
      console.error("Error fetching existing estimate:", error);
      setExistingEstimate(null);
      setEstimateExists(false);
    }
  };

  const handleWorkSelection = (workId: string) => {
    setSelectedWorkId(workId);
    const selected = works.find((w) => w.id === workId);

    if (selected) {
      setProjectInfo({
        projectName:
          selected.ApprovedActionPlanDetails?.activityDescription ||
          `Work ${selected.workslno}`,
        projectCode: selected.ApprovedActionPlanDetails?.activityCode,
        location: selected.ApprovedActionPlanDetails?.locationofAsset || "",
        preparedBy: "Bappa Laha NS",
        date: new Date().toISOString().split("T")[0],
      });
      setWorkSelected(true);

      // Fetch existing estimate for this work
      fetchExistingEstimate(workId);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setItems([]);
    setProjectInfo({
      projectName: "",
      projectCode: "",
      location: "",
      preparedBy: "",
      date: new Date().toISOString().split("T")[0],
    });
    setContingency(0);
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
      measurements: [],
    });
  };

  /* ============ CALCULATIONS ============ */
  const itemTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gst = itemTotal * 0.18;
  const costExclLWC = itemTotal + gst;
  const lwc = costExclLWC * 0.01;
  const costInclLWC = costExclLWC + lwc;
  const finalCost = Math.round(costInclLWC + contingency);

  /* ============ SAVE ESTIMATE ============ */
  const saveEstimate = async () => {
    if (!selectedWorkId) {
      alert("Please select a work first");
      return;
    }

    if (items.length === 0) {
      alert("Add items before saving");
      return;
    }

    if (estimateExists && !isEditing) {
      alert(
        "An estimate already exists for this work. Please edit the existing estimate or delete it first."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/work-estimate-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          workId: selectedWorkId,
        }),
      });

      if (response.ok) {
        const message = isEditing
          ? "Estimate updated successfully"
          : "Estimate saved successfully";
        alert(message);
        resetForm();
        setEstimateExists(true);
        setIsEditing(false);
        // Refetch the estimate for this work
        fetchExistingEstimate(selectedWorkId);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save estimate");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* EXISTING ESTIMATE ALERT */}
        <ExistingEstimateAlert
          estimateExists={estimateExists}
          initialLoad={initialLoad}
          selectedWorkId={selectedWorkId}
          isEditing={isEditing}
          existingEstimate={existingEstimate}
          setIsEditing={setIsEditing}
          setItems={setItems}
          setProjectInfo={setProjectInfo}
          setContingency={setContingency}
          resetForm={resetForm}
          fetchExistingEstimate={fetchExistingEstimate}
          setShowPreview={setShowPreview}
        />

        {/* HEADER */}
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* MAIN FORM SECTION */}
          <div className="lg:col-span-3 space-y-6">
            {estimateExists && !isEditing && selectedWorkId && (
              <Alert className="border-amber-300 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 ml-2">
                  Form is in view-only mode. Click Edit Estimate above to make
                  changes.
                </AlertDescription>
              </Alert>
            )}

            {/* WORK SELECTION */}
            <WorkSelectionCard
              works={works}
              selectedWorkId={selectedWorkId}
              loadingWorks={loadingWorks}
              workSelected={workSelected}
              projectInfo={projectInfo}
              handleWorkSelection={handleWorkSelection}
              isEditing={isEditing}
              estimateExists={estimateExists}
            />

            {/* PROJECT INFORMATION */}
            <ProjectInfoCard
              projectInfo={projectInfo}
              setProjectInfo={setProjectInfo}
              workSelected={workSelected}
            />

            {/* ADD ESTIMATE ITEM */}
            <AddEstimateItemCard
              form={form}
              setForm={setForm}
              addItem={(newItem) => setItems([...items, newItem])}
              estimateExists={estimateExists}
              isEditing={isEditing}
              setItems={setItems}
              items={items}
            />

            {/* ITEMS TABLE */}
            {items.length > 0 && (
              <ItemsTable
                items={items}
                deleteItem={(index) => {
                  setItems(
                    items
                      .filter((_, i) => i !== index)
                      .map((item, i) => ({ ...item, slNo: i + 1 }))
                  );
                }}
                estimateExists={estimateExists}
                isEditing={isEditing}
              />
            )}
          </div>

          {/* SIDEBAR - CALCULATIONS & ACTIONS */}
          <div className="space-y-6">
            {/* ABSTRACT ESTIMATE */}
            <AbstractEstimateCard
              items={items}
              contingency={contingency}
              setContingency={setContingency}
              estimateExists={estimateExists}
              isEditing={isEditing}
              itemTotal={itemTotal}
              gst={gst}
              costExclLWC={costExclLWC}
              lwc={lwc}
              costInclLWC={costInclLWC}
              finalCost={finalCost}
            />

            {/* ACTION BUTTONS */}
            <ActionButtons
              items={items}
              selectedWorkId={selectedWorkId}
              loading={loading}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              generatePDF={async () => {
                if (items.length === 0) {
                  alert("Add items before generating PDF");
                  return;
                }
                try {
                  setLoading(true);
                  const html2canvas = (await import("html2canvas")).default;
                  const jsPDF = (await import("jspdf")).jsPDF;

                  const element = document.getElementById("estimate-print");
                  if (!element) {
                    alert("Preview element not found");
                    return;
                  }

                  const canvas = await html2canvas(element, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                  });

                  const imgData = canvas.toDataURL("image/png");
                  const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4",
                  });

                  const imgWidth = 210;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;

                  let heightLeft = imgHeight;
                  let position = 0;

                  pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    position,
                    imgWidth,
                    imgHeight
                  );
                  heightLeft -= 297;

                  while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(
                      imgData,
                      "PNG",
                      0,
                      position,
                      imgWidth,
                      imgHeight
                    );
                    heightLeft -= 297;
                  }

                  const filename = `Estimate_${
                    projectInfo.projectCode || "draft"
                  }_${new Date().getTime()}.pdf`;
                  pdf.save(filename);
                } catch (error) {
                  console.error("Error generating PDF:", error);
                  alert("Error generating PDF");
                } finally {
                  setLoading(false);
                }
              }}
              handlePrint={() => {
                const element = document.getElementById("estimate-print");
                if (!element) {
                  alert("Preview element not found");
                  return;
                }

                const printWindow = window.open("", "", "height=500,width=800");
                if (!printWindow) {
                  alert("Please allow popups to print");
                  return;
                }

                printWindow.document.write(
                  "<html><head><title>Estimate</title>"
                );
                printWindow.document.write(
                  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">'
                );
                printWindow.document.write("</head><body>");
                printWindow.document.write(element.innerHTML);
                printWindow.document.write("</body></html>");
                printWindow.document.close();
                setTimeout(() => {
                  printWindow.print();
                }, 250);
              }}
              saveEstimate={saveEstimate}
              isEditing={isEditing}
            />
          </div>
        </div>

        {/* PRINT PREVIEW */}
        {showPreview && (
          <PrintPreview
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            projectInfo={projectInfo}
            items={items}
            contingency={contingency}
            itemTotal={itemTotal}
            gst={gst}
            costExclLWC={costExclLWC}
            lwc={lwc}
            costInclLWC={costInclLWC}
            finalCost={finalCost}
          />
        )}
      </div>
    </div>
  );
}
