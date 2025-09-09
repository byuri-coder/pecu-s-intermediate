
// A simple utility to convert numbers to words in Portuguese (for currency)
// This is a simplified version and may not cover all edge cases.

const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const teens = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function convertThreeDigits(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";

    let words = [];
    let h = Math.floor(n / 100);
    let t = Math.floor((n % 100) / 10);
    let u = n % 10;

    if (h > 0) {
        words.push(hundreds[h]);
    }

    if (t > 0 || u > 0) {
        if (h > 0) words.push("e");
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

export function numberToWords(num: number): string {
    if (num === null || num === undefined) return "";
    if (num === 0) return "zero";

    const integerPart = Math.floor(num);
    const fractionalPart = Math.round((num - integerPart) * 100);

    let integerWords = "";
    if (integerPart > 0) {
        const thousands = Math.floor(integerPart / 1000);
        const rest = integerPart % 1000;
        
        let words = [];
        if (thousands > 0) {
            words.push(convertThreeDigits(thousands) + " mil");
        }
        if (rest > 0) {
            words.push(convertThreeDigits(rest));
        }
        integerWords = words.join(thousands > 0 && rest > 0 ? " e " : "");
    }
    
    let currencyUnit = integerPart === 1 ? "real" : "reais";
    if (integerPart === 0) currencyUnit = "";

    let fractionalWords = "";
    if (fractionalPart > 0) {
        fractionalWords = " e " + convertThreeDigits(fractionalPart) + (fractionalPart === 1 ? " centavo" : " centavos");
    }
    
    if(integerPart === 0 && fractionalPart > 0) {
       return `${convertThreeDigits(fractionalPart)} ${fractionalPart === 1 ? "centavo" : "centavos"}`;
    }

    return `${integerWords} ${currencyUnit}${fractionalWords}`;
}
