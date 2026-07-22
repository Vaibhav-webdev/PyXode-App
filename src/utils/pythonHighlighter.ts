export type Token = {
  text: string;
  type: "keyword" | "string" | "number" | "comment" | "identifier" | "space" | "operator";
};

const PY_KEYWORDS = new Set([
  "def", "return", "if", "elif", "else", "for", "while", "in", "import", "from",
  "as", "class", "try", "except", "finally", "True", "False", "None", "and",
  "or", "not", "break", "continue", "pass", "lambda", "with", "yield", "is",
  "global", "self", "print", "raise", "assert", "del", "async", "await",
]);

const TOKEN_REGEX =
  /(#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\s+)|([^\sA-Za-z0-9_])/g;

export function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    const [, comment, string, number, word, space, other] = match;
    if (comment !== undefined) tokens.push({ text: comment, type: "comment" });
    else if (string !== undefined) tokens.push({ text: string, type: "string" });
    else if (number !== undefined) tokens.push({ text: number, type: "number" });
    else if (word !== undefined)
      tokens.push({ text: word, type: PY_KEYWORDS.has(word) ? "keyword" : "identifier" });
    else if (space !== undefined) tokens.push({ text: space, type: "space" });
    else if (other !== undefined) tokens.push({ text: other, type: "operator" });
  }
  return tokens;
}

export const TOKEN_COLORS: Record<Token["type"], string> = {
  keyword: "#FF7AB2",
  string: "#8FE388",
  number: "#F5C518",
  comment: "#6B6B70",
  identifier: "#E8E8EA",
  space: "#E8E8EA",
  operator: "#B8B8BC",
};