export function extractIngredients(parsedText: string): string {
    if (!parsedText) return "";

    // STEP 1 & 2: Find keyword and extract text after it.
    // Regex matches the keyword, optionally followed by some punctuation like colons, dashes, spaces.
    const keywordRegex = /(ingredients?|thành phần|composition|contains)\s*[:\-]?\s*/i;
    const match = parsedText.match(keywordRegex);

    let textToProcess = parsedText;
    if (match && match.index !== undefined) {
        textToProcess = parsedText.substring(match.index + match[0].length);
    }

    // STEP 3: Stop at period
    const periodIndex = textToProcess.indexOf(".");
    if (periodIndex !== -1) {
        textToProcess = textToProcess.substring(0, periodIndex);
    }

    // STEP 4: Normalize
    // Split by comma or semicolon
    const tokens = textToProcess.split(/[,;]/);
    
    const results: string[] = [];
    const seen = new Set<string>();

    for (let token of tokens) {
        // lowercase all values
        let cleanToken = token.toLowerCase();
        
        // Remove newlines and extra spaces, then trim
        cleanToken = cleanToken.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Remove leading non-alphanumeric/punctuation garbage that might have been missed
        cleanToken = cleanToken.replace(/^[:\-*]+/, '').trim();

        // remove empty strings and duplicates
        if (cleanToken.length > 0 && !seen.has(cleanToken)) {
            seen.add(cleanToken);
            results.push(cleanToken);
        }
    }

    // STEP 5: single string, comma-separated
    return results.join(", ");
}
