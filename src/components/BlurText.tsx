'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, Variants } from 'motion/react';

interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'letters';
    direction?: 'top' | 'bottom';
    threshold?: number;
    rootMargin?: string;
    animationFrom?: Variants;
    animationTo?: Variants;
    easing?: any;
    onAnimationComplete?: () => void;
    stepDuration?: number;
}

const BlurText: React.FC<BlurTextProps> = ({
    text = '',
    delay = 0,
    className = '',
    animateBy = 'words',
    direction = 'top',
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing = [0.25, 0.1, 0.25, 1], // easeOutCubic
    onAnimationComplete,
    stepDuration = 0.1,
}) => {
    const ref = useRef<HTMLHeadingElement>(null);
    const isInView = useInView(ref, { once: true, amount: threshold, margin: rootMargin });
    const [complete, setComplete] = useState(false);

    const elements = animateBy === 'words' ? text.split(' ') : text.split('');

    const defaultFrom = {
        filter: 'blur(10px)',
        opacity: 0,
        transform: direction === 'top' ? 'translate3d(0,-50px,0)' : 'translate3d(0,50px,0)',
    };

    const defaultTo = {
        filter: 'blur(0px)',
        opacity: 1,
        transform: 'translate3d(0,0,0)',
    };

    useEffect(() => {
        if (isInView && !complete) {
            // Animation trigger handled by motion component prop
        }
    }, [isInView, complete]);

    return (
        <h2 ref={ref} className={`flex flex-wrap ${className}`}>
            {elements.map((element, index) => (
                <motion.span
                    key={index}
                    initial={animationFrom || defaultFrom}
                    animate={isInView ? (animationTo || defaultTo) : (animationFrom || defaultFrom)}
                    transition={{
                        duration: 1,
                        ease: easing,
                        delay: delay + index * stepDuration,
                    }}
                    className="inline-block"
                    style={{
                        marginRight: animateBy === 'words' ? '0.25em' : '0',
                        willChange: 'transform, filter, opacity'
                    }}
                    onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
                >
                    {element === ' ' ? '\u00A0' : element}
                </motion.span>
            ))}
        </h2>
    );
};

export default BlurText;
