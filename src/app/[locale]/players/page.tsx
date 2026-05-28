import styles from './players.module.css';
import { getTranslations } from 'next-intl/server';

export default async function PlayersPage() {
    const t = await getTranslations();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Player <span className={styles.highlight}>Statistics</span>
                </h1>
                <p className={styles.subtitle}>
                    Discover top performers and player stats from the Saudi Pro League
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.comingSoon}>
                    <div className={styles.iconLarge}>⚽</div>
                    <h2>Player Stats Coming Soon!</h2>
                    <p>We're building a comprehensive player database with:</p>
                    <ul className={styles.featureList}>
                        <li>📊 Detailed season statistics</li>
                        <li>🎯 Performance ratings</li>
                        <li>📈 Form and trends</li>
                        <li>🏆 Historical data</li>
                        <li>⚡ Real-time updates</li>
                    </ul>
                    <p className={styles.note}>Check back soon for the full player stats experience!</p>
                </div>
            </div>
        </div>
    );
}
