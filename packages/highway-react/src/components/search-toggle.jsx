"use client";
import { SearchBar } from './search-bar.jsx'
/** Compatibility name for the expandable SearchBar. */
/** @param {Omit<import('../types').SearchBarProps, 'expandable'>} props */
export function SearchToggle(props) { return <SearchBar placeholder="Search anything..." {...props} expandable/> }
