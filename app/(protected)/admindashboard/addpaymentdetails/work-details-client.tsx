"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Edit, FileText, Building2, IndianRupee, Hash, Filter, X, MoreVertical, Trash2, CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { ShowNitDetails } from "@/components/ShowNitDetails"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {AddPaymentDetailsForm} from "@/components/form/AddPaymentDetails"
import { deletePaymentDetails, verifyPaymentDetails } from "@/action/payment-details"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface WorkDetailsClientProps {
  initialWorkDetails: any[]
  schemeNames: string[]
}

export function WorkDetailsClient({ initialWorkDetails, schemeNames }: WorkDetailsClientProps) {
  const router = useRouter()
  const [selectedScheme, setSelectedScheme] = useState<string>("all")
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Filter work details based on selected scheme
  const filteredWorkDetails = useMemo(() => {
    if (selectedScheme === "all") {
      return initialWorkDetails
    }
    return initialWorkDetails.filter((work) => work.ApprovedActionPlanDetails?.schemeName === selectedScheme)
  }, [initialWorkDetails, selectedScheme])

  // Calculate totals based on filtered data
  const totalWorks = filteredWorkDetails.length
  const totalAwardedValue = filteredWorkDetails.reduce((sum, work) => {
    const amount = work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0
    return sum + amount
  }, 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const clearFilter = () => {
    setSelectedScheme("all")
  }

  const handleAddPaymentClick = (workId: string) => {
    setSelectedWorkId(workId)
    setOpenDialog(true)
  }


  const handleDeletePaymentClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setOpenDeleteDialog(true)
  }

  const handleDeletePayment = async () => {
    if (!selectedPaymentId) return

    setIsDeleting(true)
    try {
      const result = await deletePaymentDetails(selectedPaymentId)
      
      if (result?.error) {
        toast.error("Failed to delete payment details", {
          description: result.error,
        })
      } else {
        toast.success("Payment details deleted successfully")
        router.refresh()
      }
    } catch (error) {
      toast.error("Failed to delete payment details")
    } finally {
      setIsDeleting(false)
      setOpenDeleteDialog(false)
      setSelectedPaymentId(null)
    }
  }

  const handleVerifyPayment = async (paymentId: string) => {
    setIsVerifying(true)
    try {
      const result = await verifyPaymentDetails(paymentId)
      
      if (result?.error) {
        toast.error("Failed to verify payment details", {
          description: result.error,
        })
      } else {
        toast.success("Payment details verified successfully")
        router.refresh()
      }
    } catch (error) {
      toast.error("Failed to verify payment details")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Filter Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Filter Works</h3>
                <p className="text-sm text-purple-600">Filter by scheme name</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue placeholder="Select scheme name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schemes</SelectItem>
                  {schemeNames.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedScheme !== "all" && (
                <Button variant="outline" size="sm" onClick={clearFilter} className="bg-white hover:bg-gray-50">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          {selectedScheme !== "all" && (
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-sm text-purple-700">
                <strong>Active Filter:</strong> Showing works for scheme &quot;{selectedScheme}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  {selectedScheme === "all" ? "Total Works" : "Filtered Works"}
                </p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">{totalWorks}</h3>
                {selectedScheme !== "all" && (
                  <p className="text-xs text-blue-500 mt-1">of {initialWorkDetails.length} total works</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  {selectedScheme === "all" ? "Total Awarded Value" : "Filtered Awarded Value"}
                </p>
                <h3 className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalAwardedValue)}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Work Details
                {selectedScheme !== "all" && (
                  <span className="text-blue-200 text-lg font-normal ml-2">- {selectedScheme}</span>
                )}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {selectedScheme === "all"
                  ? "Overview of all ongoing projects with awarded contracts"
                  : `Projects filtered by scheme: ${selectedScheme}`}
              </CardDescription>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="p-4 font-semibold text-gray-700">SL No</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">NIT Details</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Work Name</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Scheme Name</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Agency Name</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Awarded Cost</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Payment Details</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkDetails.length > 0 ? (
                  filteredWorkDetails.map((work, index) => (
                    <TableRow key={work.id} className="hover:bg-gray-50/50">
                      <TableCell className="p-4">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <ShowNitDetails
                          nitdetails={work.nitDetails.memoNumber}
                          memoDate={work.nitDetails.memoDate}
                          workslno={work.workslno}
                        />
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        {work.ApprovedActionPlanDetails?.activityDescription}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {work.ApprovedActionPlanDetails?.schemeName || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        {work.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails?.name}
                      </TableCell>
                      <TableCell className="p-4 font-semibold text-green-700">
                        {formatCurrency(work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0)}
                      </TableCell>
                      <TableCell className="p-4">
                        {work.paymentDetails && work.paymentDetails.length > 0 ? (
                          <div className="space-y-2">
                            {work.paymentDetails.map((payment: any) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {payment.billType} - {payment.mbrefno}
                                    </span>
                                    {payment.isVerified && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Net: {formatCurrency(payment.netAmt)}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      disabled={isVerifying}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild disabled={payment.isVerified}>
                                      <Link
                                        href={`/admindashboard/editpaymentdetails?paymentId=${payment.id}`}
                                        className={payment.isVerified ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePaymentClick(payment.id)}
                                      disabled={payment.isVerified}
                                      className={payment.isVerified ? "opacity-50 cursor-not-allowed" : "text-red-600"}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild disabled={payment.isVerified || isVerifying}>
                                      <Link
                                        href={`/admindashboard/verifypaymentdetails?paymentId=${payment.id}`}
                                        className={payment.isVerified ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {payment.isVerified ? "Verified" : "Verify"}
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No payment details</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog open={openDialog && selectedWorkId === work.id} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              onClick={() => handleAddPaymentClick(work.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Add Payment
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Add Payment Details</DialogTitle>
                              <div className="text-sm text-gray-500">
                                Work: {work.ApprovedActionPlanDetails?.activityDescription}
                              </div>
                            </DialogHeader>
                            <div className="py-4">
                              {selectedWorkId && (
                                <AddPaymentDetailsForm 
                                  workId={selectedWorkId}
                                  awardedCost={work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0}
                                  onSuccess={() => {
                                    setOpenDialog(false)
                                    router.refresh()
                                  }}
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>


                        {/* Delete Confirmation Dialog */}
                        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the payment details
                                and all associated records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeletePayment}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg">
                          {selectedScheme === "all"
                            ? "No work details found"
                            : `No work details found for scheme ${selectedScheme}`}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {selectedScheme === "all"
                            ? "Add new work details to get started"
                            : "Try selecting a different scheme or clear the filter"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
