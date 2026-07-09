export function registerGsapPlugins(): void {}

export function createGsapContext(_scope: Element): { revert: () => void } {
  return { revert: () => {} };
}
