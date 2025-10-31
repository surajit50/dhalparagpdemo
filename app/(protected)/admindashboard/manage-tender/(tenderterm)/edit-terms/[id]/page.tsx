"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TenderTerm {
  id: string;
  category: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const EditTermsPage = () => {
  const router = useRouter();
  const params = useParams();
  const termId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    content: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (termId) {
      fetchTerm();
    }
  }, [termId]);

  const fetchTerm = async () => {
    try {
      const response = await fetch(`/api/tender-terms/${termId}`);
      if (response.ok) {
        const term: TenderTerm = await response.json();
        setFormData({
          category: term.category,
          title: term.title,
          content: term.content,
          order: term.order,
          isActive: term.isActive,
        });
      } else {
        toast.error("Failed to fetch term details");
        router.push("/admindashboard/manage-tender/manage-terms");
      }
    } catch (error) {
      console.error("Error fetching term:", error);
      toast.error("An error occurred while fetching the term");
      router.push("/admindashboard/manage-tender/manage-terms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/tender-terms/${termId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Term updated successfully!");
        router.push("/admindashboard/manage-tender/manage-terms");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update term");
      }
    } catch (error) {
      console.error("Error updating term:", error);
      toast.error("An error occurred while updating the term");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      isActive: value === "true",
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admindashboard/manage-tender/manage-terms">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Terms Management
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Edit Tender Term
          </h1>
          <p className="text-gray-600 text-lg">
            Update the tender term details
          </p>
        </div>

        {/* Form Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Term Information
            </CardTitle>
            <CardDescription className="text-gray-500">
              Update the details for this tender term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                      <SelectItem value="QUALIFICATION_CRITERIA">
                        Qualification Criteria
                      </SelectItem>
                      <SelectItem value="TERMS_CONDITIONS">
                        Terms & Conditions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-sm text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter term title"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.isActive.toString()}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter the term content"
                  rows={8}
                  required
                />
                <p className="text-sm text-gray-500">
                  Provide detailed content for this term
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Term
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditTermsPage;
