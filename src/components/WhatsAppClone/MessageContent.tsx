import React from 'react';

interface MessageContentProps {
  text: string;
  isIncoming: boolean;
  isDark: boolean;
  onChipClick?: (val: string) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  text,
  isIncoming,
  isDark,
  onChipClick
}) => {
  // Parse message lines and tokens: `code`, *bold*, and links
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');

    return lines.map((line, lineIdx) => {
      // Parse inline tokens: `code` and *bold*
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let partIdx = 0;

      // Regex matching `code`, *bold*, or URLs
      const regex = /(`[^`]+`|\*[^*]+\*|https?:\/\/[^\s]+|tel:[0-9-]+)/g;
      let match;
      let lastIndex = 0;

      while ((match = regex.exec(line)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

        const token = match[0];
        if (token.startsWith('`') && token.endsWith('`')) {
          const codeVal = token.slice(1, -1);
          parts.push(
            <button
              key={`${lineIdx}-${partIdx++}`}
              onClick={() => onChipClick && onChipClick(codeVal)}
              className="wa-code-capsule hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title={`לחץ לבחירת ${codeVal}`}
            >
              {codeVal}
            </button>
          );
        } else if (token.startsWith('*') && token.endsWith('*')) {
          parts.push(
            <strong key={`${lineIdx}-${partIdx++}`} className="font-bold">
              {token.slice(1, -1)}
            </strong>
          );
        } else if (token.startsWith('http')) {
          parts.push(
            <a
              key={`${lineIdx}-${partIdx++}`}
              href={token}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#027eb5] dark:text-[#53bdeb] underline font-medium hover:opacity-80 inline-flex items-center gap-1 dir-ltr text-xs px-1 py-0.5 rounded bg-black/5 dark:bg-white/5"
            >
              <span>{token.length > 35 ? token.substring(0, 32) + '...' : token}</span>
            </a>
          );
        } else if (token.startsWith('tel:')) {
          const phoneNum = token.replace('tel:', '');
          parts.push(
            <a
              key={`${lineIdx}-${partIdx++}`}
              href={token}
              className="text-[#00a884] dark:text-[#25d366] font-bold underline px-1 rounded bg-black/5 dark:bg-white/5"
            >
              {phoneNum}
            </a>
          );
        }

        lastIndex = match.index + token.length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <span key={lineIdx} className="block min-h-[1.25em] leading-relaxed">
          {parts.length > 0 ? parts : ' '}
        </span>
      );
    });
  };

  return (
    <div className="text-[14.2px] md:text-[14.8px] leading-[1.42] select-text break-words">
      {renderFormattedText(text)}
    </div>
  );
};
