import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { getLiveMatches, getUpcomingMatches } from '@/services/api-football';
import { getDraftPlayers } from '@/services/players';
import {
    getUserLineupForMatch,
    getMatchLineups,
    saveLineupDraft,
    submitLineup,
} from '@/services/lineups';
import type { APIFixture } from '@/types/api-football';
import type { DraftPlayer } from '@/services/players';
import type { Lineup, LineupEntry } from '@/types/app';

// Query Keys
export const queryKeys = {
    matches: {
        all: ['matches'] as const,
        live: () => [...queryKeys.matches.all, 'live'] as const,
        upcoming: () => [...queryKeys.matches.all, 'upcoming'] as const,
    },
    players: {
        all: ['players'] as const,
        byMatch: (matchId: number) => [...queryKeys.players.all, 'match', matchId] as const,
    },
    lineups: {
        all: ['lineups'] as const,
        byUser: (userId: string, matchId: string) => [...queryKeys.lineups.all, 'user', userId, matchId] as const,
        byMatch: (matchId: string) => [...queryKeys.lineups.all, 'match', matchId] as const,
    },
};

/**
 * Hook to fetch live matches
 */
export function useLiveMatches(options?: Omit<UseQueryOptions<APIFixture[], Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.matches.live(),
        queryFn: getLiveMatches,
        // Refetch every 2 minutes for live matches
        refetchInterval: 2 * 60 * 1000,
        staleTime: 1 * 60 * 1000, // 1 minute
        ...options,
    });
}

/**
 * Hook to fetch upcoming matches
 */
export function useUpcomingMatches(options?: Omit<UseQueryOptions<APIFixture[], Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: queryKeys.matches.upcoming(),
        queryFn: getUpcomingMatches,
        // Cache for 5 minutes
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

/**
 * Hook to fetch players for a match
 */
export function useMatchPlayers(
    matchId: number | null,
    options?: Omit<UseQueryOptions<DraftPlayer[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.players.byMatch(matchId || 0),
        queryFn: () => {
            if (!matchId) throw new Error('Match ID is required');
            return getDraftPlayers(matchId);
        },
        enabled: !!matchId,
        // Cache players for 10 minutes
        staleTime: 10 * 60 * 1000,
        ...options,
    });
}

/**
 * Hook to fetch user's lineup for a match
 */
export function useUserLineup(
    userId: string | undefined,
    matchId: string | null,
    options?: Omit<UseQueryOptions<Partial<Lineup> | null, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.lineups.byUser(userId || '', matchId || ''),
        queryFn: () => {
            if (!userId || !matchId) return null;
            return getUserLineupForMatch(userId, matchId);
        },
        enabled: !!userId && !!matchId,
        // Cache lineup for 1 minute
        staleTime: 1 * 60 * 1000,
        ...options,
    });
}

/**
 * Hook to fetch match leaderboard
 */
export function useMatchLeaderboard(
    matchId: string | null,
    limitCount: number = 100,
    options?: Omit<UseQueryOptions<Lineup[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: [...queryKeys.lineups.byMatch(matchId || ''), limitCount],
        queryFn: () => {
            if (!matchId) throw new Error('Match ID is required');
            return getMatchLineups(matchId, limitCount);
        },
        enabled: !!matchId,
        // Refetch every 5 minutes for live leaderboard
        refetchInterval: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
        ...options,
    });
}

/**
 * Mutation to save lineup draft
 */
export function useSaveLineupDraft(
    options?: UseMutationOptions<
        string,
        Error,
        {
            userId: string;
            matchId: string;
            entries: LineupEntry[];
            formation: string;
            captainPlayerId: string | null;
        }
    >
) {
    return useMutation({
        mutationFn: async ({ userId, matchId, entries, formation, captainPlayerId }) => {
            return await saveLineupDraft(userId, matchId, entries, formation, captainPlayerId);
        },
        ...options,
    });
}

/**
 * Mutation to submit lineup
 */
export function useSubmitLineup(
    options?: UseMutationOptions<void, Error, string>
) {
    return useMutation({
        mutationFn: async (lineupId: string) => {
            return await submitLineup(lineupId);
        },
        ...options,
    });
}
