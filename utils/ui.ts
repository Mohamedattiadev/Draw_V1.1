export function lockUI(lock: boolean): void {
  if (typeof document === "undefined") return

  if (lock) return document.body.classList.add("lock-ui")
  document.body.classList.remove("lock-ui")
}
