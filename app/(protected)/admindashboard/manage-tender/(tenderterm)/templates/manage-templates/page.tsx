"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

type Template = {
  id: string;
  name: string;
  description?: string | null;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const fetchTemplates = async (): Promise<Template[]> => {
  const res = await fetch("/api/tender-term-templates");
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
};

const deleteTemplate = async (id: string) => {
  const res = await fetch(`/api/tender-term-templates/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete template");
  return res.json();
};

export default function ManageTemplatesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tender-term-templates"],
    queryFn: fetchTemplates,
  });

  const del = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tender-term-templates"] });
      toast.success("Template deleted");
    },
    onError: () => toast.error("Failed to delete template"),
  });

  const filtered = templates.filter((t) =>
    [t.name, t.description ?? "", t.content].some((f) =>
      f.toLowerCase().includes(q.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tender Term Templates
            </h1>
            <p className="text-gray-600">
              Create and reuse standard conditions
            </p>
          </div>
          <Button asChild>
            <Link href="/admindashboard/manage-tender/templates/add-template">
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search templates..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="ghost" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-red-600"
                      >
                        Failed to load
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No templates
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((tpl) => (
                      <TableRow key={tpl.id}>
                        <TableCell className="font-medium">
                          {tpl.name}
                        </TableCell>
                        <TableCell className="max-w-xl truncate text-gray-600">
                          {tpl.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tpl.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {tpl.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admindashboard/manage-tender/templates/edit-template/${tpl.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => del.mutate(tpl.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
