// utils/numberToWords.js
export const convertToWords = (num: number) => {
  const a = [
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
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
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

  const formatNumber = (number: number): string => {
    if (number === 0) return "Zero";

    if (number < 0) {
      return "Minus " + formatNumber(-number);
    }

    let words = "";

    if (Math.floor(number / 10000000) > 0) {
      words += formatNumber(Math.floor(number / 10000000)) + " Crore ";
      number %= 10000000;
    }

    if (Math.floor(number / 100000) > 0) {
      words += formatNumber(Math.floor(number / 100000)) + " Lakh ";
      number %= 100000;
    }

    if (Math.floor(number / 1000) > 0) {
      words += formatNumber(Math.floor(number / 1000)) + " Thousand ";
      number %= 1000;
    }

    if (Math.floor(number / 100) > 0) {
      words += formatNumber(Math.floor(number / 100)) + " Hundred ";
      number %= 100;
    }

    if (number > 0) {
      if (words !== "") words += "and ";

      if (number < 20) {
        words += a[number];
      } else {
        words += b[Math.floor(number / 10)];
        if (number % 10 > 0) {
          words += "-" + a[number % 10];
        }
      }
    }

    return words.trim();
  };

  // Handle decimal part
  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  let result = formatNumber(wholePart);

  if (decimalPart > 0) {
    result += " and " + formatNumber(decimalPart) + " Paise";
  }

  return result;
};
