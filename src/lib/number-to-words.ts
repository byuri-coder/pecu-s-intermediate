// A simple utility to convert numbers to words in Portuguese (for currency)
// This is a simplified version and may not cover all edge cases.

const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const teens = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function convertThreeDigits(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";

    let words: string[] = [];
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) {
        words.push(hundreds[h]);
    }

    if (t > 0 || u > 0) {
        if (h > 0 && (t > 0 || u > 0)) words.push("e");
        if (t === 1) {
            words.push(teens[u]);
        } else {
            if (t > 1) {
                words.push(tens[t]);
            }
            if (u > 0) {
                if (t > 1) words.push("e");
                words.push(units[u]);
            }
        }
    }
    return words.join(" ");
}

function convertToWords(num: number): string {
    if (num === 0) return "zero";

    const parts: string[] = [];
    const bilhao = Math.floor(num / 1000000000);
    const milhao = Math.floor((num % 1000000000) / 1000000);
    const mil = Math.floor((num % 1000000) / 1000);
    const resto = num % 1000;

    if (bilhao > 0) {
        parts.push(convertThreeDigits(bilhao) + (bilhao === 1 ? " bilhão" : " bilhões"));
    }
    if (milhao > 0) {
        parts.push(convertThreeDigits(milhao) + (milhao === 1 ? " milhão" : " milhões"));
    }
    if (mil > 0) {
      if (mil === 1 && (num < 2000 || num % 1000 === 0)) {
         parts.push("mil");
      } else {
         parts.push(convertThreeDigits(mil) + " mil");
      }
    }
    if (resto > 0) {
        parts.push(convertThreeDigits(resto));
    }
    return parts.join(" e ");
}


export function numberToWords(num: number): string {
    if (num === null || num === undefined) return "";
    if (num === 0) return "zero reais";

    const integerPart = Math.floor(num);
    const fractionalPart = Math.round((num - integerPart) * 100);

    let result = "";

    if (integerPart > 0) {
        result += convertToWords(integerPart);
        result += integerPart === 1 ? " real" : " reais";
    }

    if (fractionalPart > 0) {
        if (integerPart > 0) {
            result += " e ";
        }
        result += convertToWords(fractionalPart);
        result += fractionalPart === 1 ? " centavo" : " centavos";
    }

    return result.trim();
}
