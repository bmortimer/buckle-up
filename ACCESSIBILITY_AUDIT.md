# ACCESSIBILITY AUDIT REPORT: Who Has The Belt
## Championship Belt Tracker - WNBA, NBA & NHL

**Date:** January 28, 2026  
**URL:** https://whohasthebelt.com  
**Scope:** Full website including WNBA, NBA, NHL sections  
**Framework:** Next.js/React with Tailwind CSS  

---

## EXECUTIVE SUMMARY

The site demonstrates good foundational accessibility practices but contains several critical and moderate issues that should be addressed before launch. Key concerns include:

- **Critical:** Missing keyboard navigation support for interactive modals
- **Critical:** Insufficient focus indicators on interactive elements
- **Major:** Poor semantic HTML in several components
- **Major:** Color contrast issues in some UI elements
- **Moderate:** Missing ARIA labels and descriptions
- **Moderate:** Emoji/icon accessibility needs improvement

**WCAG 2.1 Compliance Level:** Approximately 70-75% (needs improvement to reach AA standard)

---

## DETAILED FINDINGS

### 1. SEMANTIC HTML USAGE

#### Status: MODERATE ISSUES

**Issues Found:**

1. **Missing `<nav>` element for main navigation**
   - Location: `/app/page.tsx` (league selection section)
   - Issue: League links use generic `<div>` containers instead of proper navigation
   - Impact: Screen readers cannot identify this as a navigation region
   - WCAG: 1.3.1 Info and Relationships (Level A)

2. **Inconsistent heading hierarchy**
   - Location: Multiple components (BeltHolderCard, DetailedCalendar, NextGamePreview)
   - Issue: Headers are rendered as inline elements with styling, not semantic `<h2>`/`<h3>` tags
   - Example: `<div className="...font-orbitron..."><span aria-hidden="true">◆ </span><h2 className="inline font-normal">...</h2></div>`
   - Impact: Inconsistent document structure for assistive technologies
   - WCAG: 1.3.1 Info and Relationships (Level A)

3. **Missing `<main>` landmark alternative**
   - Location: `/app/layout.tsx`
   - Issue: `<main>` element is used correctly, but no other semantic landmarks (aside, nav) for alternate content
   - Impact: Users with screen readers can't easily jump between regions
   - WCAG: 1.3.1 Info and Relationships (Level A)

4. **Decorative dividers using semantic spacing**
   - Multiple locations
   - Issue: Dividers like `<div className="h-px bg-gradient-to-r..." />` are purely decorative but take up DOM space
   - Impact: Screen reader verbosity; clutters semantic structure
   - WCAG: 1.3.2 Meaningful Sequence (Level A)

5. **`<details>` elements for FAQ (About page)**
   - Location: `/app/about/page.tsx`
   - Status: GOOD - Properly uses `<details>` and `<summary>` for disclosure patterns
   - Minor Issue: No explicit label for the accordion region

---

### 2. ARIA LABELS AND ROLES

#### Status: MODERATE ISSUES

**Issues Found:**

1. **Modal dialogs lack proper labeling**
   - Location: TeamSelector.tsx, SeasonPicker.tsx
   - Issue: Modal has `aria-modal="true"` and `aria-labelledby`, but:
     - Dialog trigger button (line 119-120 in TeamSelector.tsx) has `aria-haspopup="dialog"` ✓
     - But the dialog itself could benefit from more explicit aria-label
     - Close button has aria-label but is visually prominent with × symbol
   - Example:
     ```tsx
     <div
       role="dialog"
       aria-modal="true"
       aria-labelledby="team-select-dialog-title"
     > // Should also have aria-label as fallback
     ```
   - WCAG: 1.3.1 Info and Relationships (Level A)

