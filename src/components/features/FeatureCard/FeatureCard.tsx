import React from 'react';
import styles from './FeatureCard.module.css';
import { Card } from '../../ui/Card/Card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon: Icon,
    title,
    description
}) => {
    return (
        <Card className={styles.featureCard}>
            <div className={styles.iconBox}>
                <Icon size={40} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </Card>
    );
};
