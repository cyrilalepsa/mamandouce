import * as React from "react"

import { cn } from "@/lib/utils"

// Reflet glossy
const GlossyReflect = ({ rounded = "2xl" }) => (
  <div 
    className={`absolute top-0 left-3 right-3 h-2/5 rounded-t-${rounded} pointer-events-none`}
    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
  />
);

// Détecte si le className contient un gradient de couleur
const hasGradientBackground = (className) => {
  if (!className) return false;
  return className.includes('bg-gradient-to') || 
         className.includes('from-') ||
         className.includes('glossy-card-');
};

const Card = React.forwardRef(({ className, glossy, glossyColor, children, ...props }, ref) => {
  // Auto-détecter si on doit appliquer glossy basé sur les classes
  const shouldGlossy = glossy || hasGradientBackground(className);
  
  if (shouldGlossy) {
    return (
      <div
        ref={ref}
        className={cn("rounded-xl relative overflow-hidden", glossyColor && `glossy-card-${glossyColor}`, className)}
        {...props}
      >
        <GlossyReflect />
        <div className="relative">
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    >
      {children}
    </div>
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
