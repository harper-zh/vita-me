import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  className = '',
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // 重置当text变化时
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse inline-block w-0.5 h-4 bg-current ml-1 align-middle">|</span>
      )}
    </span>
  );
};