2. **Image alt text missing on decorative elements**
   - Location: TeamLogo.tsx, CalendarDayPopup.tsx
   - Status: MOSTLY GOOD - `<Image>` components have alt text
   - Issue: Decorative icons and emojis lack proper labeling
     - Example: Trophy emoji 🏆 in Next Title Bout has no aria-label
     - Lightning bolt ⚡ in belt change indicator has no aria-label
     - Team code display in fallback: uses `role="img"` with `aria-label` ✓
   - WCAG: 1.1.1 Non-text Content (Level A)

3. **Button labels unclear for icon-only buttons**
   - Location: ThemeSwitcher.tsx (GOOD), SeasonPicker close button
   - Status: MOSTLY GOOD
   - Example in ThemeSwitcher: `aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}` ✓
   - Minor: Reset buttons use text "Reset ×" which is clear

4. **Interactive elements missing ARIA descriptions**
   - Location: Calendar day cells in DetailedCalendar.tsx
   - Issue: Clickable day cells have complex state but no aria-label or aria-describedby
   - Example: Cell shows date, belt holder indicator, and game outcome - all with no explanation
   - WCAG: 4.1.2 Name, Role, Value (Level A)

5. **Links to external resources lack indication**
   - Location: /app/about/page.tsx (multiple links)
   - Status: GOOD - has `target="_blank" rel="noopener noreferrer"`
   - Missing: No `aria-label` to indicate opening in new window
   - WCAG: 3.2.2 On Input (Level A)

---

### 3. KEYBOARD NAVIGATION

#### Status: CRITICAL ISSUES

**Issues Found:**

1. **Modal trap focus not implemented**
   - Location: TeamSelector.tsx (line 135-300), SeasonPicker.tsx (line 115-212)
   - Issue: When modal opens, focus is NOT trapped within the modal
   - Impact: Users can tab outside modal, breaking the interaction pattern
   - Missing: 
     - Focus trap on modal open
     - Return focus to trigger button on close
     - Prevention of background content interaction
   - WCAG: 2.1.1 Keyboard (Level A), 2.4.3 Focus Order (Level A)
   - **Severity: CRITICAL - Modal accessibility is broken for keyboard users**

2. **Backdrop click handling**
   - Location: TeamSelector.tsx, SeasonPicker.tsx, CalendarDayPopup.tsx
   - Issue: Backdrop is clickable but not keyboard accessible
   - Current code: `<div className="..." onClick={() => setIsOpen(false)} />`
   - Missing: `onKeyDown` handler for Escape key
   - Note: Escape key closing isn't implemented (common pattern users expect)
   - WCAG: 2.1.1 Keyboard (Level A)

3. **Calendar grid lacks keyboard navigation**
   - Location: DetailedCalendar.tsx
   - Issue: Calendar day cells are clickable but have no keyboard support
   - Current code: `onClick={(e) => { ... }}`
   - Missing: Arrow key navigation (Up/Down/Left/Right)
   - Missing: Home/End keys to jump to start/end of month
   - Missing: `tabindex` management for grid navigation
   - WCAG: 2.1.1 Keyboard (Level A)

4. **Tab order issues**
   - Location: Several components
   - Issue: Team selection buttons in grid layout may have confusing tab order
   - Missing: Explicit `tabindex="0"` on first item with tab order management
   - WCAG: 2.4.3 Focus Order (Level A)

5. **Escape key not consistently handled**
   - Location: All modal dialogs
   - Issue: No explicit onKeyDown handler for Escape key
   - Current: Only backdrop click closes modal
   - WCAG: 2.1.1 Keyboard (Level A)

---

### 4. ALT TEXT FOR IMAGES

#### Status: GOOD with MINOR ISSUES

**Issues Found:**

1. **Team logos have proper alt text**
   - Location: TeamLogo.tsx (line 133, 150)
   - Status: GOOD ✓
   - Example: `alt={`${displayName} logo`}`

2. **Fallback team code display is accessible**
   - Location: TeamLogo.tsx (line 167-168)
   - Status: GOOD ✓
   - Uses `role="img"` with `aria-label`

