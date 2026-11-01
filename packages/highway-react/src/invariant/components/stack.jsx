"use client";
const gaps = { xs:'gap-1', sm:'gap-2', md:'gap-4', lg:'gap-6', xl:'gap-10' }
const aligns = { start:'items-start', center:'items-center', end:'items-end', stretch:'items-stretch', baseline:'items-baseline' }
const justifies = { start:'justify-start', center:'justify-center', end:'justify-end', between:'justify-between', around:'justify-around' }
/** @param {import('../types').StackProps} props */
export function Stack({ direction = 'vertical', gap = 'md', align, justify = 'start', wrap = false, as: Tag = 'div', className = '', children, ...rest }) {
  return <Tag className={`flex ${direction === 'horizontal' ? '' : 'flex-col'} ${gaps[gap] || gaps.md} ${aligns[align] || ''} ${justifies[justify] || ''} ${wrap ? 'flex-wrap' : ''} ${className}`} {...rest}>{children}</Tag>
}
