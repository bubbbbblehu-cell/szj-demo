/** Controls the loader already present in the first HTML response. */
export class LoadingScreen {
  private root = document.querySelector<HTMLElement>('#boot-screen');
  private progress = document.querySelector<HTMLElement>('#boot-progress');
  private value = 0;
  private failed = false;
  private finished = false;
  private frames: number[] = [];

  setProgress(fraction: number): void {
    if (this.failed || this.finished || !Number.isFinite(fraction)) return;
    this.value = Math.max(this.value, Math.min(100, Math.floor(fraction * 100)));
    this.progress?.setAttribute('aria-valuenow', String(this.value));
    const fill = this.progress?.querySelector<HTMLElement>('.boot-fill');
    if (fill) fill.style.width = `${this.value}%`;
  }
  fail(message: string): void {
    if (this.finished || this.failed || !this.root) return;
    this.failed = true;
    document.body.dataset.boot = 'error';
    this.root.setAttribute('aria-busy', 'false');
    const error = this.root.querySelector<HTMLElement>('#boot-error');
    if (error) { error.hidden = false; error.querySelector('span')!.textContent = message; }
  }
  async finish(): Promise<void> {
    if (this.failed || this.finished || document.body.dataset.boot === 'error') return;
    this.setProgress(1);
    this.finished = true;
    if (!this.root) return; // HMR after the initial load has already completed.
    this.root.setAttribute('data-complete', '');
    // Paint the completed bar, then reveal a scene that has already rendered.
    await new Promise<void>(resolve => {
      this.frames.push(requestAnimationFrame(() => {
        this.frames.push(requestAnimationFrame(() => {
          if (document.body.dataset.boot === 'error') { resolve(); return; }
          document.body.dataset.boot = 'ready';
          const app = document.querySelector<HTMLElement>('#app')!;
          app.inert = false; app.removeAttribute('aria-hidden');
          this.root?.remove(); this.root = null;
          resolve();
        }));
      }));
    });
  }
  destroy(): void { this.frames.forEach(cancelAnimationFrame); }
}
