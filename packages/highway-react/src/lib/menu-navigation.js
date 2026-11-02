/** Keyboard movement shared by authored menu shells; layout/material stay with each shell. */
export function menuItems(menu) {
  return [...(menu?.querySelectorAll('[role^="menuitem"]') || [])].filter(item => !item.disabled && item.closest('[role="menu"]') === menu)
}
export function navigateMenu(event, choices, current) {
  if (!choices.length) return
  let next
  if (event.key === 'ArrowDown') next = (current + 1) % choices.length
  else if (event.key === 'ArrowUp') next = current < 0 ? choices.length - 1 : (current - 1 + choices.length) % choices.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = choices.length - 1
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
    next = choices.findIndex((_, offset) => choices[(current + 1 + offset) % choices.length].textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()))
    if (next >= 0) next = (current + 1 + next) % choices.length
  }
  if (next === undefined || next < 0) return
  event.preventDefault(); event.stopPropagation(); choices[next]?.focus()
}
