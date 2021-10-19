/**
 * canvas 绘制相关
 */
import { deepCopy, mergeData } from '@/utils/dataHandle'
import { logError } from '@/utils/log'
import { isOdd } from '@/utils/index'

// 坐标
export interface Coordinate {
    x: number
    y: number
}
// 绘制样式 string(颜色)  CanvasPattern(纹理)  CanvasGradient(渐变)
export type StrokeAndFillStyle = string | CanvasGradient | CanvasPattern

// 绘制类型 stroke（绘制线段） full（填充）
export type DrawType = 'stroke' | 'full'
const DefDrawType = 'stroke'

// 圆角半径
export interface BorderRadius {
    topLeft?: number
    topRight?: number
    btmLeft?: number
    btmRight?: number
}

// 绘制样式， 包含填充 和 stroke 的所有样式
export interface DrawStyle {
    w?: number
    style?: StrokeAndFillStyle
    // 本项存在就是虚线
    lineDash?: number[]
}
export const DefDrawStyle: DrawStyle = {
    w: 1,
    style: '#000',
}

// 通过 类型 和样式设置绘制样式
function setDrawStyle(
    ctx: CanvasRenderingContext2D,
    drawType: DrawType = DefDrawType,
    drawStyle: DrawStyle = { w: 1, style: '#000' }
) {
    drawStyle = drawStyle || {}
    if (drawType === 'stroke') {
        drawStyle.w && (ctx.lineWidth = drawStyle.w)
        drawStyle.lineDash && ctx.setLineDash(drawStyle.lineDash)
        drawStyle.style && (ctx.strokeStyle = drawStyle.style)
    } else if (drawType === 'full') {
        drawStyle.style && (ctx.fillStyle = drawStyle.style)
    }
}

/**
 * 根据绘制类型就行 绘制 或者填充
 * @param ctx
 * @param drawType
 */
function drawTypeDraw(
    ctx: CanvasRenderingContext2D,
    drawType: DrawType = DefDrawType
) {
    if (drawType === 'full') {
        ctx.fill()
    } else {
        ctx.stroke()
    }
}

/**
 * 绘制 线段
 */
export function drawLine(
    ctx: CanvasRenderingContext2D,
    startCoordinate: Coordinate,
    endCoordinate: Coordinate,
    drawStyle?: DrawStyle
) {
    ctx.save()
    ctx.beginPath()
    ctx.imageSmoothingEnabled = true
    startCoordinate = { ...startCoordinate }
    endCoordinate = { ...endCoordinate }

    setDrawStyle(ctx, 'stroke', drawStyle)

    // 处理 模糊问题
    if (!drawStyle || !drawStyle.w || isOdd(drawStyle.w)) {
        if (startCoordinate.x === endCoordinate.x) {
            startCoordinate.x = Math.floor(startCoordinate.x) + 0.5
            endCoordinate.x = Math.floor(endCoordinate.x) + 0.5
        }
        if (startCoordinate.y === endCoordinate.y) {
            startCoordinate.y = Math.floor(startCoordinate.y) + 0.5
            endCoordinate.y = Math.floor(endCoordinate.y) + 0.5
        }
    }
    // 绘制
    ctx.moveTo(startCoordinate.x, startCoordinate.y)
    ctx.lineTo(endCoordinate.x, endCoordinate.y)
    ctx.stroke()
    ctx.restore()
}

// 绘制 矩形需要的配置项
export interface RectConfig {
    // 左上方 点
    leftTop: Coordinate
    // 默认 填充
    drawType?: DrawType
    // 宽
    w?: number
    h?: number
    // 右下方点
    rightBottom?: Coordinate
    // 圆角半径
    borderRadius?: number | BorderRadius
    // 包含边框 和 填充样式
    drawStyle?: DrawStyle
}

export const DefRectConfig: RectConfig = {
    leftTop: null,
    drawType: 'full',
    drawStyle: deepCopy(DefDrawStyle),
}

/**
 * 绘制矩形
 * @param ctx
 * @param rectConfig
 */
