export function extractIngredients(parsedText: string): string {
    if (!parsedText) return "";

    // Buoc 1: tim cac keyword thuong gap tren nhan my pham.
    // Neu tim thay, chi xu ly phan text sau keyword de bo qua ten san pham/huong dan su dung.
    const keywordRegex = /(ingredients?|thành phần|composition|contains)\s*[:\-]?\s*/i;
    const match = parsedText.match(keywordRegex);

    let textToProcess = parsedText;
    if (match && match.index !== undefined) {
        textToProcess = parsedText.substring(match.index + match[0].length);
    }

    // Buoc 2: cat tai dau cham dau tien vi nhan san pham thuong ket thuc danh sach INCI tai day.
    const periodIndex = textToProcess.indexOf(".");
    if (periodIndex !== -1) {
        textToProcess = textToProcess.substring(0, periodIndex);
    }

    // Buoc 3: tach token theo dau phay/cham phay, sau do normalize lowercase va khoang trang.
    const tokens = textToProcess.split(/[,;]/);
    
    const results: string[] = [];
    const seen = new Set<string>();

    for (let token of tokens) {
        // Lowercase de khop voi Ingredient.name trong database.
        let cleanToken = token.toLowerCase();
        
        // OCR hay sinh newline/khoang trang thua, nen gom lai thanh mot space.
        cleanToken = cleanToken.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Bo ky tu dau dong do OCR bat nham dau gach/dau hai cham.
        cleanToken = cleanToken.replace(/^[:\-*]+/, '').trim();

        // Bo token rong va duplicate de ket qua gon hon cho nguoi dung.
        if (cleanToken.length > 0 && !seen.has(cleanToken)) {
            seen.add(cleanToken);
            results.push(cleanToken);
        }
    }

    // Tra ve mot chuoi phan cach bang dau phay de dung truc tiep trong textarea INCI.
    return results.join(", ");
}
