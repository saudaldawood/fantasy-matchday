import React from 'react';
import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
    count?: number;
    type?: 'card' | 'text' | 'player' | 'match';
}

export function LoadingSkeleton({ count = 1, type = 'card' }: LoadingSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={styles.skeleton}>
                    {type === 'card' && <CardSkeleton />}
                    {type === 'text' && <TextSkeleton />}
                    {type === 'player' && <PlayerSkeleton />}
                    {type === 'match' && <MatchSkeleton />}
                </div>
            ))}
        </>
    );
}

function CardSkeleton() {
    return (
        <div className={styles.card}>
            <div className={styles.imageBox} />
            <div className={styles.content}>
                <div className={`${styles.line} ${styles.title}`} />
                <div className={styles.line} />
                <div className={`${styles.line} ${styles.short}`} />
            </div>
        </div>
    );
}

function TextSkeleton() {
    return (
        <div className={styles.textBlock}>
            <div className={styles.line} />
            <div className={`${styles.line} ${styles.short}`} />
        </div>
    );
}

function PlayerSkeleton() {
    return (
        <div className={styles.playerCard}>
            <div className={styles.avatar} />
            <div className={styles.playerInfo}>
                <div className={`${styles.line} ${styles.name}`} />
                <div className={`${styles.line} ${styles.small}`} />
            </div>
        </div>
    );
}

function MatchSkeleton() {
    return (
        <div className={styles.matchCard}>
            <div className={styles.teamSection}>
                <div className={styles.teamLogo} />
                <div className={`${styles.line} ${styles.teamName}`} />
            </div>
            <div className={styles.vs}>VS</div>
            <div className={styles.teamSection}>
                <div className={styles.teamLogo} />
                <div className={`${styles.line} ${styles.teamName}`} />
            </div>
        </div>
    );
}
