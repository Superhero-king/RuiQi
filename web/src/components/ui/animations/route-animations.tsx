import { HTMLMotionProps } from "motion/react"

// 页面过渡动画配置
export const pageTransitionAnimation: HTMLMotionProps<"div"> = {
  className: "w-full h-full",
  initial: "initial",
  animate: "animate",
  exit: "exit",
  variants: {
    initial: { 
      opacity: 0,
      x: 10
    },
    animate: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 1, 0.5, 1] // 平滑的过渡曲线
      }
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }
}

// 页面淡入淡出过渡
export const pageFadeTransition: HTMLMotionProps<"div"> = {
  className: "w-full h-full",
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.25 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

// 页面滑动过渡
export const pageSlideTransition: HTMLMotionProps<"div"> = {
  className: "w-full h-full",
  initial: { x: 20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: { 
      duration: 0.25
    }
  }
} 