3. **Decorative graphics lack alt descriptions**
   - Location: Multiple locations
   - Issue: Decorative elements (rivets, LED strips) have no alt or aria-hidden
   - Examples:
     - Corner rivets: `<div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />`
     - LED bars: `<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r..." />`
   - Current: Not marked as decorative
   - Fix needed: Add `aria-hidden="true"` where they're purely decorative
   - WCAG: 1.1.1 Non-text Content (Level A)

4. **Emoji icons need descriptions**
   - Location: DetailedCalendar.tsx (line 365), CalendarDayPopup.tsx (line 142)
   - Issue: Trophy emoji 🏆 and lightning ⚡ have no alt/aria-label
   - Examples:
     ```tsx
     <span className="text-sm">🏆</span>  // Missing aria-label
     <div className="...text-[0.6rem]...">⚡</div>  // Missing aria-label
     ```
   - WCAG: 1.1.1 Non-text Content (Level A)

5. **External images (OG image)**
   - Location: /app/layout.tsx, page.tsx
   - Status: GOOD ✓
   - Has `alt` in metadata: `'Championship Belt Tracker - Lineal Title History'`

---

### 5. COLOR CONTRAST

#### Status: MODERATE ISSUES

**Issues Found:**

1. **Muted text elements may have insufficient contrast**
   - Location: Multiple locations using `text-muted-foreground`
   - Defined in globals.css:
     - Light mode: `--muted-foreground: 220 9% 46%` (approx 5.8:1 on white - PASS AA)
     - Dark mode: `--muted-foreground: 215 20% 55%` (approx 4.2:1 on dark background - BORDERLINE)
   - Issue: Dark mode muted text on dark background is borderline WCAG AA compliance
   - Elements affected: Helper text, labels, secondary information
   - WCAG: 1.4.3 Contrast (Minimum) (Level AA)

2. **Subtle decorative lines**
   - Location: Throughout (divider lines, borders)
   - Example: `<div className="h-px bg-gradient-to-r from-border/40 to-transparent" />`
   - Issue: Border color with opacity 40% may not meet contrast ratio
   - Current: `--border: 220 13% 88%` (light) | `217 33% 18%` (dark)
   - Impact: Border clarity depends on background
   - WCAG: 1.4.3 Contrast (Minimum) (Level AA)

3. **LED-text with colored styling**
   - Location: BeltHolderCard.tsx, statistics displays
   - Example: `style={{ color: 'hsl(var(--led-green))' }}`
   - Issue: LED colors (green, red, amber) contrast against backgrounds
   - Status: Generally GOOD (LED colors are vibrant)
   - Minor: When placed on colored backgrounds, contrast may vary

4. **Placeholder text in buttons**
   - Location: Team selector, season picker
   - Inactive state: `text-muted-foreground` on `bg-card`
   - Status: ACCEPTABLE for non-critical text
   - Contrast: ~4.5:1 (AA compliant for normal text, but not for UI components)
   - WCAG: 1.4.11 Non-text Contrast (Level AA)

5. **Hover/Focus states color changes**
   - Location: Multiple interactive elements
   - Issue: Not all state changes are visible by color change alone
   - Good: Uses scale transform and border color changes in addition to color
   - But: Some elements rely primarily on opacity/color change

---

### 6. FORM LABELS AND ACCESSIBILITY

#### Status: MODERATE ISSUES

**Issues Found:**

1. **No explicit form elements on site**
   - Status: Site is primarily view-only, no input forms
   - Note: Uses modals for team/season selection (not traditional forms)

2. **Select-like components lack proper form semantics**
   - Location: TeamSelector.tsx (lines 98-304), SeasonPicker.tsx (lines 95-215)
   - Issue: Custom dropdown using button + modal pattern
   - Current implementation:
     ```tsx
     <button
       aria-labelledby="team-filter-label"
       aria-haspopup="dialog"
     >
     ```
   - Missing: Proper form `<fieldset>` for grouping
   - Missing: Form submission/state change notifications
   - Status: Pattern is acceptable for view-only app, but not ideal for user input changes
   - WCAG: 1.3.1 Info and Relationships (Level A)

