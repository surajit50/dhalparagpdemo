"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, Building2, IndianRupee, Hash, Filter, X, ArrowLeft, Eye, Trash2 } from "lucide-react"
import { ShowNitDetails } from "@/components/ShowNitDetails"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { verifyPaymentDetails, deletePaymentDetails } from "@/action/payment-details"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface VerifyPaymentDetailsClientProps {
  initialPaymentDetails: any[]
  schemeNames: string[]
}

export function VerifyPaymentDetailsClient({ initialPaymentDetails, schemeNames }: VerifyPaymentDetailsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedScheme, setSelectedScheme] = useState<string>("all")
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle paymentId from query params
  useEffect(() => {
    const paymentId = searchParams.get("paymentId")
    if (paymentId) {
      setSelectedPaymentId(paymentId)
      setOpenVerifyDialog(true)
    }
  }, [searchParams])

  // Filter payment details based on selected scheme
  const filteredPaymentDetails = useMemo(() => {
    if (selectedScheme === "all") {
      return initialPaymentDetails
    }
    return initialPaymentDetails.filter(
      (payment) => payment.WorksDetail?.ApprovedActionPlanDetails?.schemeName === selectedScheme
    )
  }, [initialPaymentDetails, selectedScheme])

  // Calculate totals based on filtered data
  const totalPayments = filteredPaymentDetails.length
  const totalNetAmount = filteredPaymentDetails.reduce((sum, payment) => {
    return sum + (payment.netAmt || 0)
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

  const handleViewClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setOpenViewDialog(true)
  }

  const handleVerifyClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setOpenVerifyDialog(true)
  }

  const handleVerify = async () => {
    if (!selectedPaymentId) return

    setIsVerifying(true)
    try {
      const result = await verifyPaymentDetails(selectedPaymentId)
      
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
      setOpenVerifyDialog(false)
      setSelectedPaymentId(null)
    }
  }

  const handleDeleteClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setOpenDeleteDialog(true)
  }

  const handleDelete = async () => {
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

  const selectedPayment = selectedPaymentId
    ? filteredPaymentDetails.find((p) => p.id === selectedPaymentId)
    : null

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Payment Details</h1>
          <p className="text-gray-600 mt-1">Review and verify payment details for works</p>
        </div>
        <Link href="/admindashboard/addpaymentdetails">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Add Payment
          </Button>
        </Link>
      </div>

      {/* Filter Section */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Filter className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Filter Payments</h3>
                <p className="text-sm text-green-600">Filter by scheme name</p>
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
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Active Filter:</strong> Showing payments for scheme &quot;{selectedScheme}&quot;
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
                  {selectedScheme === "all" ? "Pending Verification" : "Filtered Payments"}
                </p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">{totalPayments}</h3>
                {selectedScheme !== "all" && (
                  <p className="text-xs text-blue-500 mt-1">of {initialPaymentDetails.length} total payments</p>
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
                  {selectedScheme === "all" ? "Total Net Amount" : "Filtered Net Amount"}
                </p>
                <h3 className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalNetAmount)}</h3>
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
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Payment Details Pending Verification
                {selectedScheme !== "all" && (
                  <span className="text-green-200 text-lg font-normal ml-2">- {selectedScheme}</span>
                )}
              </CardTitle>
              <CardDescription className="text-green-100">
                {selectedScheme === "all"
                  ? "List of all unverified payment details awaiting verification"
                  : `Payments filtered by scheme: ${selectedScheme}`}
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
                  <TableHead className="p-4 font-semibold text-gray-700">Bill Type</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">MB Ref No</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Net Amount</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaymentDetails.length > 0 ? (
                  filteredPaymentDetails.map((payment, index) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50/50">
                      <TableCell className="p-4">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <ShowNitDetails
                          nitdetails={payment.WorksDetail?.nitDetails?.memoNumber}
                          memoDate={payment.WorksDetail?.nitDetails?.memoDate}
                          workslno={payment.WorksDetail?.workslno}
                        />
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        {payment.WorksDetail?.ApprovedActionPlanDetails?.activityDescription}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {payment.WorksDetail?.ApprovedActionPlanDetails?.schemeName || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {payment.billType}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        {payment.mbrefno}
                      </TableCell>
                      <TableCell className="p-4 font-semibold text-green-700">
                        {formatCurrency(payment.netAmt || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            onClick={() => handleViewClick(payment.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                            onClick={() => handleVerifyClick(payment.id)}
                            disabled={isVerifying || isDeleting}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="hover:bg-red-700 transition-colors"
                            onClick={() => handleDeleteClick(payment.id)}
                            disabled={isVerifying || isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
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
                            ? "No unverified payment details found"
                            : `No payment details found for scheme ${selectedScheme}`}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {selectedScheme === "all"
                            ? "All payment details have been verified or no payments exist"
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

      {/* View Payment Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Payment Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Work Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPayment.WorksDetail?.ApprovedActionPlanDetails?.activityDescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Scheme Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPayment.WorksDetail?.ApprovedActionPlanDetails?.schemeName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bill Type</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedPayment.billType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">MB Reference No</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedPayment.mbrefno}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gross Bill Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(selectedPayment.grossBillAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Net Amount</p>
                    <p className="text-sm font-semibold text-green-700">
                      {formatCurrency(selectedPayment.netAmt || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bill Payment Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedPayment.billPaymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Work Completion Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPayment.workcompletaitiondate
                        ? new Date(selectedPayment.workcompletaitiondate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Deductions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Income Tax</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.lessIncomeTax?.incomeTaaxAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Labour Welfare Cess</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.lessLabourWelfareCess?.labourWelfarecessAmt || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">TDS CGST</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.lessTdsCgst?.tdscgstAmt || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">TDS SGST</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.lessTdsSgst?.tdsSgstAmt || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Security Deposit</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.securityDeposit?.securityDepositAmt || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Voucher Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">eGram Voucher</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedPayment.eGramVoucher}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">eGram Voucher Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedPayment.eGramVoucherDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">GPMS Voucher Number</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedPayment.gpmsVoucherNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">GPMS Voucher Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedPayment.gpmsVoucherDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Confirmation Dialog */}
      <AlertDialog open={openVerifyDialog} onOpenChange={setOpenVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Payment Details?</AlertDialogTitle>
            <AlertDialogDescription>
              Once verified, this payment details cannot be edited or deleted. Are you sure you want to verify this payment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Details?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment details and all associated records. Are you sure you want to delete this payment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

