export function previewFeedback(...message) { window.dispatchEvent(new CustomEvent('invariant-feedback', { detail: message.join(' ') + ' · preview only' })); }