3. **Modal with selection buttons**
   - Location: Team/Season selection modals
   - Good: Uses `aria-current="true"` to indicate selected state ✓
   - Missing: `aria-label` on individual selection buttons for clarity
   - Example should be:
     ```tsx
     <button
       aria-current={isSelected ? 'true' : undefined}
       aria-label={`Select ${teamName}`}
     >
     ```
   - WCAG: 1.3.1 Info and Relationships (Level A)

4. **Reset buttons lack context**
   - Location: TeamSelector.tsx (line 106-113), SeasonPicker.tsx (line 86-93)
   - Current: `aria-label="Reset to All Teams"` ✓
   - Status: GOOD

5. **URL parameter handling not announced**
   - Location: BeltDashboard.tsx (uses useSearchParams)
   - Issue: When URL parameters change state, no notification to screen readers
   - Missing: `aria-live` region for updates
   - WCAG: 4.1.3 Status Messages (Level AA)

---

### 7. FOCUS INDICATORS

#### Status: CRITICAL ISSUES

**Issues Found:**

1. **Insufficient focus indicators on buttons**
   - Location: Multiple button elements
   - Good examples:
     - ThemeSwitcher.tsx (line 29): `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` ✓
   - Bad examples:
     - TeamSelector buttons (line 200-217, 237-254): NO focus-visible styles
       ```tsx
       <button
         onClick={() => handleTeamChange(team)}
         className={`
           p-3 flex flex-col items-center gap-2
           border-2 transition-all
           ${isSelected ? '...' : '...'}
         `}
       > // Missing focus-visible styling
       ```
   - SeasonPicker year buttons (line 188-202): Same issue
   - WCAG: 2.4.7 Focus Visible (Level AA)
   - **Severity: CRITICAL - Keyboard users cannot see which element has focus**

2. **Missing focus styling on calendar cells**
   - Location: DetailedCalendar.tsx (line 309-369)
   - Issue: Calendar day cells are clickable but have NO focus-visible styling
   - Current: `onClick={(e) => { ... }}` with no focus styles
   - Missing:
     ```tsx
     focus-visible:outline-2
     focus-visible:outline-offset-2
     focus-visible:outline-ring
     ```
   - WCAG: 2.4.7 Focus Visible (Level AA)
   - **Severity: CRITICAL - Calendar is unusable with keyboard**

3. **Modal backdrop shouldn't receive focus**
   - Location: TeamSelector.tsx (line 138-141), SeasonPicker.tsx (line 118-121)
   - Current: Backdrop is a clickable div with no keyboard handling
   - Missing: `pointer-events: none` to remove from tab order
   - Or: Should be removed from focus entirely with pointer events
   - WCAG: 2.4.3 Focus Order (Level A)

4. **Menu/dropdown buttons lack indication**
   - Location: SeasonPicker button (line 97-112)
   - Status: GOOD - has hover state that's visible
   - Missing: focus-visible ring
   - Fix needed: Add `focus-visible:ring-2 focus-visible:ring-ring`

5. **Link focus not visible on About page**
   - Location: /app/about/page.tsx (multiple links)
   - Example: `<Link href="..." className="text-primary hover:opacity-80 underline">`
   - Issue: No focus-visible styling
   - Missing: `focus-visible:outline-2 focus-visible:outline-offset-2`
   - WCAG: 2.4.7 Focus Visible (Level AA)

---

### 8. SCREEN READER COMPATIBILITY

#### Status: GOOD with AREAS FOR IMPROVEMENT

**Issues Found:**

1. **Aria-hidden used correctly for decorative elements**
   - Status: GOOD
   - Examples in `/app/page.tsx`:
     ```tsx
     <span aria-hidden="true">◆ </span>  // Decorative diamond
     ```
   - But: Not consistently applied to all decorative elements