export function drawRect(
    ctx: CanvasRenderingContext2D,
    rectConfig: RectConfig
) {
    rectConfig = mergeData(DefRectConfig, rectConfig)
    if (!ctx || !rectConfig || typeof rectConfig !== 'object') {
        logError('drawRect', 'ctx or data non-existent')
        return
    }
    // 处理坐标点
    if (rectConfig.rightBottom) {
        rectConfig.w = rectConfig.rightBottom.x - rectConfig.leftTop.x
        rectConfig.h = rectConfig.rightBottom.y - rectConfig.leftTop.y
    } else {
        rectConfig.rightBottom = {
            x: rectConfig.leftTop.x + rectConfig.w,
            y: rectConfig.leftTop.y + rectConfig.h,
        }
    }

    // 处理模糊边框 rectConfig.drawType === 'stroke' &&
    if (
        rectConfig.drawType &&
        rectConfig.drawType === 'stroke' &&
        isOdd(rectConfig.drawStyle.w)
    ) {
        rectConfig.leftTop.x += 0.5
        rectConfig.leftTop.y += 0.5
        rectConfig.rightBottom.x += 0.5
        rectConfig.rightBottom.y += 0.5
    }

    // 处理圆角
    const maxR = Math.min(rectConfig.w, rectConfig.h) / 2
    let borderRadius: BorderRadius = {
        topLeft: 0,
        topRight: 0,
        btmLeft: 0,
        btmRight: 0,
    }
    if (rectConfig.borderRadius) {
        if (typeof rectConfig.borderRadius === 'number') {
            const r = Math.min(rectConfig.borderRadius, maxR)
            borderRadius = {
                topLeft: r,
                topRight: r,
                btmLeft: r,
                btmRight: r,
            }
        } else {
            borderRadius.topRight = Math.min(
                rectConfig.borderRadius.topRight || 0,
                maxR
            )
            borderRadius.btmLeft = Math.min(
                rectConfig.borderRadius.btmLeft || 0,
                maxR
            )
            borderRadius.btmRight = Math.min(
                rectConfig.borderRadius.btmRight || 0,
                maxR
            )
            borderRadius.topLeft = Math.min(
                rectConfig.borderRadius.topLeft || 0,
                maxR
            )
        }
    }
    rectConfig.borderRadius = borderRadius
    // 开始绘制
    ctx.save()
    ctx.beginPath()
    setDrawStyle(ctx, rectConfig.drawType, rectConfig.drawStyle)

    if (
        rectConfig.borderRadius.topLeft ||
        rectConfig.borderRadius.btmRight ||
        rectConfig.borderRadius.btmLeft ||
        rectConfig.borderRadius.topRight
    ) {
        if ((<BorderRadius>rectConfig.borderRadius).topLeft) {
            ctx.moveTo(
                rectConfig.leftTop.x + rectConfig.borderRadius.topLeft,
                rectConfig.leftTop.y
            )
        } else {
            ctx.moveTo(rectConfig.leftTop.x, rectConfig.leftTop.y)
        }
        ctx.arcTo(
            rectConfig.rightBottom.x,
            rectConfig.leftTop.y,
            rectConfig.rightBottom.x,
            rectConfig.rightBottom.y,
            rectConfig.borderRadius.topRight
        )
        ctx.arcTo(
            rectConfig.rightBottom.x,
            rectConfig.rightBottom.y,
            rectConfig.leftTop.x,
            rectConfig.rightBottom.y,
            rectConfig.borderRadius.btmLeft
        )
        ctx.arcTo(
            rectConfig.leftTop.x,
            rectConfig.rightBottom.y,
            rectConfig.leftTop.x,
            rectConfig.leftTop.y,
            rectConfig.borderRadius.btmRight
        )
        ctx.arcTo(
            rectConfig.leftTop.x,
            rectConfig.leftTop.y,
            rectConfig.rightBottom.x,
            rectConfig.leftTop.y,
            rectConfig.borderRadius.topLeft
        )
        ctx.closePath()
    } else {
        ctx.rect(
            rectConfig.leftTop.x,
            rectConfig.leftTop.y,
            rectConfig.w,
            rectConfig.h
        )
    }

    drawTypeDraw(ctx, rectConfig.drawType)
    ctx.restore()
}

export interface CircularConfig {
    center: Coordinate
    // 半径， 如果为元组类型表示为空心圆
    r: number | [number, number]
    drawType?: DrawType
    // 包含边框 和 填充样式
    drawStyle?: DrawStyle
    // 内部圆的填充样式, r 为 数组时起作用
    innerStyle?: DrawStyle
}
export const DefCircularConfig: CircularConfig = {
    center: null,
    r: null,
    drawType: 'stroke',
    drawStyle: deepCopy(DefDrawStyle),
}

