/**
 * 十字线绘制
 */
import SimpleKLine from '@/index'
import { drawLine, drawRect, drawTxt } from '@/utils/canvasDraw'
import { getTxtW } from '@/utils/element'
import { formDate } from '@/utils/timeHandle'

export interface CrossConf {
    line?: {
        lineW?: number
        color?: string
        lineDash?: number[]
    }
    nowHighlight?: {
        bgc?: string
        font?: {
            size?: number
            family?: string
            color?: string
        }
        yH?: number
        xW?: number
    }
}

export class Cross {
    constructor(public kLine: SimpleKLine) {}
    get conf() {
        return this.kLine.conf.crossConf
    }
    draw() {
        const x = this.kLine.xAxis.xGetX(this.kLine.eventHandle.nowCoordinate.x)
        const top = { x, y: 0 }
        const bottom = { x, y: this.kLine.xAxis.leftTop.y }
        const left = { x: 0, y: this.kLine.eventHandle.nowCoordinate.y }
        const right = {
            x: this.kLine.elWH.w - this.kLine.yW,
            y: this.kLine.eventHandle.nowCoordinate.y,
        }

        drawLine(this.kLine.tc, top, bottom, {
            w: this.conf.line.lineW,
            style: this.conf.line.color,
            lineDash: this.conf.line.lineDash,
        })

        drawLine(this.kLine.tc, left, right, {
            w: this.conf.line.lineW,
            style: this.conf.line.color,
            lineDash: this.conf.line.lineDash,
        })
        const nowChart = this.kLine.eventHandle.nowChart

        const value = nowChart.formData(
            nowChart.YGetValue(this.kLine.eventHandle.nowCoordinate.y)
        )
        const date = this.kLine.xAxis.xGetValue(x)
        // 数值的绘制 s
        const fontSize = 14
        drawRect(this.kLine.tc, {
            leftTop: {
                x: right.x,
                y: right.y - this.conf.nowHighlight.yH / 2,
            },
            w: this.kLine.yW,
            h: this.conf.nowHighlight.yH,
            drawStyle: {
                style: this.conf.nowHighlight.bgc,
            },
        })
        drawTxt(this.kLine.tc, {
            coordinate: {
                x: right.x + this.kLine.yW / 2,
                y: right.y,
            },
            txt: value,
            fontSize: this.conf.nowHighlight.font.size,
            drawStyle: {
                style: this.conf.nowHighlight.font.color,
            },
            fontFamily: this.conf.nowHighlight.font.family,
            textAlign: 'center',
            textBaseline: 'middle',
        })
        const useDate = formDate(date)
        // const useDateW = getTxtW(
        //     this.kLine.tc,
        //     useDate,
        //     this.conf.nowHighlight.font.size
        // )

        let drawX = bottom.x
        // 处理边界问题 s
        if (bottom.x < this.conf.nowHighlight.xW / 2) {
            drawX = this.conf.nowHighlight.xW / 2
        } else if (
            bottom.x + this.conf.nowHighlight.xW / 2 >
            this.kLine.chartMaxX
        ) {
            drawX = this.kLine.chartMaxX - this.conf.nowHighlight.xW / 2
        }
        // 处理边界问题 e
        drawRect(this.kLine.tc, {
            leftTop: {
                x: drawX - this.conf.nowHighlight.xW / 2,
                y: bottom.y,
            },
            w: this.conf.nowHighlight.xW,
            h: this.kLine.conf.xConf.h,
            drawStyle: {
                style: this.conf.nowHighlight.bgc,
            },
        })

        drawTxt(this.kLine.tc, {
            coordinate: {
                x: drawX,
                y: bottom.y + this.kLine.conf.xConf.h / 2,
            },
            txt: formDate(useDate),
            textBaseline: 'middle',
            textAlign: 'center',
            fontSize: this.conf.nowHighlight.font.size,
            drawStyle: {
                style: this.conf.nowHighlight.font.color,
            },
            fontFamily: this.conf.nowHighlight.font.family,
        })
        // 数值的绘制 e
    }
}
