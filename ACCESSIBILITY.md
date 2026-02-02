# Accessibility

The Championship Belt Tracker targets WCAG 2.1 Level AA compliance.

## Status

An accessibility audit was conducted in January 2026. All identified issues have been addressed:

- **Focus indicators** - All interactive elements have visible focus rings
- **Modal focus traps** - Focus is properly contained within modals; Escape key closes them
- **Keyboard navigation** - Calendar cells and all buttons are keyboard accessible
- **Decorative elements** - Marked with `aria-hidden="true"` to reduce screen reader noise
- **ARIA labels** - Calendar cells include descriptive labels for screen readers
- **Semantic HTML** - Proper heading hierarchy and landmarks throughout
- **Color contrast** - Dark mode muted text meets 4.5:1 ratio
- **Live regions** - Calendar selection changes are announced to screen readers

## Testing

Recommended tools for verification:
- axe DevTools (browser extension)
- NVDA or VoiceOver for screen reader testing
- Keyboard-only navigation (Tab, Enter, Escape)

## Known Limitations

- Calendar does not support arrow key navigation between days (Tab navigation works)
- No skip-to-content link (single-page app with minimal header)
