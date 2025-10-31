import { VisibleDataTable } from "@/components/visible-data-table";
import { columns } from "./columns";
import { SearchWorkbyNitNoForm } from "@/components/SearchWorkbyNitno";
import type { workdetailstype } from "@/types/worksdetails";
import { fetchworkdetailsbynitno } from "@/action/bookNitNuber";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";

interface WorkDetailsProps {
  nitNo?: string;
}

export async function WorkDetails({ nitNo }: WorkDetailsProps) {
  let work: workdetailstype[] = [];
  let estimatedTotal = 0;
  let awardedTotal = 0;

  try {
    if (nitNo) {
      const numericNitNo = Number(nitNo);
      if (isNaN(numericNitNo)) {
        throw new Error("Invalid NIT number");
      }

      work = await fetchworkdetailsbynitno(numericNitNo);

      // Calculate totals with proper type checking
      estimatedTotal = work.reduce((acc, curr) => {
        const amount = Number(curr.finalEstimateAmount) || 0;
        return acc + amount;
      }, 0);

      awardedTotal = work.reduce((acc, curr) => {
        const amount =
          Number(
            curr.AwardofContract?.workorderdetails?.[0]?.Bidagency
              ?.biddingAmount
          ) || 0;
        return acc + amount;
      }, 0);
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <SearchWorkbyNitNoForm />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {!nitNo ? (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">
                Search Required
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Please enter a NIT number to view work details
              </AlertDescription>
            </Alert>
          ) : work.length > 0 ? (
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Work Details for NIT: {nitNo}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Total Estimate
                      </div>
                      <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                        ₹{estimatedTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Total Awarded
                      </div>
                      <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        ₹{awardedTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <VisibleDataTable data={work} columns={columns} />
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
              <AlertDescription>
                No work details found for NIT number: {nitNo}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
