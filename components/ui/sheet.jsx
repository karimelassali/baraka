"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const SheetContext = React.createContext({})

const Sheet = ({
    open,
    onOpenChange,
    children
}) => {
    return (
        <SheetContext.Provider value={{ open, onOpenChange }}>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => onOpenChange(false)}
                        />
                        {/* Content Container */}
                        <div className="relative z-50 h-full pointer-events-none w-full flex justify-end">
                            {children}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </SheetContext.Provider>
    )
}

const SheetContent = React.forwardRef(({ className, children, side = "right", ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext)
    const variants = {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" }
    }

    return (
        <motion.div
            ref={ref}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
                "h-full w-3/4 border-l bg-background p-6 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm pointer-events-auto",
                className
            )}
            {...props}
        >
            {children}
            <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
                onClick={() => onOpenChange(false)}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </motion.div>
    )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
    />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
    className,
    ...props
}) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold text-foreground", className)}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
SheetDescription.displayName = "SheetDescription"

export {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
