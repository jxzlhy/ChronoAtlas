/** 左上角大洲快速定位（ghost 按钮，含"正北"重置） */
export function initContinents(onGo: (key: string) => void): void {
  const nav = document.getElementById('continent-nav') as HTMLElement
  const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>('button[data-continent]'))

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.toggle('active', b === btn))
      onGo(btn.dataset.continent as string)
    })
  }
}
