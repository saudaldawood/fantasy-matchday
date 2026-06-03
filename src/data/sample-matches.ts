import type { Match } from '@/types/app';

/**
 * Sample matches for testing when real matches are not available
 * (e.g., during league breaks, off-season)
 */
export const SAMPLE_MATCHES: Match[] = [
    {
        id: '999001',
        homeTeam: {
            id: '2939',
            name: 'Al-Hilal',
            nameAr: 'الهلال',
            logo: 'https://media.api-sports.io/football/teams/2939.png',
            shortName: 'HIL',
        },
        awayTeam: {
            id: '2933',
            name: 'Al-Nassr',
            nameAr: 'النصر',
            logo: 'https://media.api-sports.io/football/teams/2933.png',
            shortName: 'NAS',
        },
        venue: 'King Fahd International Stadium',
        matchDate: getDateInFuture(2), // 2 days from now
        round: 18,
        season: '2024',
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        lineupDeadline: getDateInFuture(2),
        totalParticipants: 0,
        isActive: true,
    },
    {
        id: '999002',
        homeTeam: {
            id: '2934',
            name: 'Al-Ittihad',
            nameAr: 'الاتحاد',
            logo: 'https://media.api-sports.io/football/teams/2934.png',
            shortName: 'ITT',
        },
        awayTeam: {
            id: '2935',
            name: 'Al-Ahli',
            nameAr: 'الأهلي',
            logo: 'https://media.api-sports.io/football/teams/2935.png',
            shortName: 'AHL',
        },
        venue: 'King Abdullah Sports City',
        matchDate: getDateInFuture(3),
        round: 18,
        season: '2024',
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        lineupDeadline: getDateInFuture(3),
        totalParticipants: 0,
        isActive: true,
    },
    {
        id: '999003',
        homeTeam: {
            id: '2948',
            name: 'Al-Shabab',
            nameAr: 'الشباب',
            logo: 'https://media.api-sports.io/football/teams/2948.png',
            shortName: 'SHA',
        },
        awayTeam: {
            id: '2936',
            name: 'Al-Taawoun',
            nameAr: 'التعاون',
            logo: 'https://media.api-sports.io/football/teams/2936.png',
            shortName: 'TAA',
        },
        venue: 'Prince Faisal bin Fahd Stadium',
        matchDate: getDateInFuture(4),
        round: 18,
        season: '2024',
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        lineupDeadline: getDateInFuture(4),
        totalParticipants: 0,
        isActive: true,
    },
];

function getDateInFuture(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(20, 0, 0, 0); // 8 PM
    return date;
}
