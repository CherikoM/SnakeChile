import { Index, dirNum } from "../types/types.js"
import { SnakeDirection } from "./Snake.js"
import { SnakeGame } from "./SnakeGame.js"

enum SnakeClass {
  // 蛇位置
  SNAKE_HEAD = 'snake-head',
  SNAKE_BODY_STR = 'snake-body-str',
  SNAKE_BODY_CUR = 'snake-body-cur',
  SNAKE_TAIL = 'snake-tail',
  // 蛇方向
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
  // 蛇转弯时弧形的朝向
  UP_RIGHT_QUADRANT = 'up-right-quadrant',
  DOWN_RIGHT_QUADRANT = 'down-right-quadrant',
  DOWN_LEFT_QUADRANT = 'down-left-quadrant',
  UP_LEFT_QUADRANT = 'up-left-quadrant',
  // 食物
  FOOD = 'food'
}

type DOMs <T extends HTMLElement> = {
  container: T,
  score: T,
  counter: T,
  gameBtn: T,
  snake?: HTMLDivElement,
  food?: HTMLDivElement
}

export class SnakeGameDOM<T extends HTMLElement> {

  private snakeGame: SnakeGame
  private box: { width: number, height: number } = { width: 0, height: 0 }
  private timer: number | undefined
  private counting = false

  constructor(private width: number, private height: number, private dom: DOMs<T>) {
    this.dom = dom
    this.width = width
    this.height = height
    this.snakeGame = new SnakeGame(this.width, this.height)
    this.init()
  }

  /**
   * 初始化
   */
  public init () {
    this.getBoxSize(this.width, this.height)
    this.clickGameBtn()
    this.changeBtnText('Start')
    const snake = document.createElement('div')
    const food = document.createElement('div')
    const fragment = document.createDocumentFragment()
    fragment.append(snake, food)
    this.dom.container.append(fragment)
    this.dom.snake = snake
    this.dom.food = food
  }

  /**
   * 绑定游戏按钮
   */
  public clickGameBtn () {
    this.dom.gameBtn.addEventListener('click', ()=> {
      // 正在倒计时时点击，不进行操作
      if(this.isCounting()) return
      // 未开始或暂停时点击，开始游戏
      if(!this.isGaming() || this.isPausing()) {
        this.start()
      }
      // 游戏进行时点击，暂停游戏
      else {
        this.pause()
      }
    })
  }

  /**
   * 开始游戏
   */
  public start() {
    // 未开始时，开始新游戏
    if(!this.isGaming()) {
      this.snakeGame.start()
      this.clearScore()
      this.drawSnake()
      this.drawFood()
    }
    // 暂停时，恢复游戏
    if(this.isPausing()) {
      this.snakeGame.resume()
    }

    // 等待倒计时
    this.countDown().then(()=> {
      // 每隔一段时间进行一次移动
      this.timer = setInterval(() => {
        this.move()
      }, 500)

      // 绑定键盘事件
      document.addEventListener('keydown', this.changeDirection.bind(this))
      this.changeBtnText('Pause')
    })
  }

  /**
   * 倒计时
   * @returns 
   */
  public countDown () {
    return new Promise(resolve=> {
      // 现在正在倒计时
      this.counting = true
      this.setCounterText('3')
      let count = 3

      // 展开遮罩
      this.showCounter()

      // 进行倒计时
      const timer = setInterval(() => {
        if(count > 1) {
          count--
          this.setCounterText(count.toString())
        } 
        // 倒计时结束
        else {
          clearInterval(timer)
          this.counting = false
          this.hideCounter()
          resolve('')
        }
      }, 1000)
    })
  }

  /**
   * 结束游戏
   */
  public over () {
    this.showCounter()
    this.setCounterText('')
    this.snakeGame.over()
    // 移除定时器和键盘事件
    clearInterval(this.timer)
    document.removeEventListener('keydown', this.changeDirection.bind(this))
    alert(`You stopped ${this.getScore()} Boliviaball${this.getScore() > 1 ? 's' : ''}!`)
    this.changeBtnText('Start')
  }

  /**
   * 蛇移动
   */
  public move () {
    const res = this.snakeGame.move()
    this.drawSnake()
    // 蛇吃到食物，更新分数
    if(res === 'eat') {
      this.changeScore()
      this.drawFood()
    }
    // 蛇撞到边界或自己，结束游戏
    else if(!res) {
      this.over()
    }
  }

