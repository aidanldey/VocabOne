import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText('VocabOne')).toBeInTheDocument()
    expect(screen.getByText(/Welcome to VocabOne/i)).toBeInTheDocument()
  })

  it('displays key features', () => {
    render(<App />)
    expect(screen.getByText('Multi-Card Learning')).toBeInTheDocument()
    expect(screen.getByText('Spaced Repetition')).toBeInTheDocument()
    expect(screen.getByText('Progress Tracking')).toBeInTheDocument()
  })

  it('shows action buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /import module/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument()
  })
})
