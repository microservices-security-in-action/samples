/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NumberFormatStyle, NumberSymbol, getLocaleNumberFormat, getLocaleNumberSymbol, getNumberOfCurrencyDigits } from './locale_data_api';
export var NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
var MAX_DIGITS = 22;
var DECIMAL_SEP = '.';
var ZERO_CHAR = '0';
var PATTERN_SEP = ';';
var GROUP_SEP = ',';
var DIGIT_CHAR = '#';
var CURRENCY_CHAR = '¤';
var PERCENT_CHAR = '%';
/**
 * Transforms a number to a locale string based on a style and a format.
 */
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent) {
    if (isPercent === void 0) { isPercent = false; }
    var formattedText = '';
    var isZero = false;
    if (!isFinite(value)) {
        formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
    }
    else {
        var parsedNumber = parseNumber(value);
        if (isPercent) {
            parsedNumber = toPercent(parsedNumber);
        }
        var minInt = pattern.minInt;
        var minFraction = pattern.minFrac;
        var maxFraction = pattern.maxFrac;
        if (digitsInfo) {
            var parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
            if (parts === null) {
                throw new Error(digitsInfo + " is not a valid digit info");
            }
            var minIntPart = parts[1];
            var minFractionPart = parts[3];
            var maxFractionPart = parts[5];
            if (minIntPart != null) {
                minInt = parseIntAutoRadix(minIntPart);
            }
            if (minFractionPart != null) {
                minFraction = parseIntAutoRadix(minFractionPart);
            }
            if (maxFractionPart != null) {
                maxFraction = parseIntAutoRadix(maxFractionPart);
            }
            else if (minFractionPart != null && minFraction > maxFraction) {
                maxFraction = minFraction;
            }
        }
        roundNumber(parsedNumber, minFraction, maxFraction);
        var digits = parsedNumber.digits;
        var integerLen = parsedNumber.integerLen;
        var exponent = parsedNumber.exponent;
        var decimals = [];
        isZero = digits.every(function (d) { return !d; });
        // pad zeros for small numbers
        for (; integerLen < minInt; integerLen++) {
            digits.unshift(0);
        }
        // pad zeros for small numbers
        for (; integerLen < 0; integerLen++) {
            digits.unshift(0);
        }
        // extract decimals digits
        if (integerLen > 0) {
            decimals = digits.splice(integerLen, digits.length);
        }
        else {
            decimals = digits;
            digits = [0];
        }
        // format the integer digits with grouping separators
        var groups = [];
        if (digits.length >= pattern.lgSize) {
            groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
        }
        while (digits.length > pattern.gSize) {
            groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
        }
        if (digits.length) {
            groups.unshift(digits.join(''));
        }
        formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
        // append the decimal digits
        if (decimals.length) {
            formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
        }
        if (exponent) {
            formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
        }
    }
    if (value < 0 && !isZero) {
        formattedText = pattern.negPre + formattedText + pattern.negSuf;
    }
    else {
        formattedText = pattern.posPre + formattedText + pattern.posSuf;
    }
    return formattedText;
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param currency A string containing the currency symbol or its name,
 * such as "$" or "Canadian Dollar". Used in output string, but does not affect the operation
 * of the function.
 * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 * currency code, such as `USD` for the US dollar and `EUR` for the euro.
 * Used to determine the number of digits in the decimal part.
 * @param digitInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted currency value.
 *
 * @see `formatNumber()`
 * @see `DecimalPipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
    var format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
    var pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    pattern.minFrac = getNumberOfCurrencyDigits(currencyCode);
    pattern.maxFrac = pattern.minFrac;
    var res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
    return res
        .replace(CURRENCY_CHAR, currency)
        // if we have 2 time the currency character, the second one is ignored
        .replace(CURRENCY_CHAR, '')
        // If there is a spacing between currency character and the value and
        // the currency character is supressed by passing an empty string, the
        // spacing character would remain as part of the string. Then we
        // should remove it.
        .trim();
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted percentage value.
 *
 * @see `formatNumber()`
 * @see `DecimalPipe`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * @publicApi
 *
 */
export function formatPercent(value, locale, digitsInfo) {
    var format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
    var pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    var res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
    return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as text, with group sizing, separator, and other
 * parameters based on the locale.
 *
 * @param value The number to format.
 * @param locale A locale code for the locale format rules to use.
 * @param digitInfo Decimal representation options, specified by a string in the following format:
 * `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`. See `DecimalPipe` for more details.
 *
 * @returns The formatted text string.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 *
 * @publicApi
 */
export function formatNumber(value, locale, digitsInfo) {
    var format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
    var pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
function parseNumberFormat(format, minusSign) {
    if (minusSign === void 0) { minusSign = '-'; }
    var p = {
        minInt: 1,
        minFrac: 0,
        maxFrac: 0,
        posPre: '',
        posSuf: '',
        negPre: '',
        negSuf: '',
        gSize: 0,
        lgSize: 0
    };
    var patternParts = format.split(PATTERN_SEP);
    var positive = patternParts[0];
    var negative = patternParts[1];
    var positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ?
        positive.split(DECIMAL_SEP) :
        [
            positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
            positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)
        ], integer = positiveParts[0], fraction = positiveParts[1] || '';
    p.posPre = integer.substr(0, integer.indexOf(DIGIT_CHAR));
    for (var i = 0; i < fraction.length; i++) {
        var ch = fraction.charAt(i);
        if (ch === ZERO_CHAR) {
            p.minFrac = p.maxFrac = i + 1;
        }
        else if (ch === DIGIT_CHAR) {
            p.maxFrac = i + 1;
        }
        else {
            p.posSuf += ch;
        }
    }
    var groups = integer.split(GROUP_SEP);
    p.gSize = groups[1] ? groups[1].length : 0;
    p.lgSize = (groups[2] || groups[1]) ? (groups[2] || groups[1]).length : 0;
    if (negative) {
        var trunkLen = positive.length - p.posPre.length - p.posSuf.length, pos = negative.indexOf(DIGIT_CHAR);
        p.negPre = negative.substr(0, pos).replace(/'/g, '');
        p.negSuf = negative.substr(pos + trunkLen).replace(/'/g, '');
    }
    else {
        p.negPre = minusSign + p.posPre;
        p.negSuf = p.posSuf;
    }
    return p;
}
// Transforms a parsed number into a percentage by multiplying it by 100
function toPercent(parsedNumber) {
    // if the number is 0, don't do anything
    if (parsedNumber.digits[0] === 0) {
        return parsedNumber;
    }
    // Getting the current number of decimals
    var fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
    if (parsedNumber.exponent) {
        parsedNumber.exponent += 2;
    }
    else {
        if (fractionLen === 0) {
            parsedNumber.digits.push(0, 0);
        }
        else if (fractionLen === 1) {
            parsedNumber.digits.push(0);
        }
        parsedNumber.integerLen += 2;
    }
    return parsedNumber;
}
/**
 * Parses a number.
 * Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/
 */
function parseNumber(num) {
    var numStr = Math.abs(num) + '';
    var exponent = 0, digits, integerLen;
    var i, j, zeros;
    // Decimal point?
    if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
        numStr = numStr.replace(DECIMAL_SEP, '');
    }
    // Exponential form?
    if ((i = numStr.search(/e/i)) > 0) {
        // Work out the exponent.
        if (integerLen < 0)
            integerLen = i;
        integerLen += +numStr.slice(i + 1);
        numStr = numStr.substring(0, i);
    }
    else if (integerLen < 0) {
        // There was no decimal point or exponent so it is an integer.
        integerLen = numStr.length;
    }
    // Count the number of leading zeros.
    for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) { /* empty */
    }
    if (i === (zeros = numStr.length)) {
        // The digits are all zero.
        digits = [0];
        integerLen = 1;
    }
    else {
        // Count the number of trailing zeros
        zeros--;
        while (numStr.charAt(zeros) === ZERO_CHAR)
            zeros--;
        // Trailing zeros are insignificant so ignore them
        integerLen -= i;
        digits = [];
        // Convert string to array of digits without leading/trailing zeros.
        for (j = 0; i <= zeros; i++, j++) {
            digits[j] = Number(numStr.charAt(i));
        }
    }
    // If the number overflows the maximum allowed digits then use an exponent.
    if (integerLen > MAX_DIGITS) {
        digits = digits.splice(0, MAX_DIGITS - 1);
        exponent = integerLen - 1;
        integerLen = 1;
    }
    return { digits: digits, exponent: exponent, integerLen: integerLen };
}
/**
 * Round the parsed number to the specified number of decimal places
 * This function changes the parsedNumber in-place
 */
function roundNumber(parsedNumber, minFrac, maxFrac) {
    if (minFrac > maxFrac) {
        throw new Error("The minimum number of digits after fraction (" + minFrac + ") is higher than the maximum (" + maxFrac + ").");
    }
    var digits = parsedNumber.digits;
    var fractionLen = digits.length - parsedNumber.integerLen;
    var fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
    // The index of the digit to where rounding is to occur
    var roundAt = fractionSize + parsedNumber.integerLen;
    var digit = digits[roundAt];
    if (roundAt > 0) {
        // Drop fractional digits beyond `roundAt`
        digits.splice(Math.max(parsedNumber.integerLen, roundAt));
        // Set non-fractional digits beyond `roundAt` to 0
        for (var j = roundAt; j < digits.length; j++) {
            digits[j] = 0;
        }
    }
    else {
        // We rounded to zero so reset the parsedNumber
        fractionLen = Math.max(0, fractionLen);
        parsedNumber.integerLen = 1;
        digits.length = Math.max(1, roundAt = fractionSize + 1);
        digits[0] = 0;
        for (var i = 1; i < roundAt; i++)
            digits[i] = 0;
    }
    if (digit >= 5) {
        if (roundAt - 1 < 0) {
            for (var k = 0; k > roundAt; k--) {
                digits.unshift(0);
                parsedNumber.integerLen++;
            }
            digits.unshift(1);
            parsedNumber.integerLen++;
        }
        else {
            digits[roundAt - 1]++;
        }
    }
    // Pad out with zeros to get the required fraction length
    for (; fractionLen < Math.max(0, fractionSize); fractionLen++)
        digits.push(0);
    var dropTrailingZeros = fractionSize !== 0;
    // Minimal length = nb of decimals required + current nb of integers
    // Any number besides that is optional and can be removed if it's a trailing 0
    var minLen = minFrac + parsedNumber.integerLen;
    // Do any carrying, e.g. a digit was rounded up to 10
    var carry = digits.reduceRight(function (carry, d, i, digits) {
        d = d + carry;
        digits[i] = d < 10 ? d : d - 10; // d % 10
        if (dropTrailingZeros) {
            // Do not keep meaningless fractional trailing zeros (e.g. 15.52000 --> 15.52)
            if (digits[i] === 0 && i >= minLen) {
                digits.pop();
            }
            else {
                dropTrailingZeros = false;
            }
        }
        return d >= 10 ? 1 : 0; // Math.floor(d / 10);
    }, 0);
    if (carry) {
        digits.unshift(carry);
        parsedNumber.integerLen++;
    }
}
export function parseIntAutoRadix(text) {
    var result = parseInt(text);
    if (isNaN(result)) {
        throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X251bWJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvaTE4bi9mb3JtYXRfbnVtYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxZQUFZLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUUzSSxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyw2QkFBNkIsQ0FBQztBQUNsRSxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUN0QixJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDeEIsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLElBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUN2QixJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7QUFDMUIsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBRXpCOztHQUVHO0FBQ0gsU0FBUywwQkFBMEIsQ0FDL0IsS0FBYSxFQUFFLE9BQTJCLEVBQUUsTUFBYyxFQUFFLFdBQXlCLEVBQ3JGLGFBQTJCLEVBQUUsVUFBbUIsRUFBRSxTQUFpQjtJQUFqQiwwQkFBQSxFQUFBLGlCQUFpQjtJQUNyRSxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDdkIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBRW5CLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDcEIsYUFBYSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDdEU7U0FBTTtRQUNMLElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxL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LENBQUMsSUFBWTtJQUM1QyxJQUFNLE1BQU0sR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNqRTtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TnVtYmVyRm9ybWF0U3R5bGUsIE51bWJlclN5bWJvbCwgZ2V0TG9jYWxlTnVtYmVyRm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHN9IGZyb20gJy4vbG9jYWxlX2RhdGFfYXBpJztcblxuZXhwb3J0IGNvbnN0IE5VTUJFUl9GT1JNQVRfUkVHRVhQID0gL14oXFxkKyk/XFwuKChcXGQrKSgtKFxcZCspKT8pPyQvO1xuY29uc3QgTUFYX0RJR0lUUyA9IDIyO1xuY29uc3QgREVDSU1BTF9TRVAgPSAnLic7XG5jb25zdCBaRVJPX0NIQVIgPSAnMCc7XG5jb25zdCBQQVRURVJOX1NFUCA9ICc7JztcbmNvbnN0IEdST1VQX1NFUCA9ICcsJztcbmNvbnN0IERJR0lUX0NIQVIgPSAnIyc7XG5jb25zdCBDVVJSRU5DWV9DSEFSID0gJ8KkJztcbmNvbnN0IFBFUkNFTlRfQ0hBUiA9ICclJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgbnVtYmVyIHRvIGEgbG9jYWxlIHN0cmluZyBiYXNlZCBvbiBhIHN0eWxlIGFuZCBhIGZvcm1hdC5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0TnVtYmVyVG9Mb2NhbGVTdHJpbmcoXG4gICAgdmFsdWU6IG51bWJlciwgcGF0dGVybjogUGFyc2VkTnVtYmVyRm9ybWF0LCBsb2NhbGU6IHN0cmluZywgZ3JvdXBTeW1ib2w6IE51bWJlclN5bWJvbCxcbiAgICBkZWNpbWFsU3ltYm9sOiBOdW1iZXJTeW1ib2wsIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGlzUGVyY2VudCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgbGV0IGZvcm1hdHRlZFRleHQgPSAnJztcbiAgbGV0IGlzWmVybyA9IGZhbHNlO1xuXG4gIGlmICghaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgZm9ybWF0dGVkVGV4dCA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5JbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHBhcnNlZE51bWJlciA9IHBhcnNlTnVtYmVyKHZhbHVlKTtcblxuICAgIGlmIChpc1BlcmNlbnQpIHtcbiAgICAgIHBhcnNlZE51bWJlciA9IHRvUGVyY2VudChwYXJzZWROdW1iZXIpO1xuICAgIH1cblxuICAgIGxldCBtaW5JbnQgPSBwYXR0ZXJuLm1pbkludDtcbiAgICBsZXQgbWluRnJhY3Rpb24gPSBwYXR0ZXJuLm1pbkZyYWM7XG4gICAgbGV0IG1heEZyYWN0aW9uID0gcGF0dGVybi5tYXhGcmFjO1xuXG4gICAgaWYgKGRpZ2l0c0luZm8pIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gZGlnaXRzSW5mby5tYXRjaChOVU1CRVJfRk9STUFUX1JFR0VYUCk7XG4gICAgICBpZiAocGFydHMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c0luZm99IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm9gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pbkludFBhcnQgPSBwYXJ0c1sxXTtcbiAgICAgIGNvbnN0IG1pbkZyYWN0aW9uUGFydCA9IHBhcnRzWzNdO1xuICAgICAgY29uc3QgbWF4RnJhY3Rpb25QYXJ0ID0gcGFydHNbNV07XG4gICAgICBpZiAobWluSW50UGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KG1pbkludFBhcnQpO1xuICAgICAgfVxuICAgICAgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgobWluRnJhY3Rpb25QYXJ0KTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhGcmFjdGlvblBhcnQgIT0gbnVsbCkge1xuICAgICAgICBtYXhGcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KG1heEZyYWN0aW9uUGFydCk7XG4gICAgICB9IGVsc2UgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsICYmIG1pbkZyYWN0aW9uID4gbWF4RnJhY3Rpb24pIHtcbiAgICAgICAgbWF4RnJhY3Rpb24gPSBtaW5GcmFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByb3VuZE51bWJlcihwYXJzZWROdW1iZXIsIG1pbkZyYWN0aW9uLCBtYXhGcmFjdGlvbik7XG5cbiAgICBsZXQgZGlnaXRzID0gcGFyc2VkTnVtYmVyLmRpZ2l0cztcbiAgICBsZXQgaW50ZWdlckxlbiA9IHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICAgIGNvbnN0IGV4cG9uZW50ID0gcGFyc2VkTnVtYmVyLmV4cG9uZW50O1xuICAgIGxldCBkZWNpbWFscyA9IFtdO1xuICAgIGlzWmVybyA9IGRpZ2l0cy5ldmVyeShkID0+ICFkKTtcblxuICAgIC8vIHBhZCB6ZXJvcyBmb3Igc21hbGwgbnVtYmVyc1xuICAgIGZvciAoOyBpbnRlZ2VyTGVuIDwgbWluSW50OyBpbnRlZ2VyTGVuKyspIHtcbiAgICAgIGRpZ2l0cy51bnNoaWZ0KDApO1xuICAgIH1cblxuICAgIC8vIHBhZCB6ZXJvcyBmb3Igc21hbGwgbnVtYmVyc1xuICAgIGZvciAoOyBpbnRlZ2VyTGVuIDwgMDsgaW50ZWdlckxlbisrKSB7XG4gICAgICBkaWdpdHMudW5zaGlmdCgwKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IGRlY2ltYWxzIGRpZ2l0c1xuICAgIGlmIChpbnRlZ2VyTGVuID4gMCkge1xuICAgICAgZGVjaW1hbHMgPSBkaWdpdHMuc3BsaWNlKGludGVnZXJMZW4sIGRpZ2l0cy5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWNpbWFscyA9IGRpZ2l0cztcbiAgICAgIGRpZ2l0cyA9IFswXTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXQgdGhlIGludGVnZXIgZGlnaXRzIHdpdGggZ3JvdXBpbmcgc2VwYXJhdG9yc1xuICAgIGNvbnN0IGdyb3VwcyA9IFtdO1xuICAgIGlmIChkaWdpdHMubGVuZ3RoID49IHBhdHRlcm4ubGdTaXplKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuc3BsaWNlKC1wYXR0ZXJuLmxnU2l6ZSwgZGlnaXRzLmxlbmd0aCkuam9pbignJykpO1xuICAgIH1cblxuICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoID4gcGF0dGVybi5nU2l6ZSkge1xuICAgICAgZ3JvdXBzLnVuc2hpZnQoZGlnaXRzLnNwbGljZSgtcGF0dGVybi5nU2l6ZSwgZGlnaXRzLmxlbmd0aCkuam9pbignJykpO1xuICAgIH1cblxuICAgIGlmIChkaWdpdHMubGVuZ3RoKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuam9pbignJykpO1xuICAgIH1cblxuICAgIGZvcm1hdHRlZFRleHQgPSBncm91cHMuam9pbihnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBncm91cFN5bWJvbCkpO1xuXG4gICAgLy8gYXBwZW5kIHRoZSBkZWNpbWFsIGRpZ2l0c1xuICAgIGlmIChkZWNpbWFscy5sZW5ndGgpIHtcbiAgICAgIGZvcm1hdHRlZFRleHQgKz0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgZGVjaW1hbFN5bWJvbCkgKyBkZWNpbWFscy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBpZiAoZXhwb25lbnQpIHtcbiAgICAgIGZvcm1hdHRlZFRleHQgKz0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLkV4cG9uZW50aWFsKSArICcrJyArIGV4cG9uZW50O1xuICAgIH1cbiAgfVxuXG4gIGlmICh2YWx1ZSA8IDAgJiYgIWlzWmVybykge1xuICAgIGZvcm1hdHRlZFRleHQgPSBwYXR0ZXJuLm5lZ1ByZSArIGZvcm1hdHRlZFRleHQgKyBwYXR0ZXJuLm5lZ1N1ZjtcbiAgfSBlbHNlIHtcbiAgICBmb3JtYXR0ZWRUZXh0ID0gcGF0dGVybi5wb3NQcmUgKyBmb3JtYXR0ZWRUZXh0ICsgcGF0dGVybi5wb3NTdWY7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0dGVkVGV4dDtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGN1cnJlbmN5IHVzaW5nIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIG51bWJlciB0byBmb3JtYXQuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBjdXJyZW5jeSBBIHN0cmluZyBjb250YWluaW5nIHRoZSBjdXJyZW5jeSBzeW1ib2wgb3IgaXRzIG5hbWUsXG4gKiBzdWNoIGFzIFwiJFwiIG9yIFwiQ2FuYWRpYW4gRG9sbGFyXCIuIFVzZWQgaW4gb3V0cHV0IHN0cmluZywgYnV0IGRvZXMgbm90IGFmZmVjdCB0aGUgb3BlcmF0aW9uXG4gKiBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0gY3VycmVuY3lDb2RlIFRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KVxuICogY3VycmVuY3kgY29kZSwgc3VjaCBhcyBgVVNEYCBmb3IgdGhlIFVTIGRvbGxhciBhbmQgYEVVUmAgZm9yIHRoZSBldXJvLlxuICogVXNlZCB0byBkZXRlcm1pbmUgdGhlIG51bWJlciBvZiBkaWdpdHMgaW4gdGhlIGRlY2ltYWwgcGFydC5cbiAqIEBwYXJhbSBkaWdpdEluZm8gRGVjaW1hbCByZXByZXNlbnRhdGlvbiBvcHRpb25zLCBzcGVjaWZpZWQgYnkgYSBzdHJpbmcgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKiBge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfWAuIFNlZSBgRGVjaW1hbFBpcGVgIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBjdXJyZW5jeSB2YWx1ZS5cbiAqXG4gKiBAc2VlIGBmb3JtYXROdW1iZXIoKWBcbiAqIEBzZWUgYERlY2ltYWxQaXBlYFxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRDdXJyZW5jeShcbiAgICB2YWx1ZTogbnVtYmVyLCBsb2NhbGU6IHN0cmluZywgY3VycmVuY3k6IHN0cmluZywgY3VycmVuY3lDb2RlPzogc3RyaW5nLFxuICAgIGRpZ2l0c0luZm8/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlLCBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSk7XG4gIGNvbnN0IHBhdHRlcm4gPSBwYXJzZU51bWJlckZvcm1hdChmb3JtYXQsIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pKTtcblxuICBwYXR0ZXJuLm1pbkZyYWMgPSBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzKGN1cnJlbmN5Q29kZSAhKTtcbiAgcGF0dGVybi5tYXhGcmFjID0gcGF0dGVybi5taW5GcmFjO1xuXG4gIGNvbnN0IHJlcyA9IGZvcm1hdE51bWJlclRvTG9jYWxlU3RyaW5nKFxuICAgICAgdmFsdWUsIHBhdHRlcm4sIGxvY2FsZSwgTnVtYmVyU3ltYm9sLkN1cnJlbmN5R3JvdXAsIE51bWJlclN5bWJvbC5DdXJyZW5jeURlY2ltYWwsIGRpZ2l0c0luZm8pO1xuICByZXR1cm4gcmVzXG4gICAgICAucmVwbGFjZShDVVJSRU5DWV9DSEFSLCBjdXJyZW5jeSlcbiAgICAgIC8vIGlmIHdlIGhhdmUgMiB0aW1lIHRoZSBjdXJyZW5jeSBjaGFyYWN0ZXIsIHRoZSBzZWNvbmQgb25lIGlzIGlnbm9yZWRcbiAgICAgIC5yZXBsYWNlKENVUlJFTkNZX0NIQVIsICcnKVxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBzcGFjaW5nIGJldHdlZW4gY3VycmVuY3kgY2hhcmFjdGVyIGFuZCB0aGUgdmFsdWUgYW5kXG4gICAgICAvLyB0aGUgY3VycmVuY3kgY2hhcmFjdGVyIGlzIHN1cHJlc3NlZCBieSBwYXNzaW5nIGFuIGVtcHR5IHN0cmluZywgdGhlXG4gICAgICAvLyBzcGFjaW5nIGNoYXJhY3RlciB3b3VsZCByZW1haW4gYXMgcGFydCBvZiB0aGUgc3RyaW5nLiBUaGVuIHdlXG4gICAgICAvLyBzaG91bGQgcmVtb3ZlIGl0LlxuICAgICAgLnRyaW0oKTtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGEgcGVyY2VudGFnZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgbnVtYmVyIHRvIGZvcm1hdC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGRpZ2l0SW5mbyBEZWNpbWFsIHJlcHJlc2VudGF0aW9uIG9wdGlvbnMsIHNwZWNpZmllZCBieSBhIHN0cmluZyBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqIGB7bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9YC4gU2VlIGBEZWNpbWFsUGlwZWAgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHBlcmNlbnRhZ2UgdmFsdWUuXG4gKlxuICogQHNlZSBgZm9ybWF0TnVtYmVyKClgXG4gKiBAc2VlIGBEZWNpbWFsUGlwZWBcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKiBAcHVibGljQXBpXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0UGVyY2VudCh2YWx1ZTogbnVtYmVyLCBsb2NhbGU6IHN0cmluZywgZGlnaXRzSW5mbz86IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdCA9IGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGUsIE51bWJlckZvcm1hdFN0eWxlLlBlcmNlbnQpO1xuICBjb25zdCBwYXR0ZXJuID0gcGFyc2VOdW1iZXJGb3JtYXQoZm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSk7XG4gIGNvbnN0IHJlcyA9IGZvcm1hdE51bWJlclRvTG9jYWxlU3RyaW5nKFxuICAgICAgdmFsdWUsIHBhdHRlcm4sIGxvY2FsZSwgTnVtYmVyU3ltYm9sLkdyb3VwLCBOdW1iZXJTeW1ib2wuRGVjaW1hbCwgZGlnaXRzSW5mbywgdHJ1ZSk7XG4gIHJldHVybiByZXMucmVwbGFjZShcbiAgICAgIG5ldyBSZWdFeHAoUEVSQ0VOVF9DSEFSLCAnZycpLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuUGVyY2VudFNpZ24pKTtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIHRleHQsIHdpdGggZ3JvdXAgc2l6aW5nLCBzZXBhcmF0b3IsIGFuZCBvdGhlclxuICogcGFyYW1ldGVycyBiYXNlZCBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgbnVtYmVyIHRvIGZvcm1hdC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIGRpZ2l0SW5mbyBEZWNpbWFsIHJlcHJlc2VudGF0aW9uIG9wdGlvbnMsIHNwZWNpZmllZCBieSBhIHN0cmluZyBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqIGB7bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9YC4gU2VlIGBEZWNpbWFsUGlwZWAgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHRleHQgc3RyaW5nLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXROdW1iZXIodmFsdWU6IG51bWJlciwgbG9jYWxlOiBzdHJpbmcsIGRpZ2l0c0luZm8/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsKTtcbiAgY29uc3QgcGF0dGVybiA9IHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuICByZXR1cm4gZm9ybWF0TnVtYmVyVG9Mb2NhbGVTdHJpbmcoXG4gICAgICB2YWx1ZSwgcGF0dGVybiwgbG9jYWxlLCBOdW1iZXJTeW1ib2wuR3JvdXAsIE51bWJlclN5bWJvbC5EZWNpbWFsLCBkaWdpdHNJbmZvKTtcbn1cblxuaW50ZXJmYWNlIFBhcnNlZE51bWJlckZvcm1hdCB7XG4gIG1pbkludDogbnVtYmVyO1xuICAvLyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIHJlcXVpcmVkIGluIHRoZSBmcmFjdGlvbiBwYXJ0IG9mIHRoZSBudW1iZXJcbiAgbWluRnJhYzogbnVtYmVyO1xuICAvLyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIHJlcXVpcmVkIGluIHRoZSBmcmFjdGlvbiBwYXJ0IG9mIHRoZSBudW1iZXJcbiAgbWF4RnJhYzogbnVtYmVyO1xuICAvLyB0aGUgcHJlZml4IGZvciBhIHBvc2l0aXZlIG51bWJlclxuICBwb3NQcmU6IHN0cmluZztcbiAgLy8gdGhlIHN1ZmZpeCBmb3IgYSBwb3NpdGl2ZSBudW1iZXJcbiAgcG9zU3VmOiBzdHJpbmc7XG4gIC8vIHRoZSBwcmVmaXggZm9yIGEgbmVnYXRpdmUgbnVtYmVyIChlLmcuIGAtYCBvciBgKGApKVxuICBuZWdQcmU6IHN0cmluZztcbiAgLy8gdGhlIHN1ZmZpeCBmb3IgYSBuZWdhdGl2ZSBudW1iZXIgKGUuZy4gYClgKVxuICBuZWdTdWY6IHN0cmluZztcbiAgLy8gbnVtYmVyIG9mIGRpZ2l0cyBpbiBlYWNoIGdyb3VwIG9mIHNlcGFyYXRlZCBkaWdpdHNcbiAgZ1NpemU6IG51bWJlcjtcbiAgLy8gbnVtYmVyIG9mIGRpZ2l0cyBpbiB0aGUgbGFzdCBncm91cCBvZiBkaWdpdHMgYmVmb3JlIHRoZSBkZWNpbWFsIHNlcGFyYXRvclxuICBsZ1NpemU6IG51bWJlcjtcbn1cblxuZnVuY3Rpb24gcGFyc2VOdW1iZXJGb3JtYXQoZm9ybWF0OiBzdHJpbmcsIG1pbnVzU2lnbiA9ICctJyk6IFBhcnNlZE51bWJlckZvcm1hdCB7XG4gIGNvbnN0IHAgPSB7XG4gICAgbWluSW50OiAxLFxuICAgIG1pbkZyYWM6IDAsXG4gICAgbWF4RnJhYzogMCxcbiAgICBwb3NQcmU6ICcnLFxuICAgIHBvc1N1ZjogJycsXG4gICAgbmVnUHJlOiAnJyxcbiAgICBuZWdTdWY6ICcnLFxuICAgIGdTaXplOiAwLFxuICAgIGxnU2l6ZTogMFxuICB9O1xuXG4gIGNvbnN0IHBhdHRlcm5QYXJ0cyA9IGZvcm1hdC5zcGxpdChQQVRURVJOX1NFUCk7XG4gIGNvbnN0IHBvc2l0aXZlID0gcGF0dGVyblBhcnRzWzBdO1xuICBjb25zdCBuZWdhdGl2ZSA9IHBhdHRlcm5QYXJ0c1sxXTtcblxuICBjb25zdCBwb3NpdGl2ZVBhcnRzID0gcG9zaXRpdmUuaW5kZXhPZihERUNJTUFMX1NFUCkgIT09IC0xID9cbiAgICAgIHBvc2l0aXZlLnNwbGl0KERFQ0lNQUxfU0VQKSA6XG4gICAgICBbXG4gICAgICAgIHBvc2l0aXZlLnN1YnN0cmluZygwLCBwb3NpdGl2ZS5sYXN0SW5kZXhPZihaRVJPX0NIQVIpICsgMSksXG4gICAgICAgIHBvc2l0aXZlLnN1YnN0cmluZyhwb3NpdGl2ZS5sYXN0SW5kZXhPZihaRVJPX0NIQVIpICsgMSlcbiAgICAgIF0sXG4gICAgICAgIGludGVnZXIgPSBwb3NpdGl2ZVBhcnRzWzBdLCBmcmFjdGlvbiA9IHBvc2l0aXZlUGFydHNbMV0gfHwgJyc7XG5cbiAgcC5wb3NQcmUgPSBpbnRlZ2VyLnN1YnN0cigwLCBpbnRlZ2VyLmluZGV4T2YoRElHSVRfQ0hBUikpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhY3Rpb24ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaCA9IGZyYWN0aW9uLmNoYXJBdChpKTtcbiAgICBpZiAoY2ggPT09IFpFUk9fQ0hBUikge1xuICAgICAgcC5taW5GcmFjID0gcC5tYXhGcmFjID0gaSArIDE7XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gRElHSVRfQ0hBUikge1xuICAgICAgcC5tYXhGcmFjID0gaSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHAucG9zU3VmICs9IGNoO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGdyb3VwcyA9IGludGVnZXIuc3BsaXQoR1JPVVBfU0VQKTtcbiAgcC5nU2l6ZSA9IGdyb3Vwc1sxXSA/IGdyb3Vwc1sxXS5sZW5ndGggOiAwO1xuICBwLmxnU2l6ZSA9IChncm91cHNbMl0gfHwgZ3JvdXBzWzFdKSA/IChncm91cHNbMl0gfHwgZ3JvdXBzWzFdKS5sZW5ndGggOiAwO1xuXG4gIGlmIChuZWdhdGl2ZSkge1xuICAgIGNvbnN0IHRydW5rTGVuID0gcG9zaXRpdmUubGVuZ3RoIC0gcC5wb3NQcmUubGVuZ3RoIC0gcC5wb3NTdWYubGVuZ3RoLFxuICAgICAgICAgIHBvcyA9IG5lZ2F0aXZlLmluZGV4T2YoRElHSVRfQ0hBUik7XG5cbiAgICBwLm5lZ1ByZSA9IG5lZ2F0aXZlLnN1YnN0cigwLCBwb3MpLnJlcGxhY2UoLycvZywgJycpO1xuICAgIHAubmVnU3VmID0gbmVnYXRpdmUuc3Vic3RyKHBvcyArIHRydW5rTGVuKS5yZXBsYWNlKC8nL2csICcnKTtcbiAgfSBlbHNlIHtcbiAgICBwLm5lZ1ByZSA9IG1pbnVzU2lnbiArIHAucG9zUHJlO1xuICAgIHAubmVnU3VmID0gcC5wb3NTdWY7XG4gIH1cblxuICByZXR1cm4gcDtcbn1cblxuaW50ZXJmYWNlIFBhcnNlZE51bWJlciB7XG4gIC8vIGFuIGFycmF5IG9mIGRpZ2l0cyBjb250YWluaW5nIGxlYWRpbmcgemVyb3MgYXMgbmVjZXNzYXJ5XG4gIGRpZ2l0czogbnVtYmVyW107XG4gIC8vIHRoZSBleHBvbmVudCBmb3IgbnVtYmVycyB0aGF0IHdvdWxkIG5lZWQgbW9yZSB0aGFuIGBNQVhfRElHSVRTYCBkaWdpdHMgaW4gYGRgXG4gIGV4cG9uZW50OiBudW1iZXI7XG4gIC8vIHRoZSBudW1iZXIgb2YgdGhlIGRpZ2l0cyBpbiBgZGAgdGhhdCBhcmUgdG8gdGhlIGxlZnQgb2YgdGhlIGRlY2ltYWwgcG9pbnRcbiAgaW50ZWdlckxlbjogbnVtYmVyO1xufVxuXG4vLyBUcmFuc2Zvcm1zIGEgcGFyc2VkIG51bWJlciBpbnRvIGEgcGVyY2VudGFnZSBieSBtdWx0aXBseWluZyBpdCBieSAxMDBcbmZ1bmN0aW9uIHRvUGVyY2VudChwYXJzZWROdW1iZXI6IFBhcnNlZE51bWJlcik6IFBhcnNlZE51bWJlciB7XG4gIC8vIGlmIHRoZSBudW1iZXIgaXMgMCwgZG9uJ3QgZG8gYW55dGhpbmdcbiAgaWYgKHBhcnNlZE51bWJlci5kaWdpdHNbMF0gPT09IDApIHtcbiAgICByZXR1cm4gcGFyc2VkTnVtYmVyO1xuICB9XG5cbiAgLy8gR2V0dGluZyB0aGUgY3VycmVudCBudW1iZXIgb2YgZGVjaW1hbHNcbiAgY29uc3QgZnJhY3Rpb25MZW4gPSBwYXJzZWROdW1iZXIuZGlnaXRzLmxlbmd0aCAtIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICBpZiAocGFyc2VkTnVtYmVyLmV4cG9uZW50KSB7XG4gICAgcGFyc2VkTnVtYmVyLmV4cG9uZW50ICs9IDI7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGZyYWN0aW9uTGVuID09PSAwKSB7XG4gICAgICBwYXJzZWROdW1iZXIuZGlnaXRzLnB1c2goMCwgMCk7XG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbkxlbiA9PT0gMSkge1xuICAgICAgcGFyc2VkTnVtYmVyLmRpZ2l0cy5wdXNoKDApO1xuICAgIH1cbiAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbiArPSAyO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlZE51bWJlcjtcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBudW1iZXIuXG4gKiBTaWduaWZpY2FudCBiaXRzIG9mIHRoaXMgcGFyc2UgYWxnb3JpdGhtIGNhbWUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXG4gKi9cbmZ1bmN0aW9uIHBhcnNlTnVtYmVyKG51bTogbnVtYmVyKTogUGFyc2VkTnVtYmVyIHtcbiAgbGV0IG51bVN0ciA9IE1hdGguYWJzKG51bSkgKyAnJztcbiAgbGV0IGV4cG9uZW50ID0gMCwgZGlnaXRzLCBpbnRlZ2VyTGVuO1xuICBsZXQgaSwgaiwgemVyb3M7XG5cbiAgLy8gRGVjaW1hbCBwb2ludD9cbiAgaWYgKChpbnRlZ2VyTGVuID0gbnVtU3RyLmluZGV4T2YoREVDSU1BTF9TRVApKSA+IC0xKSB7XG4gICAgbnVtU3RyID0gbnVtU3RyLnJlcGxhY2UoREVDSU1BTF9TRVAsICcnKTtcbiAgfVxuXG4gIC8vIEV4cG9uZW50aWFsIGZvcm0/XG4gIGlmICgoaSA9IG51bVN0ci5zZWFyY2goL2UvaSkpID4gMCkge1xuICAgIC8vIFdvcmsgb3V0IHRoZSBleHBvbmVudC5cbiAgICBpZiAoaW50ZWdlckxlbiA8IDApIGludGVnZXJMZW4gPSBpO1xuICAgIGludGVnZXJMZW4gKz0gK251bVN0ci5zbGljZShpICsgMSk7XG4gICAgbnVtU3RyID0gbnVtU3RyLnN1YnN0cmluZygwLCBpKTtcbiAgfSBlbHNlIGlmIChpbnRlZ2VyTGVuIDwgMCkge1xuICAgIC8vIFRoZXJlIHdhcyBubyBkZWNpbWFsIHBvaW50IG9yIGV4cG9uZW50IHNvIGl0IGlzIGFuIGludGVnZXIuXG4gICAgaW50ZWdlckxlbiA9IG51bVN0ci5sZW5ndGg7XG4gIH1cblxuICAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIGxlYWRpbmcgemVyb3MuXG4gIGZvciAoaSA9IDA7IG51bVN0ci5jaGFyQXQoaSkgPT09IFpFUk9fQ0hBUjsgaSsrKSB7IC8qIGVtcHR5ICovXG4gIH1cblxuICBpZiAoaSA9PT0gKHplcm9zID0gbnVtU3RyLmxlbmd0aCkpIHtcbiAgICAvLyBUaGUgZGlnaXRzIGFyZSBhbGwgemVyby5cbiAgICBkaWdpdHMgPSBbMF07XG4gICAgaW50ZWdlckxlbiA9IDE7XG4gIH0gZWxzZSB7XG4gICAgLy8gQ291bnQgdGhlIG51bWJlciBvZiB0cmFpbGluZyB6ZXJvc1xuICAgIHplcm9zLS07XG4gICAgd2hpbGUgKG51bVN0ci5jaGFyQXQoemVyb3MpID09PSBaRVJPX0NIQVIpIHplcm9zLS07XG5cbiAgICAvLyBUcmFpbGluZyB6ZXJvcyBhcmUgaW5zaWduaWZpY2FudCBzbyBpZ25vcmUgdGhlbVxuICAgIGludGVnZXJMZW4gLT0gaTtcbiAgICBkaWdpdHMgPSBbXTtcbiAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxuICAgIGZvciAoaiA9IDA7IGkgPD0gemVyb3M7IGkrKywgaisrKSB7XG4gICAgICBkaWdpdHNbal0gPSBOdW1iZXIobnVtU3RyLmNoYXJBdChpKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIG51bWJlciBvdmVyZmxvd3MgdGhlIG1heGltdW0gYWxsb3dlZCBkaWdpdHMgdGhlbiB1c2UgYW4gZXhwb25lbnQuXG4gIGlmIChpbnRlZ2VyTGVuID4gTUFYX0RJR0lUUykge1xuICAgIGRpZ2l0cyA9IGRpZ2l0cy5zcGxpY2UoMCwgTUFYX0RJR0lUUyAtIDEpO1xuICAgIGV4cG9uZW50ID0gaW50ZWdlckxlbiAtIDE7XG4gICAgaW50ZWdlckxlbiA9IDE7XG4gIH1cblxuICByZXR1cm4ge2RpZ2l0cywgZXhwb25lbnQsIGludGVnZXJMZW59O1xufVxuXG4vKipcbiAqIFJvdW5kIHRoZSBwYXJzZWQgbnVtYmVyIHRvIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzXG4gKiBUaGlzIGZ1bmN0aW9uIGNoYW5nZXMgdGhlIHBhcnNlZE51bWJlciBpbi1wbGFjZVxuICovXG5mdW5jdGlvbiByb3VuZE51bWJlcihwYXJzZWROdW1iZXI6IFBhcnNlZE51bWJlciwgbWluRnJhYzogbnVtYmVyLCBtYXhGcmFjOiBudW1iZXIpIHtcbiAgaWYgKG1pbkZyYWMgPiBtYXhGcmFjKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbiAoJHttaW5GcmFjfSkgaXMgaGlnaGVyIHRoYW4gdGhlIG1heGltdW0gKCR7bWF4RnJhY30pLmApO1xuICB9XG5cbiAgbGV0IGRpZ2l0cyA9IHBhcnNlZE51bWJlci5kaWdpdHM7XG4gIGxldCBmcmFjdGlvbkxlbiA9IGRpZ2l0cy5sZW5ndGggLSBwYXJzZWROdW1iZXIuaW50ZWdlckxlbjtcbiAgY29uc3QgZnJhY3Rpb25TaXplID0gTWF0aC5taW4oTWF0aC5tYXgobWluRnJhYywgZnJhY3Rpb25MZW4pLCBtYXhGcmFjKTtcblxuICAvLyBUaGUgaW5kZXggb2YgdGhlIGRpZ2l0IHRvIHdoZXJlIHJvdW5kaW5nIGlzIHRvIG9jY3VyXG4gIGxldCByb3VuZEF0ID0gZnJhY3Rpb25TaXplICsgcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIGxldCBkaWdpdCA9IGRpZ2l0c1tyb3VuZEF0XTtcblxuICBpZiAocm91bmRBdCA+IDApIHtcbiAgICAvLyBEcm9wIGZyYWN0aW9uYWwgZGlnaXRzIGJleW9uZCBgcm91bmRBdGBcbiAgICBkaWdpdHMuc3BsaWNlKE1hdGgubWF4KHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuLCByb3VuZEF0KSk7XG5cbiAgICAvLyBTZXQgbm9uLWZyYWN0aW9uYWwgZGlnaXRzIGJleW9uZCBgcm91bmRBdGAgdG8gMFxuICAgIGZvciAobGV0IGogPSByb3VuZEF0OyBqIDwgZGlnaXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBkaWdpdHNbal0gPSAwO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBXZSByb3VuZGVkIHRvIHplcm8gc28gcmVzZXQgdGhlIHBhcnNlZE51bWJlclxuICAgIGZyYWN0aW9uTGVuID0gTWF0aC5tYXgoMCwgZnJhY3Rpb25MZW4pO1xuICAgIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuID0gMTtcbiAgICBkaWdpdHMubGVuZ3RoID0gTWF0aC5tYXgoMSwgcm91bmRBdCA9IGZyYWN0aW9uU2l6ZSArIDEpO1xuICAgIGRpZ2l0c1swXSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCByb3VuZEF0OyBpKyspIGRpZ2l0c1tpXSA9IDA7XG4gIH1cblxuICBpZiAoZGlnaXQgPj0gNSkge1xuICAgIGlmIChyb3VuZEF0IC0gMSA8IDApIHtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrID4gcm91bmRBdDsgay0tKSB7XG4gICAgICAgIGRpZ2l0cy51bnNoaWZ0KDApO1xuICAgICAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbisrO1xuICAgICAgfVxuICAgICAgZGlnaXRzLnVuc2hpZnQoMSk7XG4gICAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbisrO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaWdpdHNbcm91bmRBdCAtIDFdKys7XG4gICAgfVxuICB9XG5cbiAgLy8gUGFkIG91dCB3aXRoIHplcm9zIHRvIGdldCB0aGUgcmVxdWlyZWQgZnJhY3Rpb24gbGVuZ3RoXG4gIGZvciAoOyBmcmFjdGlvbkxlbiA8IE1hdGgubWF4KDAsIGZyYWN0aW9uU2l6ZSk7IGZyYWN0aW9uTGVuKyspIGRpZ2l0cy5wdXNoKDApO1xuXG4gIGxldCBkcm9wVHJhaWxpbmdaZXJvcyA9IGZyYWN0aW9uU2l6ZSAhPT0gMDtcbiAgLy8gTWluaW1hbCBsZW5ndGggPSBuYiBvZiBkZWNpbWFscyByZXF1aXJlZCArIGN1cnJlbnQgbmIgb2YgaW50ZWdlcnNcbiAgLy8gQW55IG51bWJlciBiZXNpZGVzIHRoYXQgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZW1vdmVkIGlmIGl0J3MgYSB0cmFpbGluZyAwXG4gIGNvbnN0IG1pbkxlbiA9IG1pbkZyYWMgKyBwYXJzZWROdW1iZXIuaW50ZWdlckxlbjtcbiAgLy8gRG8gYW55IGNhcnJ5aW5nLCBlLmcuIGEgZGlnaXQgd2FzIHJvdW5kZWQgdXAgdG8gMTBcbiAgY29uc3QgY2FycnkgPSBkaWdpdHMucmVkdWNlUmlnaHQoZnVuY3Rpb24oY2FycnksIGQsIGksIGRpZ2l0cykge1xuICAgIGQgPSBkICsgY2Fycnk7XG4gICAgZGlnaXRzW2ldID0gZCA8IDEwID8gZCA6IGQgLSAxMDsgIC8vIGQgJSAxMFxuICAgIGlmIChkcm9wVHJhaWxpbmdaZXJvcykge1xuICAgICAgLy8gRG8gbm90IGtlZXAgbWVhbmluZ2xlc3MgZnJhY3Rpb25hbCB0cmFpbGluZyB6ZXJvcyAoZS5nLiAxNS41MjAwMCAtLT4gMTUuNTIpXG4gICAgICBpZiAoZGlnaXRzW2ldID09PSAwICYmIGkgPj0gbWluTGVuKSB7XG4gICAgICAgIGRpZ2l0cy5wb3AoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb3BUcmFpbGluZ1plcm9zID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkID49IDEwID8gMSA6IDA7ICAvLyBNYXRoLmZsb29yKGQgLyAxMCk7XG4gIH0sIDApO1xuICBpZiAoY2FycnkpIHtcbiAgICBkaWdpdHMudW5zaGlmdChjYXJyeSk7XG4gICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4rKztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VJbnRBdXRvUmFkaXgodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3QgcmVzdWx0OiBudW1iZXIgPSBwYXJzZUludCh0ZXh0KTtcbiAgaWYgKGlzTmFOKHJlc3VsdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW50ZWdlciBsaXRlcmFsIHdoZW4gcGFyc2luZyAnICsgdGV4dCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==