2. **Heading structure accessible to screen readers**
   - Status: MOSTLY GOOD
   - Issue: Inline `<h2>` tags within label divs may confuse structure
   - Example from TeamSelector.tsx:
     ```tsx
     <span id="team-filter-label" className="...">
       <span aria-hidden="true">◆ </span>Filter by Team
     </span>
     ```
   - Should be:
     ```tsx
     <h2 id="team-filter-label" className="...">
       <span aria-hidden="true">◆ </span>Filter by Team
     </h2>
     ```

3. **Dynamic content updates**
   - Location: DetailedCalendar.tsx, calendar updates
   - Issue: No `aria-live` region for status updates
   - When calendar is clicked: No announcement that content changed
   - Missing: `aria-live="polite"` region for day selection feedback
   - WCAG: 4.1.3 Status Messages (Level AA)

4. **Navigation announcements**
   - When modals open/close: No announcement
   - Missing: Screen reader message like "Team selection dialog opened"
   - Could use: `aria-live` region or screen reader announcements
   - WCAG: 4.1.3 Status Messages (Level AA)

5. **Table structure for statistics**
   - Location: BeltHolderCard.tsx (stats grid)
   - Issue: Stats are displayed as divs, not proper table
   - Example: Belt Games, W-L Record, Longest Streak
   - Current: Just styled divs without semantic structure
   - Should be: `<table>` or properly labeled with ARIA roles
   - WCAG: 1.3.1 Info and Relationships (Level A)

6. **List structure for belt changes**
   - Location: Last5BeltChanges.tsx
   - Issue: Belt change history is shown in a flex layout, not a list
   - Missing: `<ol>` or `<ul>` semantic markup
   - Should announce as "List of 5 items" to screen readers
   - WCAG: 1.3.1 Info and Relationships (Level A)

---

## WCAG 2.1 VIOLATIONS SUMMARY

### Level A Violations (Must Fix)
1. **2.1.1 Keyboard** - Modal focus trap missing, calendar not keyboard navigable
2. **2.4.3 Focus Order** - Backdrop and calendar elements have unclear tab order
3. **1.3.1 Info and Relationships** - Missing semantic HTML structure in several areas
4. **1.1.1 Non-text Content** - Emoji and icons lack descriptions
5. **4.1.2 Name, Role, Value** - Calendar cells lack proper labels

### Level AA Violations (Should Fix)
1. **2.4.7 Focus Visible** - Many interactive elements missing focus indicators
2. **1.4.3 Contrast (Minimum)** - Muted text in dark mode borderline compliant
3. **4.1.3 Status Messages** - No notifications for dynamic updates
4. **1.4.11 Non-text Contrast** - Some UI elements lack sufficient contrast

---

## RECOMMENDATIONS BY PRIORITY

### CRITICAL (Fix Before Launch)
1. **Implement modal focus trap**
   - Use a focus management library (headlessui, radix-ui) or custom hook
   - Location: TeamSelector.tsx, SeasonPicker.tsx
   - Impact: Makes modals usable with keyboard

