import React from 'react'
 
type MDXComponents = {
  [key: string]: React.ComponentType<any>
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b border-white/20 pb-4">
        {children}
      </h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-xl md:text-2xl font-medium text-white mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-lg md:text-xl font-medium text-white mb-3 mt-4">
        {children}
      </h4>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="text-white/80 mb-4 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc list-inside text-white/80 mb-4 space-y-2 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside text-white/80 mb-4 space-y-2 ml-4">
        {children}
      </ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="text-white/80 leading-relaxed">
        {children}
      </li>
    ),
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="text-white font-semibold">
        {children}
      </strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="text-white/90 italic">
        {children}
      </em>
    ),
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500/50 pl-6 py-2 my-6 bg-white/5 rounded-r-lg text-white/90 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }: { children: React.ReactNode }) => (
      <code className="bg-white/10 text-blue-300 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }: { children: React.ReactNode }) => (
      <pre className="bg-white/10 border border-white/20 rounded-lg p-4 overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    hr: () => (
      <hr className="border-white/20 my-8" />
    ),
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-white/20 rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="bg-white/10 border border-white/20 px-4 py-2 text-left text-white font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="border border-white/20 px-4 py-2 text-white/80">
        {children}
      </td>
    ),
    ...components,
  }
}
