import React from "react";
import { toWords } from "number-to-words";

const AmountInWords = ({ amount, currency = "Indian Rupee" }) => {
  if (typeof amount !== "number" || isNaN(amount)) return null;

  const integerPart = Math.floor(amount);
  const words = toWords(integerPart);

  return (
    <span>
      {currency} {words.replace(/\b\w/g, (l) => l.toUpperCase())} Only
    </span>
  );
};

export default AmountInWords;
