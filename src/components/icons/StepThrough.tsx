import React from 'react'
type IconProps = {
  className?: string
  fill?: string
}
export const StepThrough = ({ className, fill }: IconProps): JSX.Element => {
  return (
    <svg width='23' height='22' viewBox='0 0 23 22' fill={fill ? fill : 'currentColor'} className={className}>
      <path d='M0.333984 19.3334H8.33398V16.6667H0.333984V19.3334ZM21.6673 0.666748H0.333984V3.33341H21.6673V0.666748ZM17.6673 8.66675H0.333984V11.3334H18.0007C19.4673 11.3334 20.6673 12.5334 20.6673 14.0001C20.6673 15.4667 19.4673 16.6667 18.0007 16.6667H15.0007V14.0001L11.0007 18.0001L15.0007 22.0001V19.3334H17.6673C20.614 19.3334 23.0007 16.9467 23.0007 14.0001C23.0007 11.0534 20.614 8.66675 17.6673 8.66675Z' />
    </svg>
  )
}
