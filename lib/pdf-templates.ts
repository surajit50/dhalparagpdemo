import { Template, BLANK_PDF } from "@pdfme/common";

export const mbTemplate: Template = {
  basePdf: BLANK_PDF,
  schemas: [
    {
      mbNumber: {
        type: "text",
        position: { x: 20, y: 20 },
        width: 40,
        height: 10,
      },
      pageNumber: {
        type: "text",
        position: { x: 150, y: 20 },
        width: 40,
        height: 10,
      },
      workName: {
        type: "text",
        position: { x: 20, y: 35 },
        width: 170,
        height: 10,
      },
      table: {
        type: "table",
        position: { x: 20, y: 50 },
        width: 170,
        height: 200,
        columns: [
          { name: "slNo", width: 10 },
          { name: "description", width: 60 },
          { name: "measurements", width: 60 }, // This might need custom rendering or formatting
          { name: "quantity", width: 20 },
          { name: "unit", width: 10 },
          { name: "rate", width: 20 },
          { name: "amount", width: 30 },
        ],
        head: [
          "Sl No",
          "Description",
          "Measurements",
          "Quantity",
          "Unit",
          "Rate",
          "Amount",
        ],
      },
      totalAmount: {
        type: "text",
        position: { x: 150, y: 260 },
        width: 40,
        height: 10,
      },
    },
  ],
};

export const billAbstractTemplate: Template = {
  basePdf: BLANK_PDF,
  schemas: [
    {
      billNumber: {
        type: "text",
        position: { x: 20, y: 20 },
        width: 40,
        height: 10,
      },
      date: {
        type: "text",
        position: { x: 150, y: 20 },
        width: 40,
        height: 10,
      },
      workName: {
        type: "text",
        position: { x: 20, y: 35 },
        width: 170,
        height: 10,
      },
      table: {
        type: "table",
        position: { x: 20, y: 50 },
        width: 170,
        height: 200,
        columns: [
          { name: "slNo", width: 10 },
          { name: "description", width: 80 },
          { name: "quantity", width: 20 },
          { name: "unit", width: 10 },
          { name: "rate", width: 20 },
          { name: "amount", width: 30 },
        ],
        head: [
          "Sl No",
          "Description",
          "Quantity",
          "Unit",
          "Rate",
          "Amount",
        ],
      },
      totalAmount: {
        type: "text",
        position: { x: 150, y: 260 },
        width: 40,
        height: 10,
      },
    },
  ],
};

export const billDeductionTemplate: Template = {
  basePdf: BLANK_PDF,
  schemas: [
    {
      billNumber: {
        type: "text",
        position: { x: 20, y: 20 },
        width: 40,
        height: 10,
      },
      date: {
        type: "text",
        position: { x: 150, y: 20 },
        width: 40,
        height: 10,
      },
      workName: {
        type: "text",
        position: { x: 20, y: 35 },
        width: 170,
        height: 10,
      },
      grossAmount: {
        type: "text",
        position: { x: 100, y: 50 },
        width: 50,
        height: 10,
      },
      deductionsTable: {
        type: "table",
        position: { x: 20, y: 70 },
        width: 170,
        height: 150,
        columns: [
          { name: "description", width: 100 },
          { name: "amount", width: 50 },
        ],
        head: ["Deduction Type", "Amount"],
      },
      netAmount: {
        type: "text",
        position: { x: 150, y: 230 },
        width: 40,
        height: 10,
      },
    },
  ],
};
