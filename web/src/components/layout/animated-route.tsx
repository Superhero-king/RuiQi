import { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useLocation } from "react-router"
import { pageSlideTransition } from "@/components/ui/animations/route-animations"

interface AnimatedRouteProps {
    children: ReactNode
}

export function AnimatedRoute({ children }: AnimatedRouteProps) {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                {...pageSlideTransition}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
} 