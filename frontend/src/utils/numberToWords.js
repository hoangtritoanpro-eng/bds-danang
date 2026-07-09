const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín';
const units = ('1 một' + defaultNumbers).split(' ');
const tens = ('lẻ mười' + defaultNumbers).split(' ');
const hundreds = ('không một' + defaultNumbers).split(' ');

function readTwoDigit(number) {
    let result = '';
    const ten = Math.floor(number / 10);
    const unit = number % 10;
    if (ten > 1) {
        result += ' ' + tens[ten] + ' mươi';
        if (unit === 1) {
            result += ' mốt';
        } else if (unit === 5) {
            result += ' lăm';
        } else if (unit !== 0) {
            result += ' ' + units[unit];
        }
    } else if (ten === 1) {
        result += ' mười';
        if (unit === 5) {
            result += ' lăm';
        } else if (unit !== 0) {
            result += ' ' + units[unit];
        }
    } else if (ten === 0 && unit !== 0) {
        result += ' lẻ ' + units[unit];
    }
    return result;
}

function readThreeDigit(number) {
    let result = '';
    const hundred = Math.floor(number / 100);
    const rest = number % 100;
    if (hundred > 0) {
        result += ' ' + hundreds[hundred] + ' trăm';
    }
    if (rest > 0) {
        result += readTwoDigit(rest);
    }
    return result;
}

export function numberToVietnameseWords(number) {
    if (!number || number === 0) return 'không đồng chẵn';
    
    let strNum = number.toString().replace(/\D/g, '');
    if (!strNum) return '';
    let result = '';
    const suffixes = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
    let suffixIndex = 0;
    
    while (strNum.length > 0) {
        let chunkStr = strNum.substring(Math.max(0, strNum.length - 3), strNum.length);
        let chunkNum = parseInt(chunkStr, 10);
        strNum = strNum.substring(0, Math.max(0, strNum.length - 3));
        
        if (chunkNum > 0) {
            let chunkText = readThreeDigit(chunkNum);
            // Fix "không trăm" if it's the highest block
            if (strNum.length === 0 && chunkText.startsWith(' không trăm')) {
                chunkText = chunkText.substring(11); // remove " không trăm"
                if (chunkText.startsWith(' lẻ')) {
                    chunkText = chunkText.substring(3); // remove " lẻ"
                }
            }
            result = chunkText + suffixes[suffixIndex] + result;
        }
        suffixIndex++;
    }
    
    result = result.trim();
    if (!result) return '';
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + ' đồng chẵn';
}
