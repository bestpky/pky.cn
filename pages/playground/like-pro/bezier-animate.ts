const speedRatio = 5 // 速度系数

type Point = [number, number]

/**
 * 生成贝塞尔曲线动画
 */
export default class Animate {
    box: HTMLDivElement
    boxWidth = 0
    boxHeight = 0
    width = 0
    height = 0
    pointsNum = 0
    duration = 1000 / 60
    isPlaying = false // 动画是否播放中

    constructor(option: { box: HTMLDivElement; width?: number; height?: number }) {
        this.box = option.box
        this.boxWidth = this.box.offsetWidth
        this.boxHeight = this.box.offsetHeight
        this.width = option.width || 30
        this.height = option.height || 30
        this.pointsNum = Math.round(this.boxHeight / speedRatio)
    }

    // 创建三阶贝塞尔曲线的四个点坐标
    getBezierLine(p0: Point) {
        const p1x = this.checkXBorder(this.getRandom(0, this.boxWidth))
        const p1y = this.boxHeight / 2
        const p1: Point = [p1x, p1y]
        const p2x = this.checkXBorder(this.getRandom(0, this.boxWidth))
        const p2y = this.boxHeight / 4
        const p2: Point = [p2x, p2y]
        const p3: Point = [this.getRandom(0, this.boxWidth - this.width), 0]
        return { p0, p1, p2, p3 }
    }

    /**
     * 三阶贝塞额曲线公式
     * p0, p1, p2, p3 分别是四个点坐标
     */
    threeBezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
        const [x0, y0] = p0
        const [x1, y1] = p1
        const [x2, y2] = p2
        const [x3, y3] = p3
        const x =
            x0 * (1 - t) * (1 - t) * (1 - t) +
            3 * x1 * t * (1 - t) * (1 - t) +
            3 * x2 * t * t * (1 - t) +
            x3 * t * t * t
        const y =
            y0 * (1 - t) * (1 - t) * (1 - t) +
            3 * y1 * t * (1 - t) * (1 - t) +
            3 * y2 * t * t * (1 - t) +
            y3 * t * t * t
        return [x, y]
    }

    // 获取贝塞尔曲线的坐标点
    getBezierPoints(t: number, p0: Point, p1: Point, p2: Point, p3: Point) {
        const points: Point[] = []
        for (let i = 0; i < t; i++) {
            points.push(this.threeBezier(i / t, p0, p1, p2, p3))
        }
        points.push([...p3])
        return points
    }

    // 检查并纠正x值
    checkXBorder(x: number) {
        if (x < 0) {
            x = 0
        } else if (x > this.boxWidth - this.width) {
            x = this.boxWidth - this.width
        }
        return x
    }

    // 获取一个区间的随机数
    getRandom(m: number, n: number) {
        return Math.floor(Math.random() * (m - n) + n)
    }

    // 一个气泡的生命周期
    getWholeDuration() {
        return this.duration * (this.pointsNum + 1)
    }

    // 使用requestAnimationFrame播放更流畅，不掉帧
    play(points: Point[] = [], cb: (p?: Point, count?: number) => void) {
        let count = 0
        let id: number
        const start = () => {
            count += this.duration
            points.length && cb(points.shift(), count)
            if (points.length) {
                id = requestAnimationFrame(start)
            } else {
                cancelAnimationFrame(id)
                cb()
            }
        }
        // 第一帧
        id = requestAnimationFrame(start)
    }

    // 每一帧的动画逻辑
    playAnimationAtOneFrame(points: Point[], div: HTMLDivElement) {
        this.play(points, (p, s) => {
            // 动画结束移除dom
            if (!p) {
                this.box.removeChild(div)
                return
            }
            // 更新dom坐标
            div.style.left = `${p[0]}px`
            div.style.top = `${p[1]}px`
            // 更新透明度
            const wholeDuration = this.getWholeDuration()
            const fadeInPeriod = wholeDuration * 0.2
            const fadeOutPeriod = wholeDuration * 0.8
            const opacityStep = period => 1 / Math.floor(period / this.duration)
            if (s) {
                if (s < fadeInPeriod) {
                    div.style.opacity = `${+div.style.opacity + opacityStep(fadeInPeriod)}`
                } else if (s > fadeOutPeriod) {
                    div.style.opacity = `${+div.style.opacity - opacityStep(fadeOutPeriod)}`
                }
            }
        })
    }

    // 创建dom 开始动画
    create(cb) {
        // 初始化元素
        const div = document.createElement('div')
        div.style.width = `${this.width}px`
        div.style.height = `${this.height}px`
        div.style.position = 'absolute'
        div.style.opacity = '0'
        const originTop = this.boxHeight - this.height
        const originLeft = this.boxWidth / 2 - this.width / 2
        div.style.left = `${originLeft}px`
        div.style.top = `${originTop}px`
        cb && cb(div)
        this.box.appendChild(div)
        // 获取四个点关键
        const line = this.getBezierLine([originLeft, originTop])
        // 获取一连串贝塞尔曲线坐标点
        const points = this.getBezierPoints(this.pointsNum, line.p0, line.p1, line.p2, line.p3)
        console.log(points)
        // 根据坐标点改变元素位置
        this.playAnimationAtOneFrame(points, div)
    }

    // 批量生成元素
    batchCreate(cb) {
        this.isPlaying = true
        this.updateBoxSize()
        let n = 0
        const t = () => {
            n += 1
            this.create(cb)
            const tt = setTimeout(() => {
                if (n < 30) {
                    t()
                } else {
                    this.isPlaying = false
                    clearTimeout(tt)
                }
            }, this.getRandom(1, 4) * 100)
        }
        t()
    }

    updateBoxSize() {
        this.boxWidth = this.box.offsetWidth
        this.boxHeight = this.box.offsetHeight
        this.pointsNum = Math.round(this.boxHeight / speedRatio)
    }
}
