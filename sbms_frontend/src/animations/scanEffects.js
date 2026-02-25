export const pulseRingAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
        transition: { duration: 2, repeat: Infinity }
    }
};

export const neonBorderRotate = {
    animate: {
        rotate: 360,
        transition: { duration: 4, repeat: Infinity, ease: 'linear' }
    }
};

export const rippleScanClick = {
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
};

export const eligibilityBlinkFlash = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
};
