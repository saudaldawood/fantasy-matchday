import styles from "./page.module.css";
import { Hero } from "@/components/features/Hero/Hero";
import { GameChanger } from "@/components/features/GameChanger/GameChanger";
import { WhyChoose } from "@/components/features/WhyChoose/WhyChoose";
import { AmazingPrizes } from "@/components/features/AmazingPrizes/AmazingPrizes";
import { ReadyToWin } from "@/components/features/ReadyToWin/ReadyToWin";
import { MatchCard } from "@/components/features/MatchCard/MatchCard";
import { getTranslations } from 'next-intl/server';
import { getLiveMatches, getUpcomingMatches } from '@/services/api-football';
import { transformMatch } from '@/utils/api-transform';
import { formatMatchDate, formatMatchTime } from '@/utils/api-transform';

export default async function Home() {
  const t = await getTranslations();

  // Fetch real matches from API-Football
  let liveMatches: any[] = [];
  let upcomingMatches: any[] = [];

  try {
    // Get live matches
    const liveFixtures = await getLiveMatches();
    liveMatches = liveFixtures.map(transformMatch);
  } catch (error) {
    console.error('Error fetching live matches:', error);
  }

  try {
    // Get upcoming matches (next 7 days)
    const upcomingFixtures = await getUpcomingMatches();
    upcomingMatches = upcomingFixtures
      .map(transformMatch)
      .filter(m => m.status === 'scheduled')
      .slice(0, 3); // Show max 3 upcoming matches

    // If no upcoming matches, use sample data for testing
    if (upcomingMatches.length === 0) {
      const { SAMPLE_MATCHES } = await import('@/data/sample-matches');
      upcomingMatches = SAMPLE_MATCHES.slice(0, 3);
      console.log('No real matches found, using sample data');
    }
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    // Use sample matches as fallback
    const { SAMPLE_MATCHES } = await import('@/data/sample-matches');
    upcomingMatches = SAMPLE_MATCHES.slice(0, 3);
  }

  return (
    <div className={styles.container}>
      <Hero />

      <GameChanger />

      <WhyChoose />

      <section className={styles.matchesSection}>
        {/* LIVE Matches */}
        {liveMatches.length > 0 && (
          <>
            <div className={styles.matchesHeader}>
              <h2 className={styles.matchesTitle}>
                {t('Matches.liveMatchesTitle')}
              </h2>
            </div>
            <div className={styles.matchesGrid} style={{ marginBottom: '4rem' }}>
              {liveMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  fixtureId={parseInt(match.id)}
                  homeTeam={{
                    name: match.homeTeam.name,
                    logo: match.homeTeam.logo
                  }}
                  awayTeam={{
                    name: match.awayTeam.name,
                    logo: match.awayTeam.logo
                  }}
                  date={formatMatchDate(match.matchDate)}
                  time={match.currentMinute ? `${match.currentMinute}'` : 'LIVE'}
                  venue={match.venue}
                  status="live"
                  variant="green"
                />
              ))}
            </div>
          </>
        )}

        {/* UPCOMING Matches */}
        <div className={styles.matchesHeader}>
          <h2 className={styles.matchesTitle}>
            {t('Matches.upcomingMatchesTitlePrefix')} <span className="text-primary">{t('Matches.upcomingMatchesTitleHighlight')}</span>
          </h2>
        </div>
        <div className={styles.matchesGrid}>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                fixtureId={parseInt(match.id)}
                homeTeam={{
                  name: match.homeTeam.name,
                  logo: match.homeTeam.logo
                }}
                awayTeam={{
                  name: match.awayTeam.name,
                  logo: match.awayTeam.logo
                }}
                date={formatMatchDate(match.matchDate)}
                time={formatMatchTime(match.matchDate)}
                venue={match.venue}
                status="scheduled"
                variant="dark"
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              No upcoming matches at the moment
            </div>
          )}
        </div>
      </section>

      <AmazingPrizes />

      <ReadyToWin />
    </div>
  );
}
