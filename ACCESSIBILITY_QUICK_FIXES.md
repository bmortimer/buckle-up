# Quick Fix Checklist - Accessibility Issues

## CRITICAL FIXES (Must do before launch) - ~10 hours

### 1. Add Focus Indicators to All Buttons
**Files to modify:**
- `/web/components/TeamSelector.tsx` - lines 200-217, 237-254, 274-291
- `/web/components/SeasonPicker.tsx` - lines 188-202
- `/web/components/DetailedCalendar.tsx` - line 309-369
- `/web/app/about/page.tsx` - all Link elements

**What to add:**
```tsx
className={`
  // ... existing classes ...
  focus-visible:ring-2 
  focus-visible:ring-ring 
  focus-visible:ring-offset-2
`}
```

**Time: 2 hours**

---

### 2. ~~Implement Modal Focus Trap~~ ✅ COMPLETE
**Files modified:**
- `/web/components/TeamSelector.tsx`
- `/web/components/SeasonPicker.tsx`
- `/web/components/CalendarDayPopup.tsx`

**What was done:**
- ✅ Added Escape key handler
- ✅ Trapped focus within modal (Tab key cycling)
- ✅ Focus moves to close button when modal opens
- ✅ Return focus to trigger button on close

**Time: DONE**

---

### 3. ~~Mark Decorative Elements~~ ✅ COMPLETE
**Files modified:**
- `/web/components/BeltHolderCard.tsx` - corner rivets, LED bar
- `/web/components/NextGamePreview.tsx` - corner rivets, LED bars
- `/web/app/page.tsx` - LED strips, corner rivets
- `/web/app/about/page.tsx` - corner rivets (all sections)

**What was done:**
- ✅ Added `aria-hidden="true"` to all corner rivets
- ✅ Added `aria-hidden="true"` to all LED bars/strips
- ✅ Decorative dividers already had `aria-hidden="true"` where needed

**Time: DONE**

---

### 4. ~~Add Aria-Label to Emoji/Icons~~ ✅ COMPLETE
**Files modified:**
- `/web/components/CalendarDayPopup.tsx` — All emojis (🏆, ⚡) already had `aria-hidden="true"` with accompanying text
- `/web/components/DetailedCalendar.tsx` — Added `aria-hidden="true"` to calendar cell emojis (⚡ belt change, 🏆 title bout)

**What was done:**
- ✅ Popup emojis: Already correctly marked as decorative with `aria-hidden="true"` + text labels
- ✅ Calendar cell emojis: Added `aria-hidden="true"` (cell will get aria-label via item 5)

**Time: DONE**

---

## HIGH PRIORITY FIXES (Should fix soon) - ~6 hours

### 5. ~~Add Aria-Label to Calendar Cells~~ ✅ COMPLETE
**File:** `/web/components/DetailedCalendar.tsx`

**What was done:**
- ✅ Added `role="button"` and `tabIndex={0}` for keyboard accessibility
- ✅ Added comprehensive `aria-label` describing each day's belt status
- ✅ Added `aria-pressed` to indicate selected state
- ✅ Added `onKeyDown` handler for Enter/Space activation
- ✅ Added focus-visible ring for keyboard navigation

**Labels cover all scenarios:**
- Game day with belt defended: "January 15. Lakers at Celtics, 98-105. Celtics defended the belt."
- Game day with belt change: "January 16. Heat at Celtics, 110-102. Belt changed hands to Heat."
- Game day with tie: "January 17. Bruins at Maple Leafs, tied 3-3. Maple Leafs retains belt."
- Upcoming title bout: "January 20. Upcoming title bout: Celtics vs Heat."
- Uncertain future: "January 21. Belt holder unknown, waiting for title bout result."
- Off day: "January 18. No game. Celtics holds the belt."

**Time: DONE**

---

### 6. ~~Add Escape Key to Calendar Popup~~ ✅ COMPLETE
**File:** `/web/components/CalendarDayPopup.tsx`

**What was done:**
- ✅ Added Escape key handler
- ✅ Added focus trap (Tab key cycling)
- ✅ Focus moves to close button when popup opens

**Time: DONE**

---

