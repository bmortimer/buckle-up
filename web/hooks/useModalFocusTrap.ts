import { useEffect, type RefObject } from 'react'

/**
 * Focus trap and keyboard handler for modal dialogs.
 * - Focuses the close button when the modal opens
 * - Traps Tab/Shift+Tab within the modal
 * - Closes the modal on Escape
 */
export function useModalFocusTrap(
  isOpen: boolean,
  onClose: () => void,
  modalRef: RefObject<HTMLDivElement | null>,
  closeButtonRef: RefObject<HTMLButtonElement | null>
): void {
  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current
        if (!modal) return

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, modalRef, closeButtonRef])
}