/**
 * 绘制圆 ，包含同心圆
 * @param ctx
 * @param circularConfig
 */
export function drawCircular(
    ctx: CanvasRenderingContext2D,
    circularConfig: CircularConfig
) {
    circularConfig = mergeData(DefCircularConfig, circularConfig)
    ctx.save()
    ctx.beginPath()
    setDrawStyle(ctx, circularConfig.drawType, circularConfig.drawStyle)
    if (typeof circularConfig.r === 'number') {
        ctx.arc(
            circularConfig.center.x,
            circularConfig.center.y,
            circularConfig.r,
            0,
            Math.PI * 2
        )
    } else {
        for (let i = 0; i < circularConfig.r.length; i++) {
            if (i === 1) {
                ctx.moveTo(
                    circularConfig.center.x + circularConfig.r[i],
                    circularConfig.center.y
                )
            }
            ctx.arc(
                circularConfig.center.x,
                circularConfig.center.y,
                circularConfig.r[i],
                0,
                Math.PI * 2,
                i === 1
            )
        }
    }
    drawTypeDraw(ctx, circularConfig.drawType)
    ctx.restore()

    // 内部填充
    if (circularConfig.innerStyle && typeof circularConfig.r !== 'number') {
        ctx.save()
        ctx.beginPath()
        const r = Math.min(...circularConfig.r)
        setDrawStyle(ctx, 'full', circularConfig.innerStyle)
        ctx.arc(
            circularConfig.center.x,
            circularConfig.center.y,
            r,
            0,
            Math.PI * 2
        )
        drawTypeDraw(ctx, 'full')
        ctx.restore()
    }
}

export interface SectorConfig {
    center: Coordinate
    // 半径， 如果为元组类型表示为空心圆
    r: number | [number, number]
    drawType?: DrawType
    // 包含边框 和 填充样式
    drawStyle?: DrawStyle
    // 开始角度, 不是弧度
    startAngle: number
    // 结束角度 不是弧度
    endAngle: number
}

export const DefSectorConfig: SectorConfig = {
    center: null,
    drawStyle: deepCopy(DefDrawStyle),
    drawType: 'full',
    r: null,
    startAngle: null,
    endAngle: null,
}

/**
 * 绘制扇形
 * @param ctx
 * @param sectorConfig
 */
export function drawSector(
    ctx: CanvasRenderingContext2D,
    sectorConfig: SectorConfig
) {
    sectorConfig = mergeData(DefSectorConfig, sectorConfig)
    ctx.save()
    ctx.beginPath()
    setDrawStyle(ctx, sectorConfig.drawType, sectorConfig.drawStyle)
    if (typeof sectorConfig.r === 'number') {
        ctx.moveTo(sectorConfig.center.x, sectorConfig.center.y)
        ctx.arc(
            sectorConfig.center.x,
            sectorConfig.center.y,
            sectorConfig.r,
            (sectorConfig.startAngle * Math.PI) / 180,
            (sectorConfig.endAngle * Math.PI) / 180
        )
        ctx.closePath()
    } else {
        // 空心扇形
        const maxR = Math.max(...sectorConfig.r)
        const minR = Math.min(...sectorConfig.r)

        // 小扇形的开始点坐标
        const minSCoordinate: Coordinate = {
            x:
                sectorConfig.center.x +
                minR * Math.cos((sectorConfig.startAngle * Math.PI) / 180),
            y:
                sectorConfig.center.y +
                minR * Math.sin((sectorConfig.startAngle * Math.PI) / 180),
        }

        // 小扇形的结束点坐标
        const minECoordinate: Coordinate = {
            x:
                sectorConfig.center.x +
                minR * Math.cos((sectorConfig.endAngle * Math.PI) / 180),
            y:
                sectorConfig.center.y +
                minR * Math.sin((sectorConfig.endAngle * Math.PI) / 180),
        }
        ctx.moveTo(minSCoordinate.x, minSCoordinate.y)
        ctx.arc(
            sectorConfig.center.x,
            sectorConfig.center.y,
            maxR,
            (sectorConfig.startAngle * Math.PI) / 180,
            (sectorConfig.endAngle * Math.PI) / 180
        )
        ctx.lineTo(minECoordinate.x, minECoordinate.y)
        ctx.arc(
            sectorConfig.center.x,
            sectorConfig.center.y,
            minR,
            (sectorConfig.endAngle * Math.PI) / 180,
            (sectorConfig.startAngle * Math.PI) / 180,
            true
        )
        // ctx.closePath()
    }
    drawTypeDraw(ctx, sectorConfig.drawType)
    ctx.restore()
}

