import React from 'react';
import styles from './LeaderboardTable.module.css';
import { useTranslations } from 'next-intl';

interface LeaderboardEntry {
    rank: number;
    username: string;
    points: number;
    change: 'up' | 'down' | 'same';
    changeValue?: number;
}

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
    const t = useTranslations('Leaderboard');

    return (
        <div className="overflow-x-auto">
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{t('rank')}</th>
                        <th>{t('user')}</th>
                        <th>{t('points')}</th>
                        <th>{t('change')}</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.rank}>
                            <td className="font-bold">#{entry.rank}</td>
                            <td>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs">
                                        {entry.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    {entry.username}
                                </div>
                            </td>
                            <td className="text-primary font-bold">{entry.points}</td>
                            <td>
                                {entry.change === 'up' && <span className="text-green-500">↑ {entry.changeValue}</span>}
                                {entry.change === 'down' && <span className="text-red-500">↓ {entry.changeValue}</span>}
                                {entry.change === 'same' && <span className="text-gray-500">-</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
