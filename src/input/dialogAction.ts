/** Native dialogs initially focus their close button. A confirms the content instead. */
export function confirmDialog(dialog: HTMLDialogElement): void {
  const active = document.activeElement;
  if (active instanceof HTMLButtonElement && dialog.contains(active) && !active.disabled &&
      !active.closest('.gamepad-actions') && !active.matches('.close-modal,.log-close,.cv-close,[data-gamepad-cancel]')) {
    active.click();
    return;
  }
  dialog.querySelector<HTMLButtonElement>('[data-gamepad-confirm]:not(:disabled)')?.click();
}