export type Direction = 'top' | 'left' | 'right' | 'bottom' | 'auto'

export interface TriangleConf {
    topCoordinate: Coordinate
    w?: number
    h?: number
    // 箭头的朝向
    direction?: Direction
    drawType?: DrawType
    // 包含边框 和 填充样式
    drawStyle?: DrawStyle
}

// 绘制三角形的默认值
export const DefTriangleConf: TriangleConf = {
    topCoordinate: null,
    w: 6,
    h: 6,
    direction: 'left',
    drawType: 'stroke',
    drawStyle: deepCopy(DefDrawStyle),
}

/**
 * 绘制三角形 , 返回三角形尾部的点，方便线段的绘制
 * @param ctx
 * @param triangleConf
 */
export function drawTriangle(
    ctx: CanvasRenderingContext2D,
    triangleConf: TriangleConf
): Coordinate {
    triangleConf = mergeData(DefTriangleConf, triangleConf)
    const c = triangleConf
    let cCoordinate: Coordinate = {
        x: 0,
        y: 0,
    }

    if (isOdd(c.drawStyle.w) && c.drawType === 'stroke') {
        c.topCoordinate.y += 0.5
        c.topCoordinate.x += 0.5
    }
    ctx.save()
    ctx.beginPath()
    setDrawStyle(ctx, triangleConf.drawType, triangleConf.drawStyle)
    ctx.moveTo(c.topCoordinate.x, c.topCoordinate.y)
    switch (triangleConf.direction) {
        case 'top':
            let topY = triangleConf.topCoordinate.y + c.h
            ctx.lineTo(
                c.topCoordinate.x + c.w / 2,
                triangleConf.topCoordinate.y + c.h
            )
            ctx.lineTo(
                c.topCoordinate.x - c.w / 2,
                triangleConf.topCoordinate.y + c.h
            )
            cCoordinate = {
                x: c.topCoordinate.x,
                y: triangleConf.topCoordinate.y + c.h,
            }
            break
        case 'bottom':
            ctx.lineTo(
                c.topCoordinate.x + c.w / 2,
                triangleConf.topCoordinate.y - c.h
            )
            ctx.lineTo(
                c.topCoordinate.x - c.w / 2,
                triangleConf.topCoordinate.y - c.h
            )
            cCoordinate = {
                x: c.topCoordinate.x,
                y: triangleConf.topCoordinate.y - c.h,
            }
            break
        case 'left':
            ctx.lineTo(c.topCoordinate.x + c.w, c.topCoordinate.y - c.h / 2)
            ctx.lineTo(c.topCoordinate.x + c.w, c.topCoordinate.y + c.h / 2)
            cCoordinate = {
                x: c.topCoordinate.x + c.w,
                y: triangleConf.topCoordinate.y,
            }
            break
        case 'right':
            ctx.lineTo(c.topCoordinate.x - c.w, c.topCoordinate.y - c.h / 2)
            ctx.lineTo(c.topCoordinate.x - c.w, c.topCoordinate.y + c.h / 2)
            cCoordinate = {
                x: c.topCoordinate.x - c.w,
                y: c.topCoordinate.y,
            }
    }
    ctx.closePath()
    drawTypeDraw(ctx, triangleConf.drawType)
    ctx.restore()
    return cCoordinate
}
// interface ArrowConf extends TriangleConf {
//     lineW?: number
//     lineLen?: number
// }
//
// const DefArrowConf = mergeData(
//     DefTriangleConf as ArrowConf,
//     { lineW: 1, lineLen: 10 } as any
// )
//
// export function drawArrow(ctx: CanvasRenderingContext2D, conf: ArrowConf) {
//     conf = mergeData(DefArrowConf, conf)
//     const c = conf
//     const cCoordinate = drawTriangle(ctx, conf)
//     if (c.direction === 'auto') {
//
//     }
//     switch (c.direction) {
//     }
// }

interface TxtConf {
    // 坐标
    coordinate: Coordinate
    // 绘制的文本
    txt: string
    // 填充 还是 描边
    drawType?: DrawType
    drawStyle?: DrawStyle
    // 文本大小
    fontSize?: number
    // 字体
    fontFamily?: string
    // 基线
    textBaseline?: CanvasTextBaseline
    // 文本的绘制方向
    direction?: CanvasDirection
    // 对齐方向
    textAlign?: CanvasTextAlign
    maxWidth?: number
}
// ctx.font =
// ctx.textBaseline

