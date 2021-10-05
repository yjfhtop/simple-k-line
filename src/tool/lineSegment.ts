/**
 * 线段
 */
import { BaseTool } from '@/tool/baseTool'
import { Coordinate, drawCircular } from '@/utils/canvasDraw'

export class LineSegment extends BaseTool {
    public dotNumber = 2
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
        let inLine = false
        const ctx = this.chart.kLine.tc
        ctx.save()
        ctx.lineWidth = this.conf.line.inLineW
        ctx.beginPath()
        this.dotCoordinateArr.forEach((item, index) => {
            if (index === 0) {
                ctx.moveTo(item.x, item.y)
            } else {
                ctx.lineTo(item.x, item.y)
            }
        })
        inLine = ctx.isPointInStroke(dot.x, dot.y)
        ctx.restore()
        return inLine
    }
}
