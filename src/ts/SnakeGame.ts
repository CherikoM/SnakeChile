import { Snake, SnakeDirection } from "./Snake.js"
import { Food } from "./Food.js"
import type { Index, dirNum } from "../types/types.js"

export class SnakeGame {

  private snake: Snake
  private food: Food
  private score: number = 0
  private gaming: boolean = false
  private pausing: boolean = false

  /**
   * 
   * @param width 一行的盒子数
   * @param height 一列的盒子数
   * @param container 容器
   */
  constructor(private width: number, private height: number) {
    this.snake = new Snake(width, height)
    this.food = new Food(width, height)
  }

  /**
   * 开始游戏
   */
  public start() {
    this.gaming = true
    this.pausing = false
    this.snake.newSnake()
    this.food.newFood(this.getSnake())
  }

  /**
   * 结束游戏
   */
  public over() {
    this.gaming = false
    this.pausing = false
  }

  /**
   * 蛇移动
   * @returns false：撞到边界或自己   'eat'：吃到食物   true：正常移动
   */
  public move(): boolean | 'eat' {
    // 蛇无法移动（撞到边界或自己），结束游戏
    if(!this.snake.move()) {
      this.over()
      return false
    } else {
      // 在这次移动中，蛇吃到了食物
      if(this.eat()) {
        return 'eat'
      } else {
        return true
      }
    }
  }

  /**
   * 蛇吃食物
   * @returns true：吃到食物   false：没吃到
   */
  public eat(): boolean {

    /**
     * 蛇是否吃到食物
     * @returns 
     */
    const isAvalibleEat = ()=> {
      const snakeHead = this.snake.getSnake()[0]
      // 蛇头碰到食物
      if (snakeHead[0] === this.food.getFoodIndex()[0] && snakeHead[1] === this.food.getFoodIndex()[1]) {
        return true
      }
      return false
    }

    // 蛇成功吃到食物
    if(isAvalibleEat()) {
      this.snake.eat()
      this.score++
      this.food.newFood(this.snake.getSnake())
      return true
    } 
    // 蛇没有吃到食物
    else {
      return false
    }
  }

  /**
   * 改变蛇头的方向
   * @param direction 
   */
  public changeDirection(direction: dirNum) {
    this.snake.changeDirection(direction)
  }

  /**
   * 是否正在进行游戏
   * @returns 
   */
  public isGaming(): boolean {
    return this.gaming
  }

  /**
   * 获取蛇的长度
   * @returns 
   */
  public getSnakeLength(): number {
    return this.snake.getSnakeLength()
  }

  /**
   * 获取蛇
   * @returns 
   */
  public getSnake(): Index[] {
    return this.snake.getSnake()
  }

  /**
   * 获取食物
   */
  public getFood(): Index {
    return this.food.getFoodIndex()
  }

  /**
   * 获取分数
   */
  public getScore(): number {
    return this.score
  }

  /**
   * 获取前一节蛇相比后一节的走向
   * @param param0 前一节
   * @param param1 后一节
   * @returns 
   */
  public getSnakeBodyDirection([x1, y1]: Index, [x2, y2]: Index) {
    return this.snake.getBodyDirection([x1, y1], [x2, y2])
  }

  /**
   * 是否正在暂停
   * @returns 
   */
  public isPausing () {
    return this.pausing
  }

  /**
   * 暂停
   */
  public pause () {
    this.pausing = true
  }

  /**
   * 恢复
   */
  public resume () {
    this.pausing = false
  }

  /**
   * 清除分数
   */
  public clearScore () {
    this.score = 0
  }
}