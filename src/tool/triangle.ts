/**
 * 三角形
 */
import { BaseTool } from '@/tool/baseTool'
import { Coordinate, drawCircular } from '@/utils/canvasDraw'
import { deepCopy } from '@/utils/dataHandle'
import { BaseChart } from '@/chart/baseChart'
import { dotAndDitRGetLineDot } from '@/utils/coordinate'

export class Triangle extends BaseTool {
    public dotNumber = 3
    // 当前选中的点的下标
    public activeDotNumber: number = -1
    draw() {
        const ctx = this.chart.kLine.tc
        const dotCoordinateArr = this.dotCoordinateArr
        ctx.save()
        ctx.beginPath()

        if (this.active) {
            ctx.setLineDash(this.conf.line.activeLineDash)
        }
        ctx.strokeStyle = this.conf.line.color
        ctx.lineWidth = this.conf.line.lineW
        // 线的绘制
        dotCoordinateArr.forEach((item, index) => {
            if (!item) return
            if (index === 0) {
                ctx.moveTo(item.x, item.y)
            } else {
                ctx.lineTo(item.x, item.y)
            }
        })
        this.dotArr.length === this.dotNumber && ctx.closePath()
        ctx.stroke()
        ctx.restore()

        // 点的绘制
        if (this.active) {
            dotCoordinateArr.forEach((item, index) => {
                drawCircular(ctx, {
                    center: item,
                    r: [this.conf.dot.bigR, this.conf.dot.smallR],
                    drawType: 'full',
                    drawStyle: {
                        style:
                            index === this.activeDotNumber
                                ? this.conf.dot.activeColor
                                : this.conf.dot.color,
                    },
                    innerStyle: {
                        style: this.chart.kLine.conf.bgc,
                    },
                })
            })
        }
    }

    inLine(dot: Coordinate): boolean {
        const ctx = this.chart.kLine.tc
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = this.conf.line.inLineW

        this.dotCoordinateArr.forEach((item, index) => {
            if (index === 0) {
                ctx.moveTo(item.x, item.y)
            } else {
                ctx.lineTo(item.x, item.y)
            }
        })
        ctx.closePath()
        ctx.restore()
        return ctx.isPointInStroke(dot.x, dot.y)
    }
}
