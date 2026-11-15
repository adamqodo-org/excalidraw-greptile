import { isTextElement } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

export type TextMetrics = {
  textElements: number;
  characters: number;
  words: number;
  longestLine: number;
  averageFontSize: number;
};

export const getTextMetrics = (
  elements: readonly ExcalidrawElement[],
): TextMetrics => {
  const texts = elements
    .filter((element) => !element.isDeleted)
    .filter(isTextElement);
  let characters = 0;
  let words = 0;
  let longestLine = 0;
  let fontSizeSum = 0;
  for (const { text, fontSize } of texts) {
    characters += text.length;
    words += text.split(" ").length;
    for (const line of text.split("\n")) {
      longestLine = Math.max(longestLine, line.length);
    }
    fontSizeSum += fontSize;
  }
  return {
    textElements: texts.length,
    characters,
    words,
    longestLine,
    averageFontSize: fontSizeSum / texts.length,
  };
};
