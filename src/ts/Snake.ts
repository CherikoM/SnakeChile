import type { Index, dirNum } from "../types/types"
import { getRandomNumber } from "../utils/getRandomNumber.js"

export enum SnakeDirection {
  UP = 1,
  RIGHT = 2,
  DOWN = 3,
  LEFT = 4
}

export class Snake {

  private snakeIndex: Index[] = []
  private perviousLastIndex: Index = [0, 0]
  private dir: dirNum = 1
  private go: Index[] = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]]

  constructor(private width: number, private height: number) {
    this.width = width
    this.height = height
  }

  /**
   * 新建一个随机三节的蛇
   */
  public newSnake(): void {

    /**
     * 判断是否是合理的第三个初始蛇身
     * @param direction 方向
     * @param param0 前一节身体
     * @param param1 后一节身体
     * @returns 
     */
    const isAvalibleBody = (direction: dirNum = this.dir, [x, y]: Index = this.snakeIndex[0], [x2, y2]: Index = this.snakeIndex[1]): boolean => {
      // debugger
      const [x3, y3] = this.getNextIndex([x2, y2], direction)
      if (this.isOut([x3, y3]) || (x3 === x && y3 === y)) {
        return false
      } else {
        return true
      }
    }

    /**
     * 获得随机方向
     * @returns 
     */
    const getRandomDirection = ():dirNum => {
      return getRandomNumber(1, 5) as dirNum
    }


    this.snakeIndex = []
    const [x1, y1] = [getRandomNumber(0, this.width), getRandomNumber(0, this.height)]
    // const [x1, y1] = [19,19]

    // 获得第二个合理蛇身
    let x2: number, y2: number
    while (true) {
      let direction = getRandomDirection()
      const res = this.getNextIndex([x1, y1], direction)
      if (!this.isOut(res)) {
        x2 = res[0], y2 = res[1]
        break
      }
    }

    // 获得第三个合理蛇身
    let x3: number, y3: number
    while (true) {
      let direction = getRandomDirection()
      if (isAvalibleBody(direction, [x1, y1], [x2, y2])) {
        const res = this.getNextIndex([x2, y2], direction)
        x3 = res[0], y3 = res[1]
        break
      }
    }

    this.dir = this.getBodyDirection([x1, y1], [x2, y2]) as dirNum
    this.snakeIndex.push([x1, y1], [x2, y2], [x3, y3])
  }

  /**
   * 改变方向
   * @param {*} direction 
   */
  public changeDirection(direction: dirNum): void {
    if(this.isAvalibleDiretion(direction)) {
      this.dir = direction
    }
  }  

  /**
   * 判断是否是合理的方向（防止反方向走）
   * @param direction 方向
   * @param param1 
   * @param param2 
   * @returns 
   */
  public isAvalibleDiretion(direction: dirNum = this.dir, [x, y]: Index = this.snakeIndex[0], [x2, y2]: Index = this.snakeIndex[1]): boolean {
    // debugger
    const [x3, y3] = this.getNextIndex([x, y], direction)
    if (this.isOut([x3, y3]) || (x3 === x2 && y3 === y2)) {
      return false
    } else {
      return true
    }
  }

  /**
   * 判断坐标是否越界
   * @param {*} param0 
   * @returns 
   */
  public isOut([x, y]: Index): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return true
    } else {
      return false
    }
  }

  /**
   * 判断蛇头是否撞到蛇身
   * @param {*} param0 
   * @returns 
   */
  public isCrash([x, y]: Index): boolean {
    for(let i = 0; i < this.snakeIndex.length-1; i++) {
      if (x === this.snakeIndex[i][0] && y === this.snakeIndex[i][1]) {
        return true
      }
    }
    return false
  }

  /**
   * 根据方向获得下一个坐标
   * @param {*} param0 
   * @param {*} direction 
   * @returns 
   */
  public getNextIndex([x, y]: Index, direction: dirNum = this.dir): Index {
    return [x + this.go[direction][0], y + this.go[direction][1]]
  }

  /**
   * 根据方向获得上一个坐标
   * @param param0 
   * @param direction 
   * @returns 
   */
  public getLastIndex([x, y]: Index, direction: dirNum = this.dir): Index {
    return [x - this.go[direction][0], y - this.go[direction][1]]
  }

  /**
   * 蛇移动
   */
  public move(): boolean {
    // 储存移动前的蛇尾，如果此次移动中蛇吃到了东西，蛇变长，就可以将蛇尾恢复
    this.perviousLastIndex = this.snakeIndex[this.snakeIndex.length - 1]
    // debugger
    const res = this.getNextIndex(this.snakeIndex[0])
    // 蛇头撞到边界
    if (this.isOut(res)) {
      return false
    }
    // 蛇头撞到蛇身
    else if (this.isCrash(res)) {
      return false
    }
    // 成功的移动
    else {
      this.snakeIndex.unshift(res)
      this.snakeIndex.pop()
      return true
    }
  }

  /**
   * 蛇吃到东西
   */
  public eat(): void {
    this.snakeIndex.push(this.perviousLastIndex)
  }

  /**
   * 获取蛇
   * @returns 
   */
  public getSnake(): Index[] {
    return this.snakeIndex
  }

  /**
   * 获取蛇的长度
   * @returns 
   */
  public getSnakeLength(): number {
    return this.snakeIndex.length
  }

  /**
   * 获取前一节蛇相比后一节的走向
   * @param param0 前一节
   * @param param1 后一节
   * @returns 
   */
  public getBodyDirection([x1, y1]: Index, [x2, y2]: Index) {
    const x = x1 - x2, y = y1 - y2
    if(x === 0 && y === -1) {
      return SnakeDirection.UP
    } else if(x === 1 && y === 0) {
      return SnakeDirection.RIGHT
    } else if(x === 0 && y === 1) {
      return SnakeDirection.DOWN
    } else if(x === -1 && y === 0) {
      return SnakeDirection.LEFT
    } else {
      return 0
    }
  }
}

