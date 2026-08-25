import * as React from "react"

import { cn } from "@/lib/utils"

// Reflet glossy SUPPRIMÉ — Zéro voile blanc sur les cartes (cf. design spec v3)
const GlossyReflect = () => null;

// Détecte si le className contient un gradient de couleur
const hasGradientBackground = (className) => {
  if (!className) return false;
  return className.includes('bg-gradient-to') || 
         className.includes('from-') ||
         className.includes('glossy-card-');
};

/**
 * @param {'default'|'flat'|'glass'|'glass-interactive'} variant
 *   - default: comportement historique (glossy auto)
 *   - flat: carte info statique (plat)
 *   - glass / glass-interactive: glassmorphism bombé (éléments cliquables)
 */
const Card = React.forwardRef(({ className, glossy, glossyColor, variant = 'default', interactive, children, ...props }, ref) => {
  const isInteractive =
    interactive === true ||
    variant === 'glass' ||
    variant === 'glass-interactive' ||
    typeof props.onClick === 'function' ||
    props.role === 'button';

  if (variant === 'flat') {
    return (
      <div
        ref={ref}
        className={cn("rounded-[24px] border bg-card text-card-foreground card-flat soft-clay-text-flat", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isInteractive) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[24px] relative overflow-hidden card-glass-interactive soft-clay-premium soft-clay-text-flat cursor-pointer",
          glossyColor && `glossy-card-${glossyColor}`,
          className
        )}
        {...props}
      >
        <div className="relative z-[2]">{children}</div>
      </div>
    );
  }

  const shouldGlossy = glossy || hasGradientBackground(className);
  
  if (shouldGlossy) {
    return (
      <div
        ref={ref}
        className={cn("rounded-[24px] relative overflow-hidden", glossyColor && `glossy-card-${glossyColor}`, className)}
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
      className={cn("rounded-[24px] border bg-card text-card-foreground shadow card-flat soft-clay-text-flat", className)}
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
