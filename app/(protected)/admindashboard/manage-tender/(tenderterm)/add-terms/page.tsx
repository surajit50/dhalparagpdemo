"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  order: z.coerce.number().int().nonnegative("Order must be a non-negative number").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fetchSuggestedOrder = async (category: string) => {
  const response = await fetch(`/api/tender-terms/last-order?category=${category}`);
  if (!response.ok) throw new Error("Failed to fetch suggested order");
  return response.json();
};

const createTerm = async (data: FormValues) => {
  const response = await fetch("/api/tender-terms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create term");
  return response.json();
};

const AddTermsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      title: "",
      content: "",
      order: undefined,
    },
  });

  // Fetch suggested order when category changes
  const { data: orderData } = useQuery({
    queryKey: ["suggested-order", category],
    queryFn: () => fetchSuggestedOrder(category),
    enabled: !!category,
  });

  const mutation = useMutation({
    mutationFn: createTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender-terms"] });
      toast.success("Term added successfully!");
      router.push("/admindashboard/manage-tender/manage-terms");
    },
    onError: () => {
      toast.error("Failed to add term");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
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
            Add New Tender Term
          </h1>
          <p className="text-gray-600 text-lg">
            Create a new term for tender documents
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Term Information
            </CardTitle>
            <CardDescription className="text-gray-500">
              Fill in the details for the new tender term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setCategory(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter display order"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                            value={field.value === undefined ? "" : field.value}
                            min="0"
                          />
                        </FormControl>
                        <FormDescription>
                          {orderData?.lastOrder !== undefined && !field.value
                            ? `Suggested order: ${orderData.lastOrder + 1}`
                            : "Lower numbers appear first"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter term title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the term content"
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed content for this term
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Term
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTermsPage;
