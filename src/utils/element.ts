/**
 * dom元素相关
 */

/**
 * 查找容器元素， 如果是字符串则查找元素
 * @param el
 */
export function getContainerEl(
    el: HTMLElement | string = '#k_line'
): HTMLElement {
    if (typeof el === 'string') {
        return document.querySelector(el)
    } else {
        return el
    }
}

/**
 * 在指定的 canvas 和 指定的 字体 返回字体的宽度
 * @param ctx  canvas 2d 上下文
 * @param font 字体样式
 * @param txt 文本
 * @param ceil 默认想上取整
 */
export function getTxtW(
    ctx: CanvasRenderingContext2D,
    txt: string,
    font?: string,
    ceil = true
) {
    let w: number
    ctx.save()
    font && (ctx.font = font)
    w = ctx.measureText(txt).width
    ctx.restore()
    w = ceil ? Math.ceil(w) : w
    return w
}

/**
 * 获取屏幕比
 */
export function getPixelRatio() {
    return window.devicePixelRatio || 1
}

export interface CanvasElCtx {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
}

/**
 * 创建高清canvas
 * @param w
 * @param h
 * @param style
 */
export function createHDCanvas(
    w: number,
    h: number,
    style?: Partial<CSSStyleDeclaration>
): CanvasElCtx {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    let pxRatio = getPixelRatio()

    canvas.width = w * pxRatio
    canvas.height = h * pxRatio

    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'

    ctx.scale(pxRatio, pxRatio)

    if (style) {
        Object.keys(style).forEach((key) => {
            canvas.style[key as any] = style[key as any]
        })
    }

    return {
        canvas,
        ctx,
    }
}

export interface WH {
    w: number
    h: number
}
/**
 * 获取容器的宽高， 不包含 padding
 * @param el
 */
export function getEleHW(el: HTMLElement): WH {
    const elData = window.getComputedStyle && window.getComputedStyle(el)
    const H = parseFloat(elData.height)
    const W = parseFloat(elData.width)
    return {
        w: W,
        h: H,
    }
}
