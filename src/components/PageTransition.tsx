import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: -20,
    },
};

const pageTransition = {
    type: 'tween' as const,
    ease: 'easeInOut',
    duration: 0.5,
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
};

export default PageTransition;
