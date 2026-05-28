import React from 'react';
import styles from './Card.module.css';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    hover = false,
    ...props
}) => {
    return (
        <div
            className={clsx(
                styles.card,
                hover && styles.hover,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
