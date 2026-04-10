import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../components/ui/Button'

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>Tester</Button>)
    const buttonElement = screen.getByText('Tester')
    expect(buttonElement).toBeInTheDocument()
  })

  test('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>)
    const buttonElement = screen.getByText('Test')
    expect(buttonElement).toHaveClass('custom-class')
  })

  test('handles onClick event', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Cliquer</Button>)
    const buttonElement = screen.getByText('Cliquer')
    fireEvent.click(buttonElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies correct variant styles', () => {
    const { rerender } = render(<Button>Primary</Button>)
    let buttonElement = screen.getByText('Primary')
    expect(buttonElement).toHaveClass('bg-blue-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    buttonElement = screen.getByText('Secondary')
    expect(buttonElement).toHaveClass('bg-gray-500')

    rerender(<Button variant="danger">Danger</Button>)
    buttonElement = screen.getByText('Danger')
    expect(buttonElement).toHaveClass('bg-red-600')
  })

  test('disables button correctly', () => {
    render(<Button disabled>Disabled</Button>)
    const buttonElement = screen.getByText('Disabled')
    expect(buttonElement).toBeDisabled()
    expect(buttonElement).toHaveClass('opacity-50')
    expect(buttonElement).toHaveClass('cursor-not-allowed')
  })
})