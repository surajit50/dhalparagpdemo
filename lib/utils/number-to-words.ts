// Convert number to Indian currency words
export function numberToWords(num: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertHundreds(n: number): string {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result.trim();
  }

  if (num === 0) return 'Zero';

  let result = '';
  const numStr = Math.floor(num).toString().padStart(9, '0');
  
  // Crores
  const crores = parseInt(numStr.substring(0, 2));
  if (crores > 0) {
    result += convertHundreds(crores) + ' Crore ';
  }
  
  // Lakhs
  const lakhs = parseInt(numStr.substring(2, 4));
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + ' Lakh ';
  }
  
  // Thousands
  const thousands = parseInt(numStr.substring(4, 6));
  if (thousands > 0) {
    result += convertHundreds(thousands) + ' Thousand ';
  }
  
  // Hundreds
  const hundreds = parseInt(numStr.substring(6, 9));
  if (hundreds > 0) {
    result += convertHundreds(hundreds);
  }

  return result.trim() || 'Zero';
}

