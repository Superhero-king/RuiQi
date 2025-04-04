import { HTMLMotionProps } from "motion/react"

// 网格容器的动画配置
export const gridContainerAnimation: HTMLMotionProps<"div"> = {
    initial: "initial",
    animate: "animate",
    variants: {
        initial: {},
        animate: {
            transition: {
                staggerChildren: 0.08 // 创建错落有致的动画效果
            }
        }
    }
}

// 网格项目的动画配置
export const gridItemAnimation: HTMLMotionProps<"div"> = {
    variants: {
        initial: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 200
            }
        }
    }
}

// 滚动时渐入的动画配置
export const scrollFadeInAnimation: HTMLMotionProps<"div"> = {
    initial: {
        opacity: 0,
        y: 20
    },
    whileInView: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 1, 0.5, 1]
        }
    },
    viewport: {
        once: false, // 设置为true时只触发一次动画
        margin: "-10% 0px" // 视口的偏移量，提前开始动画
    }
}