2. **Add focus-visible styling to ALL buttons**
   - Add to: Team selection buttons, season buttons, calendar cells
   - Classes needed: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring`
   - Impact: Keyboard users can see what's focused

3. **Implement Escape key handling for modals**
   - Add: `onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}`
   - Locations: All modal dialogs
   - Impact: Standard modal behavior

### HIGH (Fix Soon)
1. **Add keyboard navigation to calendar**
   - Arrow keys for day navigation
   - Home/End for month navigation
   - Enter to select
   - Impact: Calendar usable with keyboard

2. **Add aria-label to calendar cells**
   - Include: date, belt holder, game status
   - Pattern: "Tuesday, January 28. Lakers hold belt. Played vs Celtics. Belt changed hands."
   - Impact: Screen reader users understand cell content

3. **Add aria-hidden to decorative elements**
   - Corner rivets, LED bars, divider lines
   - Mark all purely decorative elements with `aria-hidden="true"`
   - Impact: Cleaner screen reader experience

4. **Improve heading structure**
   - Use semantic `<h2>` for section headers
   - Remove inline h2 within label divs
   - Impact: Better document structure

### MEDIUM (Improve UX)
1. **Add aria-live region for calendar selection**
   - Announce selected day details on click
   - Status: "August 15, 2024. Warriors hold belt. Game: Warriors 102 vs Spurs 95. Belt changed."
   - Impact: Screen reader users get feedback

2. **Add aria-label to interactive elements**
   - "Select Warriors team"
   - "Pick 2024 season"
   - Impact: More explicit labeling

3. **Improve dark mode contrast**
   - Increase muted-foreground brightness in dark mode
   - Current: ~4.2:1 on dark background
   - Target: >= 4.5:1 for all text
   - Impact: Better readability

4. **Add screen reader navigation**
   - Announce "You are on the 2024 NBA Dashboard"
   - "Current belt holder: Boston Celtics"
   - Use: `aria-label` or page heading
   - Impact: Orientation for screen reader users

### LOW (Nice to Have)
1. Add skip to content link
2. Implement page landmarks with navigation
3. Add breadcrumb navigation
4. Announce new games/updates with aria-live regions
5. Add extended descriptions for complex graphics

---

## TESTING RECOMMENDATIONS

### Tools to Use
1. **axe DevTools** - Automated accessibility scanning
2. **NVDA** (free) or **JAWS** (commercial) - Screen reader testing
3. **WebAIM Contrast Checker** - Color contrast validation
4. **Lighthouse** - Chrome's built-in accessibility audit
5. **Keyboard-only testing** - Disable mouse, test with Tab, Enter, Escape

### Manual Testing Checklist
- [ ] Tab through entire page - all interactive elements should be reachable
- [ ] Tab with screen reader on - content should make sense
- [ ] Test all modals with keyboard - Escape should close, focus should trap
- [ ] Test calendar with arrow keys - should navigate between days
- [ ] Check color contrast - use WebAIM tool
- [ ] Check focus indicators - all buttons should have visible focus

### Browsers to Test
- Chrome/Edge with axe DevTools
- Firefox with axe DevTools
- Safari with VoiceOver

---

## RESOURCES & REFERENCES

### WCAG 2.1 Standards
- https://www.w3.org/WAI/WCAG21/quickref/
- https://www.w3.org/WAI/test-evaluate/

### Accessibility Libraries (Recommended)
- headlessui - Unstyled, accessible components
- radix-ui - Primitives for building accessible designs
- aria-toolkit - ARIA implementation helpers

### Focus Management
- Focus-visible polyfill for older browsers
- Custom focus trap: https://www.npmjs.com/package/focus-trap

### Learn More
- WebAIM - https://webaim.org/
- MDN Accessibility - https://developer.mozilla.org/en-US/docs/Web/Accessibility
- A11y Project - https://www.a11yproject.com/

---

## CONCLUSION

This is a well-designed site with good visual aesthetics and solid foundation for accessibility. The main issues are:

1. **Critical:** Missing keyboard support for modals and calendar
2. **Critical:** Missing focus indicators
3. **Major:** Missing semantic HTML structure
4. **Major:** Missing ARIA labels for complex components

With focused effort on the critical items (estimated 2-3 days of development), this site can reach WCAG 2.1 AA compliance. The estimated effort breakdown:

- Focus indicators: 2 hours
- Modal keyboard handling: 3 hours  
- Calendar keyboard navigation: 4 hours
- ARIA labels and semantic HTML: 4 hours
- Testing and refinement: 3 hours

**Total estimated effort: 16 hours**

The site is NOT READY for launch from an accessibility perspective, but is very close. With these fixes, it will be a model of accessible sports tracking application.

---

**Report Prepared By:** Accessibility Audit Tool  
**Compliance Target:** WCAG 2.1 Level AA  
**Current Estimate:** 70-75% Compliant (needs work)
