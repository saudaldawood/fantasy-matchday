// API-Football Response Types
// Reference: https://www.api-football.com/documentation-v3

export interface APIResponse<T> {
    get: string;
    parameters: Record<string, any>;
    errors: Record<string, any>;
    results: number;
    paging: {
        current: number;
        total: number;
    };
    response: T[];
}

// Squad Player (from /players/squads endpoint)
export interface APISquadPlayer {
    id: number;
    name: string;
    age: number;
    number: number | null;
    position: string;
    photo: string;
}

// Fixture (Match) Types
export interface APIFixture {
    fixture: {
        id: number;
        referee: string | null;
        timezone: string;
        date: string;
        timestamp: number;
        periods: {
            first: number | null;
            second: number | null;
        };
        venue: {
            id: number | null;
            name: string;
            city: string;
        };
        status: {
            long: string;
            short: string;
            elapsed: number | null;
        };
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        flag: string;
        season: number;
        round: string;
    };
    teams: {
        home: APITeam;
        away: APITeam;
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    score: {
        halftime: { home: number | null; away: number | null };
        fulltime: { home: number | null; away: number | null };
        extratime: { home: number | null; away: number | null };
        penalty: { home: number | null; away: number | null };
    };
}

export interface APITeam {
    id: number;
    name: string;
    logo: string;
    winner: boolean | null;
}

// Player Types
export interface APIPlayer {
    player: {
        id: number;
        name: string;
        firstname: string;
        lastname: string;
        age: number;
        birth: {
            date: string;
            place: string | null;
            country: string;
        };
        nationality: string;
        height: string | null;
        weight: string | null;
        injured: boolean;
        photo: string;
    };
    statistics: Array<{
        team: APITeam;
        league: {
            id: number;
            name: string;
            country: string;
            logo: string;
            flag: string;
            season: number;
        };
        games: {
            appearences: number;
            lineups: number;
            minutes: number;
            number: number | null;
            position: string;
            rating: string | null;
            captain: boolean;
        };
        substitutes: {
            in: number;
            out: number;
            bench: number;
        };
        shots: {
            total: number | null;
            on: number | null;
        };
        goals: {
            total: number | null;
            conceded: number | null;
            assists: number | null;
            saves: number | null;
        };
        passes: {
            total: number | null;
            key: number | null;
            accuracy: number | null;
        };
        tackles: {
            total: number | null;
            blocks: number | null;
            interceptions: number | null;
        };
        duels: {
            total: number | null;
            won: number | null;
        };
        dribbles: {
            attempts: number | null;
            success: number | null;
            past: number | null;
        };
        fouls: {
            drawn: number | null;
            committed: number | null;
        };
        cards: {
            yellow: number;
            yellowred: number;
            red: number;
        };
        penalty: {
            won: number | null;
            commited: number | null;
            scored: number | null;
            missed: number | null;
            saved: number | null;
        };
    }>;
}

// Fixture Player Statistics (per match)
export interface APIFixturePlayer {
    team: APITeam;
    players: Array<{
        player: {
            id: number;
            name: string;
            photo: string;
        };
        statistics: Array<{
            games: {
                minutes: number | null;
                number: number;
                position: string;
                rating: string | null;
                captain: boolean;
                substitute: boolean;
            };
            offsides: number | null;
            shots: {
                total: number | null;
                on: number | null;
            };
            goals: {
                total: number | null;
                conceded: number | null;
                assists: number | null;
                saves: number | null;
            };
            passes: {
                total: number | null;
                key: number | null;
                accuracy: string | null;
            };
            tackles: {
                total: number | null;
                blocks: number | null;
                interceptions: number | null;
            };
            duels: {
                total: number | null;
                won: number | null;
            };
            dribbles: {
                attempts: number | null;
                success: number | null;
                past: number | null;
            };
            fouls: {
                drawn: number | null;
                committed: number | null;
            };
            cards: {
                yellow: number;
                red: number;
            };
            penalty: {
                won: number | null;
                commited: number | null;
                scored: number | null;
                missed: number | null;
                saved: number | null;
            };
        }>;
    }>;
}

// Match Events
export interface APIFixtureEvent {
    time: {
        elapsed: number;
        extra: number | null;
    };
    team: APITeam;
    player: {
        id: number;
        name: string;
    };
    assist: {
        id: number | null;
        name: string | null;
    };
    type: 'Goal' | 'Card' | 'subst' | 'Var';
    detail: string;
    comments: string | null;
}

// Team Information
export interface APITeamInfo {
    team: {
        id: number;
        name: string;
        code: string;
        country: string;
        founded: number;
        national: boolean;
        logo: string;
    };
    venue: {
        id: number;
        name: string;
        address: string;
        city: string;
        capacity: number;
        surface: string;
        image: string;
    };
}

// League Information
export interface APILeague {
    league: {
        id: number;
        name: string;
        type: string;
        logo: string;
    };
    country: {
        name: string;
        code: string | null;
        flag: string | null;
    };
    seasons: Array<{
        year: number;
        start: string;
        end: string;
        current: boolean;
        coverage: {
            fixtures: {
                events: boolean;
                lineups: boolean;
                statistics_fixtures: boolean;
                statistics_players: boolean;
            };
            standings: boolean;
            players: boolean;
            top_scorers: boolean;
            top_assists: boolean;
            top_cards: boolean;
            injuries: boolean;
            predictions: boolean;
            odds: boolean;
        };
    }>;
}

// Standings
export interface APIStanding {
    rank: number;
    team: APITeam;
    points: number;
    goalsDiff: number;
    group: string;
    form: string;
    status: string;
    description: string | null;
    all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
    };
    home: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
    };
    away: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
    };
    update: string;
}
