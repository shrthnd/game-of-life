// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const canvas = require('./canvas')

const replaceText = (selector, text) => {
  const element = document.getElementById(selector)
  if (element) element.innerText = text
}

window.addEventListener('DOMContentLoaded', () => {
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  canvas()
})

