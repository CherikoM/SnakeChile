/**
 * 获取指定范围内的随机整数
 * @param min 最小（包含）
 * @param max 最大（不包含）
 * @returns 
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}