const DefTxtConf: TxtConf = {
    coordinate: null,
    txt: null,
    drawType: 'full',
    drawStyle: {
        w: 1,
        style: '#000',
    },
    fontSize: 12,
    fontFamily: 'Microsoft YaHei',
    textBaseline: 'alphabetic',
    direction: 'inherit',
    textAlign: 'start',
    maxWidth: undefined,
}

/**
 * 绘制文字
 * @param ctx
 * @param txtConf
 */
export function drawTxt(ctx: CanvasRenderingContext2D, txtConf: TxtConf) {
    const c = mergeData(DefTxtConf, txtConf)
    ctx.save()
    ctx.beginPath()
    ctx.font = `${c.fontSize} ${c.fontFamily}`
    ctx.textBaseline = c.textBaseline
    ctx.direction = c.direction
    ctx.textAlign = c.textAlign
    setDrawStyle(ctx, c.drawType, c.drawStyle)

    if (c.drawType === 'full') {
        ctx.fillText(c.txt, c.coordinate.x, c.coordinate.y, c.maxWidth)
    } else {
        ctx.strokeText(c.txt, c.coordinate.x, c.coordinate.y, c.maxWidth)
    }
    ctx.restore()
}

// smooth 平滑的   sharp：锐利
export type BrokenLineType = 'smooth' | 'sharp'
export interface BrokenLineConfig {
    lineType?: BrokenLineType
    drawStyle?: DrawStyle
}

export const DefBrokenLineConfig: BrokenLineConfig = {
    lineType: 'smooth',
    drawStyle: deepCopy(DefDrawStyle),
}

// todo 曲线绘制得优化
// 三次方贝赛尔曲线 控制点计算, 好像有问
// 参考 https://wenku.baidu.com/view/c790f8d46bec0975f565e211.html
// 折线绘制
export function drawBrokenLine(
    ctx: CanvasRenderingContext2D,
    dotArr: Coordinate[],
    brokenLineConfig?: BrokenLineConfig
) {
    brokenLineConfig = mergeData(DefBrokenLineConfig, brokenLineConfig)
    if (dotArr.length < 2) return
    ctx.save()
    ctx.beginPath()
    if (brokenLineConfig && brokenLineConfig.drawStyle) {
        setDrawStyle(ctx, 'stroke', brokenLineConfig.drawStyle)
    }

    if (brokenLineConfig && brokenLineConfig.lineType === 'smooth') {
        dotArr.forEach((item, index) => {
            let scale = 0.08
            let last1X = (dotArr[index - 1] && dotArr[index - 1].x) || 0,
                last1Y = (dotArr[index - 1] && dotArr[index - 1].y) || 0,
                //前一个点坐标
                last2X = (dotArr[index - 2] && dotArr[index - 2].x) || 0,
                last2Y = (dotArr[index - 2] && dotArr[index - 2].y) || 0,
                //前两个点坐标
                nowX = item.x,
                nowY = item.y,
                //当期点坐标
                nextX = (dotArr[index + 1] && dotArr[index + 1].x) || 0,
                nextY = (dotArr[index + 1] && dotArr[index + 1].y) || 0,
                //下一个点坐标
                cAx = last1X + (nowX - last2X) * scale,
                cAy = last1Y + (nowY - last2Y) * scale,
                cBx = nowX - (nextX - last1X) * scale,
                cBy = nowY - (nextY - last1Y) * scale
            if (index === 0) {
                ctx.lineTo(nowX, nowY)
                return
            } else if (index === 1) {
                cAx = last1X + (nowX - 0) * scale
                cAy = last1Y + (nowY - 0) * scale
            } else if (index === dotArr.length - 1) {
                cBx = nowX - (nowX - last1X) * scale
                cBy = nowY - (nowY - last1Y) * scale
            }
            ctx.bezierCurveTo(cAx, cAy, cBx, cBy, nowX, nowY)
            //绘制出上一个点到当前点的贝塞尔曲线
        })
    } else {
        dotArr.forEach((item, index) => {
            if (index === 0) {
                ctx.moveTo(item.x, item.y)
            } else {
                ctx.lineTo(item.x, item.y)
            }
        })
    }
    ctx.stroke()
    ctx.restore()
}
