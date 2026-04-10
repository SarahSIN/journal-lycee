import React from 'react'
import Image from 'next/image'
import { useSeasonalTheme } from './SeasonalTheme'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  width = 100,
  height = 100,
  className = ''
}) => {
  const theme = useSeasonalTheme()

  return (
    <div 
      className={`journal-logo ${className}`}
      style={{
        backgroundColor: theme.secondaryColor,
        borderRadius: '50%',
        padding: '10px',
        display: 'inline-block'
      }}
    >
      <Image
        src="/logo-ozennien.jpeg"
        alt="Logo du Journal du Lycée Ozenne"
        width={width}
        height={height}
        priority
        style={{
          borderRadius: '50%',
          border: `4px solid ${theme.primaryColor}`
        }}
      />
    </div>
  )
}

export const LogoWithText: React.FC<LogoProps> = (props) => {
  const theme = useSeasonalTheme()

  return (
    <div 
      className="logo-with-text"
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        color: theme.textColor
      }}
    >
      <Logo {...props} />
      <div className="logo-text" style={{ marginLeft: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          Journal du Lycée Ozenne
        </h1>
        <p 
          style={{ 
            margin: 0, 
            fontSize: '0.9rem',
            color: theme.secondaryColor 
          }}
        >
          Voix des élèves, reflet de notre lycée
        </p>
      </div>
    </div>
  )
}