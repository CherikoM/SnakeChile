import { Index } from "../types/types"
import { getRandomNumber } from "../utils/getRandomNumber.js"

export class Food {

  private index: Index = [0, 0]

  constructor(private width: number, private height: number) {
    this.width = width
    this.height = height
    // this.newFood()
  }

  /**
   * 生成新食物
   * @param exception 不能生成食物的坐标（蛇）
   * @returns 
   */
  public newFood (exception?: Index[]) {
    let index: Index

    // 食物不能出现在蛇身上
    // break标签：多层循环时可以用break指定退出的循环
    outerLoop: while (true) {
      index = [getRandomNumber(0, this.width), getRandomNumber(0, this.height)]
      if(!exception) {
        break
      }
      for(let i = 0; i < exception.length; i++) {
        // 坐标相等
        if((exception[i][0] === index[0]) && (exception[i][1] === index[1])) {
          break
        }
        if(i === exception.length - 1) {
          break outerLoop
        }
      }
    }
    
    this.index = index
  }

  /**
   * 获取食物的坐标
   * @returns 
   */
  public getFoodIndex() {
    return this.index
  }
}