import BookNitForm from "@/components/form/BookNitForm";
import Link from "next/link";
import { Eye, Pencil, ChevronRight, Search, Filter } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import { NITCopy } from "@/components/PrintTemplet/PrintNIt-copy";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const CreateTender = async () => {
  const latestNits = await db.nitDetails.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create New Tender
          </h1>
          <p className="text-gray-600 text-lg">
            Fill in the required details to publish a new tender
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Tender Information
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Please provide complete and accurate details
                  </p>
                </div>
                <BookNitForm />
              </CardContent>
            </Card>
          </div>

          {/* Recent NITs Section */}
          <div className="lg:col-span-5">
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-semibold">
                  Recent Tenders
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Last 10 created tender notices
                </CardDescription>
                <div className="flex items-center gap-2 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search tenders..."
                      className="w-full pl-8"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuCheckboxItem checked>
                        All
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Published
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Drafts
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Memo Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestNits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No NITs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      latestNits.map((nit) => (
                        <TableRow key={nit.id} className="group">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {nit.memoNumber}/DGP/{nit.memoDate.getFullYear()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(nit.createdAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={nit.isPublished ? "default" : "secondary"}
                              className={
                                nit.isPublished
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              }
                            >
                              {nit.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {!nit.isPublished && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Link
                                    href={`/admindashboard/manage-tender/add/${nit.id}`}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                              >
                                <Link
                                  href={`/admindashboard/manage-tender/view/${nit.id}`}
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Link>
                              </Button>
                              <NITCopy nitdetails={nit} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="border-t p-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admindashboard/manage-tender/view">
                      View All Tenders
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTender;
