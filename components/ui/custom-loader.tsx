import React from 'react'

interface CustomLoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'calc(32 * var(--size))',  // 32px
    md: 'calc(48 * var(--size))',  // 48px (default)
    lg: 'calc(64 * var(--size))'   // 64px
  }

  return (
    <>
      <span 
        className={`custom-loader ${className}`}
        style={{
          '--loader-size': sizeMap[size]
        } as React.CSSProperties}
      ></span>
      <style jsx>{`
        .custom-loader {
          --color-1: #fff;
          --color-2: #ff3d00;
          --size: 1px;
          transform: rotateZ(45deg);
          perspective: calc(1000 * var(--size));
          border-radius: 50%;
          width: var(--loader-size, calc(48 * var(--size)));
          height: var(--loader-size, calc(48 * var(--size)));
          color: var(--color-1);
          display: inline-block;
          position: relative;
        }
        .custom-loader:before,
        .custom-loader:after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: inherit;
          height: inherit;
          border-radius: 50%;
          transform: rotateX(70deg);
          animation: 1s spin-loader linear infinite;
        }
        .custom-loader:after {
          color: var(--color-2);
          transform: rotateY(70deg);
          animation-delay: 0.4s;
        }
        @keyframes spin-loader {
          0%, 100% {
            box-shadow: 0.2em 0 0 0 currentcolor;
          }
          12% {
            box-shadow: 0.2em 0.2em 0 0 currentcolor;
          }
          25% {
            box-shadow: 0 0.2em 0 0 currentcolor;
          }
          37% {
            box-shadow: -0.2em 0.2em 0 0 currentcolor;
          }
          50% {
            box-shadow: -0.2em 0 0 0 currentcolor;
          }
          62% {
            box-shadow: -0.2em -0.2em 0 0 currentcolor;
          }
          75% {
            box-shadow: 0 -0.2em 0 0 currentcolor;
          }
          87% {
            box-shadow: 0.2em -0.2em 0 0 currentcolor;
          }
        }
      `}</style>
    </>
  )
}
