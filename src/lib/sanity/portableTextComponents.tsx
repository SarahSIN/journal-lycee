import React from 'react';
import { PortableTextComponents } from '@portabletext/react';

// 1. PORTABLE TEXT CUSTOM COMPONENTS
export const portableTextComponents: PortableTextComponents = {
  // 2. BLOCK STYLES
  block: {
    // Normal paragraph
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    
    // Heading 2
    h2: ({ children }) => (
      <h2 className="text-3xl font-serif font-bold mt-8 mb-4 text-blue-900">
        {children}
      </h2>
    ),
    
    // Heading 3
    h3: ({ children }) => (
      <h3 className="text-2xl font-serif font-semibold mt-6 mb-3 text-blue-800">
        {children}
      </h3>
    ),
  },

  // 3. LIST STYLES
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>
    ),
  },

  // 4. MARK STYLES
  marks: {
    // Inline code
    code: ({ children }) => (
      <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono">
        {children}
      </code>
    ),
    
    // Strong/bold text
    strong: ({ children }) => (
      <strong className="font-bold text-blue-900">{children}</strong>
    ),
    
    // Emphasized/italic text
    em: ({ children }) => (
      <em className="italic text-blue-700">{children}</em>
    ),

    // Links
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a 
          href={value?.href} 
          target={target} 
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          {children}
        </a>
      );
    },
  },

  // 5. CUSTOM TYPES
  types: {
    // Image handling
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      
      return (
        <div className="my-8 rounded-lg overflow-hidden shadow-md">
          <img 
            src={`${value.asset._ref}`} 
            alt={value.alt || 'Article image'} 
            className="w-full object-cover"
          />
          {value.caption && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
  }
};