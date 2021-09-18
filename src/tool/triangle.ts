/**
 * 三角形
 */
import { BaseTool } from '@/tool/baseTool'
import { drawCircular, drawLine } from '@/utils/canvasDraw'
import { deepCopy } from '@/utils/dataHandle'
import { BaseChart } from '@/chart/baseChart'
import { dotAndDitRGetLineDot } from '@/utils/coordinate'

export class Triangle extends BaseTool {
    public dotNumber = 3
    draw() {
        if (this.dotArr.length === 1) {
            drawCircular(this.chart.kLine.tc, {
                center: this.dotCoordinateArr[0],
                r: 4,
                drawStyle: {
                    style: '#fff',
                    w: 2,
                },
                drawType: 'stroke',
            })
        } else if (this.dotArr.length === 2) {
            drawCircular(this.chart.kLine.tc, {
                center: this.dotCoordinateArr[0],
                r: 4,
                drawStyle: {
                    style: '#fff',
                    w: 2,
                },
                drawType: 'stroke',
            })
            drawCircular(this.chart.kLine.tc, {
                center: this.dotCoordinateArr[1],
                r: 4,
                drawStyle: {
                    style: '#fff',
                    w: 2,
                },
                drawType: 'stroke',
            })
            const dot1 = dotAndDitRGetLineDot(
                this.dotCoordinateArr[0],
                this.dotCoordinateArr[1],
                5
            )
            const dot2 = dotAndDitRGetLineDot(
                this.dotCoordinateArr[1],
                this.dotCoordinateArr[0],
                5
            )
            drawLine(this.chart.kLine.tc, dot1, dot2, {
                w: 1,
                style: '#fff',
                lineDash: [2, 2],
            })
        } else {
            // 区分有没有active, 有active 是虚线， 没有就实线
            const c = this.chart.kLine.tc
            c.save()
            this.active && c.setLineDash([2, 2])
            c.beginPath()
            c.strokeStyle = '#fff'
            c.lineWidth = 1
            c.moveTo(this.dotCoordinateArr[0].x, this.dotCoordinateArr[0].y)
            c.lineTo(this.dotCoordinateArr[1].x, this.dotCoordinateArr[1].y)
            c.lineTo(this.dotCoordinateArr[2].x, this.dotCoordinateArr[2].y)
            c.closePath()
            c.stroke()
            c.restore()

            drawCircular(this.chart.kLine.tc, {
                center: this.dotCoordinateArr[0],
                r: 4,
                drawStyle: {
                    style: '#fff',
                    w: 2,
                },
                drawType: 'stroke',
            })
            drawCircular(this.chart.kLine.tc, {
                center: this.dotCoordinateArr[1],
                r: 4,
                drawStyle: {
                    style: '#fff',
                    w: 2,
                },
                drawType: 'stroke',
            })
            drawCircular(this.chart.kLine.tc, {
                center: this.dotCoordinateArr[2],
                r: 4,
                drawStyle: {
                    style: '#fff',
                    w: 2,
                },
                drawType: 'stroke',
            })
        }
    }
}
