'use client';

/**
 * Friends Page
 * Manage friends, friend requests, and friends leaderboard
 */

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Users,
    UserPlus,
    Search,
    Check,
    X,
    Trophy,
    Clock,
    UserMinus,
    Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    getFriendsList,
    getPendingRequests,
    getSentRequests,
    acceptFriendRequest,
    declineFriendRequest,
    sendFriendRequest,
    removeFriend,
    searchUsers,
    getFriendsLeaderboard,
    Friend,
    FriendRequest,
    FriendComparison
} from '@/services/friends';
import styles from './page.module.css';

type Tab = 'friends' | 'requests' | 'find' | 'leaderboard';

export default function FriendsPage() {
    const t = useTranslations('Friends');
    const { user, profile } = useAuth();

    const [activeTab, setActiveTab] = useState<Tab>('friends');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<FriendComparison[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Load data based on active tab
    useEffect(() => {
        if (!user?.uid) return;

        const loadData = async () => {
            setLoading(true);
            try {
                switch (activeTab) {
                    case 'friends':
                        const friendsList = await getFriendsList(user.uid);
                        setFriends(friendsList);
                        break;
                    case 'requests':
                        const pending = await getPendingRequests(user.uid);
                        const sent = await getSentRequests(user.uid);
                        setPendingRequests(pending);
                        setSentRequests(sent);
                        break;
                    case 'leaderboard':
                        const lb = await getFriendsLeaderboard(user.uid);
                        setLeaderboard(lb);
                        break;
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
            setLoading(false);
        };

        loadData();
    }, [activeTab, user?.uid]);

    // Search users
    const handleSearch = async () => {
        if (!user?.uid || searchTerm.length < 2) return;

        setLoading(true);
        try {
            const results = await searchUsers(searchTerm, user.uid);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
        }
        setLoading(false);
    };

    // Handle friend request actions
    const handleAccept = async (requestId: string) => {
        setActionLoading(requestId);
        const result = await acceptFriendRequest(requestId);
        if (result.success) {
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        }
        setActionLoading(null);
    };

    const handleDecline = async (requestId: string) => {
        setActionLoading(requestId);
        const result = await declineFriendRequest(requestId);
        if (result.success) {
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        }
        setActionLoading(null);
    };

    const handleSendRequest = async (receiverId: string) => {
        if (!user?.uid || !profile) return;

        setActionLoading(receiverId);
        const result = await sendFriendRequest(
            user.uid,
            profile.displayName || 'User',
            profile.avatarUrl,
            receiverId
        );
        if (result.success) {
            setSearchResults(prev => prev.filter(u => u.id !== receiverId));
        }
        setActionLoading(null);
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!user?.uid) return;

        setActionLoading(friendId);
        const result = await removeFriend(user.uid, friendId);
        if (result.success) {
            setFriends(prev => prev.filter(f => f.id !== friendId));
        }
        setActionLoading(null);
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.notLoggedIn}>
                    <Users size={48} />
                    <h2>Please log in to view friends</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <Users size={28} />
                    Friends
                </h1>
                <p className={styles.subtitle}>
                    Connect with other players and compete together
                </p>
            </header>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    <Users size={18} />
                    My Friends ({friends.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    <UserPlus size={18} />
                    Requests
                    {pendingRequests.length > 0 && (
                        <span className={styles.badge}>{pendingRequests.length}</span>
                    )}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'find' ? styles.active : ''}`}
                    onClick={() => setActiveTab('find')}
                >
                    <Search size={18} />
                    Find Friends
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.active : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    <Trophy size={18} />
                    Leaderboard
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* Friends List */}
                        {activeTab === 'friends' && (
                            <div className={styles.friendsList}>
                                {friends.length === 0 ? (
                                    <div className={styles.empty}>
                                        <Users size={48} />
                                        <h3>No friends yet</h3>
                                        <p>Find other players and send friend requests!</p>
                                        <button
                                            className={styles.primaryButton}
                                            onClick={() => setActiveTab('find')}
                                        >
                                            Find Friends
                                        </button>
                                    </div>
                                ) : (
                                    friends.map(friend => (
                                        <div key={friend.id} className={styles.friendCard}>
                                            <div className={styles.avatar}>
                                                {friend.avatarUrl ? (
                                                    <img src={friend.avatarUrl} alt={friend.odisplayName} />
                                                ) : (
                                                    friend.odisplayName[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className={styles.friendInfo}>
                                                <h4>{friend.odisplayName}</h4>
                                                <p>{friend.totalPoints} total points</p>
                                            </div>
                                            <div className={styles.friendActions}>
                                                <button
                                                    className={styles.dangerButton}
                                                    onClick={() => handleRemoveFriend(friend.id)}
                                                    disabled={actionLoading === friend.id}
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Friend Requests */}
                        {activeTab === 'requests' && (
                            <div className={styles.requestsList}>
                                <h3>Pending Requests</h3>
                                {pendingRequests.length === 0 ? (
                                    <p className={styles.emptyText}>No pending requests</p>
                                ) : (
                                    pendingRequests.map(request => (
                                        <div key={request.id} className={styles.requestCard}>
                                            <div className={styles.avatar}>
                                                {request.senderAvatar ? (
                                                    <img src={request.senderAvatar} alt={request.senderName} />
                                                ) : (
                                                    request.senderName[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className={styles.requestInfo}>
                                                <h4>{request.senderName}</h4>
                                                <p><Clock size={12} /> Sent a friend request</p>
                                            </div>
                                            <div className={styles.requestActions}>
                                                <button
                                                    className={styles.acceptButton}
                                                    onClick={() => handleAccept(request.id)}
                                                    disabled={actionLoading === request.id}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className={styles.declineButton}
                                                    onClick={() => handleDecline(request.id)}
                                                    disabled={actionLoading === request.id}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <h3 style={{ marginTop: '2rem' }}>Sent Requests</h3>
                                {sentRequests.length === 0 ? (
                                    <p className={styles.emptyText}>No sent requests</p>
                                ) : (
                                    sentRequests.map(request => (
                                        <div key={request.id} className={styles.requestCard}>
                                            <div className={styles.avatar}>
                                                {request.receiverAvatar ? (
                                                    <img src={request.receiverAvatar} alt={request.receiverName} />
                                                ) : (
                                                    request.receiverName[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className={styles.requestInfo}>
                                                <h4>{request.receiverName}</h4>
                                                <p>Pending...</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Find Friends */}
                        {activeTab === 'find' && (
                            <div className={styles.findSection}>
                                <div className={styles.searchBox}>
                                    <input
                                        type="text"
                                        placeholder="Search by username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className={styles.searchInput}
                                    />
                                    <button
                                        className={styles.searchButton}
                                        onClick={handleSearch}
                                    >
                                        <Search size={20} />
                                    </button>
                                </div>

                                <div className={styles.searchResults}>
                                    {searchResults.length === 0 ? (
                                        <p className={styles.emptyText}>
                                            Search for users to add as friends
                                        </p>
                                    ) : (
                                        searchResults.map(user => (
                                            <div key={user.id} className={styles.userCard}>
                                                <div className={styles.avatar}>
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.displayName} />
                                                    ) : (
                                                        user.displayName[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <h4>{user.displayName}</h4>
                                                </div>
                                                <button
                                                    className={styles.sendRequestButton}
                                                    onClick={() => handleSendRequest(user.id)}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    <Send size={16} />
                                                    Add Friend
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Friends Leaderboard */}
                        {activeTab === 'leaderboard' && (
                            <div className={styles.leaderboard}>
                                {leaderboard.length === 0 ? (
                                    <div className={styles.empty}>
                                        <Trophy size={48} />
                                        <h3>No friends to compare</h3>
                                        <p>Add friends to see how you rank against them!</p>
                                    </div>
                                ) : (
                                    <div className={styles.leaderboardTable}>
                                        <div className={styles.tableHeader}>
                                            <div>Rank</div>
                                            <div>Friend</div>
                                            <div>Points</div>
                                        </div>
                                        {leaderboard.map((entry, index) => (
                                            <div key={index} className={styles.tableRow}>
                                                <div className={styles.rank}>
                                                    {index === 0 && '🥇'}
                                                    {index === 1 && '🥈'}
                                                    {index === 2 && '🥉'}
                                                    {index > 2 && index + 1}
                                                </div>
                                                <div className={styles.friendInfo}>
                                                    <div className={styles.smallAvatar}>
                                                        {entry.odisplayAvatarUrl ? (
                                                            <img src={entry.odisplayAvatarUrl} alt={entry.odisplayName} />
                                                        ) : (
                                                            entry.odisplayName[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <span>{entry.odisplayName}</span>
                                                </div>
                                                <div className={styles.points}>
                                                    {entry.totalPoints}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
