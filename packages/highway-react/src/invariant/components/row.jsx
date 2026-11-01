"use client";
import { Stack } from './stack.jsx'
/** Compatibility layout preserving Row's centered cross-axis default. */
/** @param {Omit<import('../types').StackProps, 'direction'>} props */
export function Row({ align = 'center', ...props }) { return <Stack {...props} direction="horizontal" align={align}/> }
