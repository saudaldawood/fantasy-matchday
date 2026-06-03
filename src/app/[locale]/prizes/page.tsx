import styles from './prizes.module.css';
import { getTranslations } from 'next-intl/server';

export default async function PrizesPage() {
    const t = await getTranslations('Prizes');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Amazing <span className={styles.highlight}>Prizes</span> Await
                </h1>
                <p className={styles.subtitle}>
                    Win big every week and throughout the season
                </p>
            </div>

            <div className={styles.prizesGrid}>
                <div className={styles.prizeCard}>
                    <div className={styles.prizeIcon}>💰</div>
                    <h3 className={styles.prizeTitle}>{t('weeklyCash.title')}</h3>
                    <div className={styles.prizeValue}>{t('weeklyCash.value')}</div>
                    <p className={styles.prizeDesc}>Top performers each week</p>
                </div>

                <div className={styles.prizeCard}>
                    <div className={styles.prizeIcon}>🎫</div>
                    <h3 className={styles.prizeTitle}>{t('matchTickets.title')}</h3>
                    <div className={styles.prizeValue}>{t('matchTickets.value')}</div>
                    <p className={styles.prizeDesc}>Watch your favorite teams live</p>
                </div>

                <div className={styles.prizeCard}>
                    <div className={styles.prizeIcon}>👕</div>
                    <h3 className={styles.prizeTitle}>{t('jerseys.title')}</h3>
                    <div className={styles.prizeValue}>{t('jerseys.value')}</div>
                    <p className={styles.prizeDesc}>Authentic signed memorabilia</p>
                </div>

                <div className={`${styles.prizeCard} ${styles.grandPrize}`}>
                    <div className={styles.prizeIcon}>🏆</div>
                    <h3 className={styles.prizeTitle}>{t('seasonPrize.title')}</h3>
                    <div className={styles.prizeValue}>{t('seasonPrize.value')}</div>
                    <p className={styles.prizeDesc}>Grand prize for season winner</p>
                </div>
            </div>

            <div className={styles.howToWin}>
                <h2>How to Win</h2>
                <div className={styles.stepsList}>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>1</span>
                        <div>
                            <h4>Build Your Team</h4>
                            <p>Select the best players for each match</p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>2</span>
                        <div>
                            <h4>Earn Points</h4>
                            <p>Players score based on real match performance</p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>3</span>
                        <div>
                            <h4>Climb the Leaderboard</h4>
                            <p>Compete against thousands of fans</p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <span className={styles.stepNumber}>4</span>
                        <div>
                            <h4>Win Prizes</h4>
                            <p>Top performers claim amazing rewards</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
