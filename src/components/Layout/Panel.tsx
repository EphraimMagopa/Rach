import type { ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  className?: string
}

export function Panel({ children, className = '' }: PanelProps): React.JSX.Element {
  return (
    <div className={`bg-rach-surface border border-rach-border rounded ${className}`}>
      {children}
    </div>
  )
}
