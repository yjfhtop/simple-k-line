/**
 * 处理坐标相关
 */
import { Coordinate } from '@/utils/canvasDraw'

/**
 * 两点获取 以dot为圆心，r为半径的 坐标（与dot2在同一射线上）
 * @param dot1
 * @param dot2
 * @param r
 */
export function dotAndDitRGetLineDot(
    dot1: Coordinate,
    dot2: Coordinate,
    r: number
) {
    const len = Math.sqrt((dot1.x - dot2.x) ** 2 + (dot1.y - dot2.y) ** 2)
    const sin = -(dot1.x - dot2.x) / len
    const cos = -(dot1.y - dot2.y) / len

    const x = r * sin
    const y = r * cos

    return {
        x: dot1.x + x,
        y: dot1.y + y,
    }
}
