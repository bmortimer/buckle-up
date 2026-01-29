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

### 2. Implement Modal Focus Trap
**Files to modify:**
- `/web/components/TeamSelector.tsx` - line 135-300
- `/web/components/SeasonPicker.tsx` - line 115-212

**What to do:**
- Add Escape key handler
- Trap focus within modal
- Return focus to trigger button on close

**Option A (Simple):** Add to modal component:
```tsx
useEffect(() => {
  if (!isOpen) return;
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };
  
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [isOpen, setIsOpen]);
```

**Option B (Better):** Use headlessui Dialog or radix-ui Dialog

**Time: 3 hours**

---

### 3. Mark Decorative Elements
**Files to modify:**
- `/web/components/BeltHolderCard.tsx` - all corner rivets, LED bars
- `/web/components/DetailedCalendar.tsx` - decorative lines
- `/web/components/NextGamePreview.tsx` - corner rivets
- `/web/app/page.tsx` - LED strips, corner rivets
- `/web/app/about/page.tsx` - decorative elements

**What to add:**
```tsx
// Change this:
<div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" />

// To this:
<div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-border opacity-50" aria-hidden="true" />
```

Also mark decorative dividers and LED bars with `aria-hidden="true"`

**Time: 1.5 hours**

---

### 4. Add Aria-Label to Emoji/Icons
**Files to modify:**
- `/web/components/DetailedCalendar.tsx` - line 365 (trophy emoji)
- `/web/components/CalendarDayPopup.tsx` - line 142 (trophy emoji)
- `/web/components/DetailedCalendar.tsx` - line 339 (lightning emoji)

**What to add:**
```tsx
// Change this:
<span className="text-sm">🏆</span>

// To this:
<span className="text-sm" aria-label="Trophy - Title bout">🏆</span>
```

**Time: 0.5 hours**

---

## HIGH PRIORITY FIXES (Should fix soon) - ~6 hours

### 5. Add Aria-Label to Calendar Cells
**File:** `/web/components/DetailedCalendar.tsx` - around line 309-369

**What to add:**
```tsx
aria-label={
  dayData.game 
    ? `${dayNum}. ${winner || dayData.holder} vs opponent. Game ${winner ? 'won' : 'lost'}.`
    : `${dayNum}. ${dayData.holder} holds belt.`
}
```

**Time: 2 hours**

---

### 6. Add Escape Key to Calendar Popup
**File:** `/web/components/CalendarDayPopup.tsx`

**What to add:**
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

**Time: 0.5 hours**

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

### 8. Add Navigation Landmark
**File:** `/web/app/page.tsx` - line 83

**What to change:**
```tsx
// From:
<section className="mb-8 sm:mb-12">

// To:
<nav className="mb-8 sm:mb-12" aria-label="League selection">
```

**Time: 0.5 hours**

---

## MEDIUM PRIORITY FIXES (Nice to have) - ~4 hours

### 9. Add aria-live Region for Calendar
**File:** `/web/components/DetailedCalendar.tsx`

```tsx
const [announcement, setAnnouncement] = useState('');

// In JSX:
<div aria-live="polite" className="sr-only">
  {announcement}
</div>

// When clicking day:
setAnnouncement(`Selected ${monthName} ${dayNum}. ${holderTeam} holds belt...`);
```

**Time: 2 hours**

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

- Critical fixes: 10 hours
- High priority: 6 hours
- Medium priority: 4 hours
- **Total: 20 hours** (Conservative estimate)

Would be 16 hours with focus-trap library and experienced developer.

---

## Files That Are GOOD (No changes needed)

- ThemeSwitcher.tsx - Already has good focus handling ✓
- TeamLogo.tsx - Alt text is correct ✓
- layout.tsx - Uses semantic main element ✓
- about/page.tsx - Details/summary pattern is good ✓
