import { db } from "@/lib/db"
import { EditPaymentDetailsClient } from "./edit-payment-details-client"

async function fetchPaymentDetails() {
  try {
    return await db.paymentDetails.findMany({
      
      include: {
        WorksDetail: {
          include: {
            nitDetails: true,
            ApprovedActionPlanDetails: true,
            AwardofContract: {
              include: {
                workorderdetails: {
                  include: {
                    Bidagency: { include: { agencydetails: true } },
                  },
                },
              },
            },
          },
        },
        lessIncomeTax: true,
        lessLabourWelfareCess: true,
        lessTdsCgst: true,
        lessTdsSgst: true,
        securityDeposit: true,
      },
      orderBy: { billPaymentDate: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch payment details:", error)
    throw new Error("Failed to fetch payment details. Please try again later.")
  }
}

async function fetchSchemeNames() {
  try {
    const schemes = await db.approvedActionPlanDetails.findMany({
      select: {
        schemeName: true,
      },
      distinct: ["schemeName"],
      where: {
        schemeName: {
          not: ""
        },
      },
      orderBy: {
        schemeName: "asc",
      },
    })
    return schemes.map((scheme) => scheme.schemeName).filter((name): name is string => name !== null && name !== "")
  } catch (error) {
    console.error("Failed to fetch scheme names:", error)
    return []
  }
}

export default async function EditPaymentDetailsPage() {
  const [paymentDetails, schemeNames] = await Promise.all([fetchPaymentDetails(), fetchSchemeNames()])

  return <EditPaymentDetailsClient initialPaymentDetails={paymentDetails} schemeNames={schemeNames} />
}

