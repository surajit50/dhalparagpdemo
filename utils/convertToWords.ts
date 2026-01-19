export function convertToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero";

  let parts: string[] = [];
  let scaleIndex = 0;

  while (num > 0) {
    if (scaleIndex === 0) {
      const hundreds = num % 1000;
      if (hundreds > 0) {
        let part = "";
        const h = Math.floor(hundreds / 100);
        if (h > 0) part += ones[h] + " Hundred ";
        const remainder = hundreds % 100;
        if (remainder >= 20) {
          part +=
            tens[Math.floor(remainder / 10)] +
            (remainder % 10 > 0 ? " " + ones[remainder % 10] : "");
        } else if (remainder > 0) {
          part += ones[remainder];
        }
        if (part) parts.unshift(part.trim());
      }
      num = Math.floor(num / 1000);
    } else {
      const chunk = num % (scaleIndex === 1 ? 100 : 100);
      if (chunk > 0) {
        let part = "";
        if (chunk >= 20) {
          part =
            tens[Math.floor(chunk / 10)] +
            (chunk % 10 > 0 ? " " + ones[chunk % 10] : "");
        } else if (chunk > 0) {
          part = ones[chunk];
        }
        if (part) parts.unshift(part.trim() + " " + scales[scaleIndex]);
      }
      num = Math.floor(num / (scaleIndex === 1 ? 100 : 100));
    }
    scaleIndex++;
  }

  return parts.join(" ").trim();
}