  /**
   * 蛇改变方向
   * @param e
   */
  public changeDirection (e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
        this.snakeGame.changeDirection(SnakeDirection.UP)
        break
      case 'ArrowDown':
        this.snakeGame.changeDirection(SnakeDirection.DOWN)
        break
      case 'ArrowLeft':
        this.snakeGame.changeDirection(SnakeDirection.LEFT)
        break
      case 'ArrowRight':
        this.snakeGame.changeDirection(SnakeDirection.RIGHT)
        break
    }
  }

  /**
   * 更改分数
   */
  public changeScore() {
    this.dom.score.innerText = String(this.getScore())
  }

  /**
   * 获取单元盒的尺寸
   * @param wNum 
   * @param hNum 
   * @returns 
   */
  public getBoxSize(wNum: number, hNum: number) {
    const { width, height } = this.dom.container.getBoundingClientRect()
    this.box = { width: width / wNum, height: height / hNum }
  }

  /**
   * 绘制游戏
   */
  public drawSnake() {

    // 清空蛇
    this.dom.snake!.replaceChildren()

    // 绘制蛇
    const fragment = document.createDocumentFragment()

    for (let i = 0; i < this.snakeGame.getSnakeLength(); i++) {
      const classes = this.getClasses(this.snakeGame.getSnake()[i-1] || [-1, -1], this.snakeGame.getSnake()[i], this.snakeGame.getSnake()[i + 1] || [-1, -1]) 
      const [x, y] = this.snakeGame.getSnake()[i]

      const box = this.createBox([x, y], classes)

      fragment.appendChild(box)

    }

    this.dom.snake!.appendChild(fragment)
  }

  /**
   * 绘制食物
   */
  public drawFood () {
    this.dom.food!.replaceChildren()
    const food = this.createBox(this.snakeGame.getFood(), [SnakeClass.FOOD])
    this.dom.food!.appendChild(food)
  }

  /**
   * 创建一个盒子
   * @param param0 
   * @param classes 
   * @returns 
   */
  public createBox([x, y]: Index, classes: string[]) {
    const div = document.createElement('div')
    div.classList.add('box', ...classes)
    div.style.top = `${y * this.box.height - 1}px`
    div.style.left = `${x * this.box.width - 1}px`
    return div
  }
  
  /**
   * 判断这一节蛇应该使用什么类
   * @param param0 前一个坐标
   * @param param1 需判断的坐标
   * @param param2 后一个坐标
   * @returns 
   */
  public getClasses([x1, y1]: Index, [x2, y2]: Index, [x3, y3]: Index) {

    const classes = []

    let dir1: dirNum | 0 = this.getSnakeBodyDirection([x1, y1], [x2, y2]),
     dir2: dirNum | 0 = this.getSnakeBodyDirection([x2, y2], [x3, y3])
    
    // 蛇头 
    if(dir1 === 0) {
      // @ts-ignore
      classes.push(SnakeClass.SNAKE_HEAD, SnakeClass[SnakeDirection[dir2]])
    } 
    // 蛇尾
    else if (dir2 === 0) {
      // @ts-ignore
      classes.push(SnakeClass.SNAKE_TAIL, SnakeClass[SnakeDirection[dir1]])
    } 
    // 蛇身
    else {
      // 蛇身直行
      if(dir1 === dir2) {
        classes.push(SnakeClass.SNAKE_BODY_STR)
        switch(dir1) {
          case SnakeDirection.UP:
            classes.push(SnakeClass.UP)
            break
          case SnakeDirection.RIGHT:
            classes.push(SnakeClass.RIGHT)
            break
          case SnakeDirection.DOWN:
            classes.push(SnakeClass.DOWN)
            break
          case SnakeDirection.LEFT:
            classes.push(SnakeClass.LEFT)
            break
        }
      } 
      // 蛇身转弯
      else {
        classes.push(SnakeClass.SNAKE_BODY_CUR)
        // 右上弧
        if ((dir1 === SnakeDirection.LEFT && dir2 === SnakeDirection.UP)
        || (dir1 === SnakeDirection.DOWN && dir2 === SnakeDirection.RIGHT)) {
          classes.push(SnakeClass.UP_RIGHT_QUADRANT)
        }
        // 右下弧
        else if((dir1 === SnakeDirection.UP && dir2 === SnakeDirection.RIGHT)
        || (dir1 === SnakeDirection.LEFT && dir2 === SnakeDirection.DOWN)) {
          classes.push(SnakeClass.DOWN_RIGHT_QUADRANT)
        }
        // 左下弧
        else if (
          (dir1 === SnakeDirection.UP && dir2 === SnakeDirection.LEFT)
          || (dir1 === SnakeDirection.RIGHT && dir2 === SnakeDirection.DOWN)) {
          classes.push(SnakeClass.DOWN_LEFT_QUADRANT)
        }
        // 左上弧
        else if ((dir1 === SnakeDirection.RIGHT && dir2 === SnakeDirection.UP)
        || (dir1 === SnakeDirection.DOWN && dir2 === SnakeDirection.LEFT)) {
          classes.push(SnakeClass.UP_LEFT_QUADRANT)
        }

      }
    }
    return classes
  }

  /**
   * 获取前一节蛇身相对后一节的方向
   * @param param0 
   * @param param1 
   * @returns 
   */
  public getSnakeBodyDirection([x1, y1]: Index, [x2, y2]: Index) {
    return this.snakeGame.getSnakeBodyDirection([x1, y1], [x2, y2])
  }

  /**
   * 是否正在进行游戏
   * @returns 
   */
  public isGaming(): boolean {
    return this.snakeGame.isGaming()
  }

  /**
   * 暂停游戏
   */
  public pause () {
    this.snakeGame.pause()
    // 清除计时器和键盘事件
    clearInterval(this.timer)
    document.removeEventListener('keydown', this.changeDirection)
    this.showCounter()
    this.setCounterText('Pausing')
    this.changeBtnText('Resume')
  }

  /**
   * 是否正在暂停
   * @returns 
   */
  public isPausing () {
    return this.snakeGame.isPausing()
  }

  /**
   * 恢复游戏
   */
  public resume () {
    this.snakeGame.resume()
  }

  /**
   * 清除分数
   */
  public clearScore () {
    this.snakeGame.clearScore()
    this.changeScore()
  }

  /**
   * 是否正在计时
   * @returns 
   */
  public isCounting () {
    return this.counting
  }

  /**
   * 显示遮罩层
   */
  public showCounter () {
    this.dom.counter.classList.remove('hide')
  }

  /**
   * 隐藏遮罩层
   */
  public hideCounter () {
    this.dom.counter.classList.add('hide')
  }

  /**
   * 设置遮罩层文字
   * @param text 
   */
  public setCounterText (text: string) {
    this.dom.counter.innerText = text
  }

  /**
   * 获得分数
   * @returns 
   */
  public getScore () {
    return this.snakeGame.getScore()
  }

  /**
   * 更改按钮文字
   * @param text 
   */
  public changeBtnText (text: string) {
    this.dom.gameBtn.innerText = text
  }
}