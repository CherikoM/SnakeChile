// @ts-ignore
import './styles/index.css'
import { SnakeGameDOM } from './ts/SnakeGameDOM.js'

const gameContainer = document.querySelector('.game')
const counter = document.querySelector('.mask')
const score = document.querySelector('#score')
const btn = document.querySelector('#start')
// const ok = document.querySelector('#ok')

new SnakeGameDOM(20, 20, {
  container: gameContainer as HTMLDivElement,
  score: score as HTMLDivElement,
  counter: counter as HTMLDivElement,
  gameBtn: btn as HTMLElement,
})

// ok?.addEventListener('click', () => {
//   document.querySelector('dialog')?.close()
// }, {
//   once: true
// })