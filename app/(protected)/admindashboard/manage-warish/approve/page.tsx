import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/utils/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { warishcolref } from "@/components/table-col-ref/Warishapplication";
import { WarishApplicationProps } from "@/types";
async function getWarishApplications() {
  return (await db.warishApplication.findMany({
    where: {
      warishApplicationStatus: "pending",
    },
    orderBy: {
      reportingDate: "desc",
    },
  })) as WarishApplicationProps[];
}

export default async function PendingWarishApplications() {
  const applications = await getWarishApplications();

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Pending Warish Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <DataTable columns={warishcolref} data={applications} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
