import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import WorkDetailsList from "./WorkDetailsList";
import AddWorkDetaisForm from "@/components/form/AddWorkDetaisForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

async function fetchWorkDetails(tenderId: string) {
  const workDetails = await db.nitDetails.findUnique({
    where: { id: tenderId },
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  if (!workDetails) {
    notFound();
  }

  return workDetails;
}

export default async function Page({ params }: PageProps) {
  const { tenderId } = await params;
  const workDetails = await fetchWorkDetails(tenderId);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 border-b pb-3 sm:pb-4 mb-6 sm:mb-8">
            Work Details Management
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 md:gap-8">
            <Card className="lg:w-1/2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl">
                  Add New Work Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddWorkDetaisForm tenderId={tenderId} />
              </CardContent>
            </Card>

            <Card className="lg:w-1/2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl">
                  Existing Work Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <WorkDetailsList workDetails={workDetails} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
