import { BaseIndicators } from '@/indicators/baseIndicators'
import { DataItem } from '@/kLineConf'
import { Coordinate, drawBrokenLine, drawTxt } from '@/utils/canvasDraw'
import { MAIndicatorsConfItem } from '@/indicators/maIndicators'
import { getTxtW } from '@/utils/element'

export interface BaseMultipleIndicatorsItem {
    lineW: number
    color: string
    show?: boolean
    number: number
}

export interface CalcShowItem {
    key: string
    conf: BaseMultipleIndicatorsItem
    dotArr: Coordinate[]
}
export interface TxtAndColor {
    txt: string
    color?: string
}

export type BaseMultipleIndicatorsConf = BaseMultipleIndicatorsItem[]
export abstract class BaseMultipleIndicators extends BaseIndicators {
    public showItemArr: CalcShowItem[] = []
    // public topInfoTxt: string = ''
    get conf() {
        return this.chart.conf.indicatorsConfMap[
            this.name
        ] as BaseMultipleIndicatorsConf
    }

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        this.getShowItemArr()
        this.showItemArr.forEach((calcShowItem) => {
            const useCacheKey = calcShowItem.key
            let useValue = item[useCacheKey]

            // 需要计算
            if (
                useValue === undefined ||
                index === this.chart.kLine.dataArr.length - 1
            ) {
                // 计算
                useValue = this.calcItem(calcShowItem, item, index, isMaxValue)
                // 缓存
                this.cacheData(useCacheKey, item, useValue, index, isMaxValue)
            }
            this.itemTryMaxMin(useCacheKey, item, useValue, index, isMaxValue)
        })
    }
    // 计算单个项目
    abstract calcItem(
        calcShowItem: CalcShowItem,
        item: DataItem,
        index: number,
        isMaxValue: boolean
    ): number
    // 获取要显示的 CalcShowItem 数组
    getShowItemArr() {
        const dataArr: {
            key: string
            conf: MAIndicatorsConfItem
            dotArr: Coordinate[]
        }[] = []
        this.conf.forEach((conf) => {
            if (!conf.show) return
            const key = this.cacheKey + conf.number
            dataArr.push({
                key,
                conf,
                dotArr: [],
            })
        })
        this.showItemArr = dataArr
    }

    // 计算showItemArr 的DotArr
    calcDotArr() {
        const dataArr = this.showItemArr

        // 添加之前先清空
        dataArr.forEach((citem: any) => {
            citem.dotArr = []
        })

        for (
            let i = this.chart.kLine.drawSIndex;
            i <= this.chart.kLine.drawEIndex;
            i++
        ) {
            const item = this.chart.kLine.dataArr[i]
            if (!item) continue
            dataArr.forEach((citem: any) => {
                const key = citem.key
                const v = item[key]
                if (v === undefined) {
                    return
                }
                citem.dotArr.push({
                    x: this.chart.kLine.xAxis.indexGetX(i),
                    y: this.chart.YAxis.valueGetY(v),
                })
            })
        }
    }

    // 这里是绘制折线.... 子类可以不使用重写即可
    drawBottom() {
        this.calcDotArr()
        this.drawIndicators()
    }
    // 绘制 item 的线段， 这里默认是绘制折线，子类不需要可以修改
    drawIndicators() {
        const cxt = this.chart.kLine.bc
        this.showItemArr.forEach((item) => {
            drawBrokenLine(cxt, item.dotArr, {
                lineType: 'sharp',
                drawStyle: {
                    w: item.conf.lineW,
                    style: item.conf.color,
                },
            })
        })
    }

    drawTop() {
        this.drawTopInfoTxt(this.chart.kLine.eventHandle.nowIndex)
    }

    drawTopInfoTxt(index: number) {
        const ctx = this.chart.kLine.tc
        const nowItem = this.chart.kLine.dataArr[index]
        const infoTxtConf = this.chart.conf.infoTxtConf
        if (!nowItem) return
        const showArr = this.showItemArr
        if (showArr.length === 0) return

        const txtArr: TxtAndColor[] = [
            {
                txt: `${this.topInfoName}(${showArr
                    .map((item) => item.conf.number)
                    .join(',')})`,
            },
        ]

        showArr.forEach((item) => {
            const key = item.key
            const value = nowItem[key]
            if (value === undefined) return

            const txt = `${this.topInfoName}(${item.conf.number}): ${value}`
            const color = item.conf.color

            txtArr.push({
                txt,
                color,
            })
        })

        this.drawTopInfoTxtBefore &&
            this.drawTopInfoTxtBefore(index, txtArr, nowItem)

        txtArr.forEach((item) => {
            const txtLen = getTxtW(
                ctx,
                item.txt,
                infoTxtConf.size,
                infoTxtConf.family
            )
            drawTxt(ctx, {
                coordinate: this.chart.infoTxtCoordinate,
                txt: item.txt,
                drawStyle: {
                    style: item.color || infoTxtConf.color,
                },
                fontFamily: infoTxtConf.family,
                fontSize: infoTxtConf.size,
                textBaseline: 'top',
                textAlign: 'left',
            })
            this.chart.infoTxtCoordinate.x += txtLen + infoTxtConf.xSpace
        })

        this.chart.infoTxtCoordinate.y += infoTxtConf.size + infoTxtConf.ySpace
        this.chart.initInfoTxtCoordinateX()
    }
    // 在 drawTopInfoTxt 绘制开始之前, 可以对绘制做处理
    drawTopInfoTxtBefore(
        index: number,
        txtArr: TxtAndColor[],
        nowItem: DataItem
    ) {}
}