### 7. Improve Heading Structure
**Files to modify:**
- `/web/components/TeamSelector.tsx` - line 152-155
- `/web/components/SeasonPicker.tsx` - line 133-135
- `/web/components/BeltHolderCard.tsx` - line 24-27
- All other components with headers

**What to change:**
```tsx
// From:
<div className="...">
  <span aria-hidden="true">◆ </span>
  <h2 className="inline">Title</h2>
</div>

// To:
<h2 className="...">
  <span aria-hidden="true">◆ </span>
  Title
</h2>
```

**Time: 2 hours**

---

### 8. ~~Add Navigation Landmark~~ ✅ COMPLETE
**File:** `/web/app/page.tsx`

**What was done:**
- ✅ Changed `<section>` to `<nav>` with `aria-label="League selection"`

**Time: DONE**

---

## MEDIUM PRIORITY FIXES (Nice to have) - ~4 hours

### 9. ~~Add aria-live Region for Calendar~~ ✅ COMPLETE
**File:** `/web/components/DetailedCalendar.tsx`

**What was done:**
- ✅ Added `announcement` state for live region content
- ✅ Added `aria-live="polite"` region with `sr-only` class
- ✅ Announcements triggered on day selection with full context
- ✅ Announcements cleared when popup is closed

**Time: DONE**

---

### 10. Improve Dark Mode Contrast
**File:** `/web/app/globals.css` - line 62

**What to change:**
```css
/* Current: */
--muted-foreground: 215 20% 55%;

/* Change to: */
--muted-foreground: 215 20% 60%;  /* Slightly lighter */
```

**Time: 0.5 hours**

---

### 11. Add Aria-Label to Selection Buttons
**Files:**
- `/web/components/TeamSelector.tsx` - line 200, 237, 274
- `/web/components/SeasonPicker.tsx` - line 188

**What to add:**
```tsx
aria-label={`Select ${displayName}`}
```

**Time: 1 hour**

---

## TESTING CHECKLIST

- [ ] Tab through entire page with keyboard only
- [ ] Test modals with Tab and Escape keys
- [ ] Use NVDA/JAWS to verify structure
- [ ] Check focus indicators on all buttons
- [ ] Verify contrast ratios with WebAIM tool
- [ ] Test in Chrome with axe DevTools
- [ ] Verify calendar navigation with arrow keys

---

## Files Most Affected

Priority order:
1. TeamSelector.tsx - multiple critical issues
2. SeasonPicker.tsx - focus trap, keyboard
3. DetailedCalendar.tsx - calendar nav, labels
4. BeltHolderCard.tsx - semantic HTML
5. All components - aria-hidden on decorative elements

---

## RECOMMENDED TOOLS TO INSTALL

```bash
npm install focus-trap-react
# OR
npm install @headlessui/react  # Better modal support
```

Use headlessui for modals to automatically get focus management, keyboard handling, etc.

---

## ESTIMATED TOTAL TIME

- Critical fixes: ~~10 hours~~ **~6 hours remaining** (Items 2, 3, 4 complete)
- High priority: ~~6 hours~~ **~3 hours remaining** (Items 5, 6, 8 complete)
- Medium priority: ~~4 hours~~ **~2 hours remaining** (Item 9 complete)
- **Total: ~11 hours remaining** (down from 20 hours)

### Completed Items:
- ✅ Item 2: Modal Focus Trap (TeamSelector, SeasonPicker, CalendarDayPopup)
- ✅ Item 3: Mark Decorative Elements (BeltHolderCard, NextGamePreview, page.tsx, about/page.tsx)
- ✅ Item 4: Emoji/Icon Accessibility (CalendarDayPopup, DetailedCalendar)
- ✅ Item 5: Aria-Labels on Calendar Cells (DetailedCalendar)
- ✅ Item 6: Escape Key for Calendar Popup
- ✅ Item 8: Navigation Landmark for League Selection
- ✅ Item 9: Aria-Live Region for Calendar (DetailedCalendar)

---

## Files That Are GOOD (No changes needed)

- ThemeSwitcher.tsx - Already has good focus handling ✓
- TeamLogo.tsx - Alt text is correct ✓
- layout.tsx - Uses semantic main element ✓
- about/page.tsx - Details/summary pattern is good ✓
