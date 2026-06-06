'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
    getUserLeagues,
    searchPublicLeagues,
    joinLeagueByCode,
    createLeague,
    type League
} from '@/services/leagues';
import styles from './page.module.css';
import { Users, Plus, Search, Trophy, Lock, Globe, ChevronRight, Copy, Check } from 'lucide-react';
import { Link } from '@/navigation';

export default function LeaguesPage() {
    const locale = useLocale();
    const { user } = useAuth();
    const isArabic = locale === 'ar';

    const [myLeagues, setMyLeagues] = useState<League[]>([]);
    const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        type: 'private' as 'public' | 'private',
        maxMembers: 50,
    });

    useEffect(() => {
        async function fetchLeagues() {
            if (!user) return;

            try {
                const [userLeagues, discoverable] = await Promise.all([
                    getUserLeagues(user.uid),
                    searchPublicLeagues()
                ]);
                setMyLeagues(userLeagues);
                setPublicLeagues(discoverable);
            } catch (error) {
                console.error('Error fetching leagues:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeagues();
    }, [user]);

    const handleJoinByCode = async () => {
        if (!user || !joinCode.trim()) return;

        setJoining(true);
        setError('');

        try {
            const result = await joinLeagueByCode(
                user.uid,
                user.displayName || 'User',
                user.photoURL || undefined,
                joinCode.trim().toUpperCase()
            );
            if (result.success) {
                const leagues = await getUserLeagues(user.uid);
                setMyLeagues(leagues);
                setShowJoinModal(false);
                setJoinCode('');
            } else {
                setError(result.error || 'Failed to join league');
            }
        } catch (err) {
            setError('Failed to join league');
        } finally {
            setJoining(false);
        }
    };

    const handleCreate = async () => {
        if (!user || !createForm.name.trim()) return;

        setCreating(true);
        setError('');

        try {
            const result = await createLeague(
                user.uid,
                user.displayName || 'User',
                {
                    name: createForm.name,
                    nameAr: createForm.nameAr || createForm.name,
                    description: createForm.description,
                    descriptionAr: createForm.descriptionAr || createForm.description,
                    type: createForm.type,
                    scope: 'all_matches',
                    maxMembers: createForm.maxMembers,
                }
            );

            if (result.id) {
                const leagues = await getUserLeagues(user.uid);
                setMyLeagues(leagues);
                setShowCreateModal(false);
                setCreateForm({ name: '', nameAr: '', description: '', descriptionAr: '', type: 'private', maxMembers: 50 });
            }
        } catch (err) {
            setError('Failed to create league');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinPublic = async (leagueId: string, inviteCode: string) => {
        if (!user) return;
        try {
            const result = await joinLeagueByCode(
                user.uid,
                user.displayName || 'User',
                user.photoURL || undefined,
                inviteCode
            );
            if (result.success) {
                const leagues = await getUserLeagues(user.uid);
                setMyLeagues(leagues);
                setPublicLeagues(prev => prev.filter(l => l.id !== leagueId));
                setActiveTab('my');
            }
        } catch (error) {
            console.error('Error joining league:', error);
        }
    };

    const copyInviteCode = (code: string, leagueId: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(leagueId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredPublicLeagues = publicLeagues.filter(league =>
        league.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loading}>
                    <Users size={40} />
                    <p>{isArabic ? 'جاري التحميل...' : 'Loading leagues...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1>{isArabic ? 'الدوريات' : 'Leagues'}</h1>
                        <p className={styles.subtitle}>
                            {isArabic ? 'انضم للدوريات وتنافس مع الأصدقاء' : 'Join leagues and compete with friends'}
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={() => setShowJoinModal(true)} className={styles.joinBtn}>
                            <Search size={18} />
                            {isArabic ? 'انضمام برمز' : 'Join by Code'}
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className={styles.createBtn}>
                            <Plus size={18} />
                            {isArabic ? 'إنشاء دوري' : 'Create League'}
                        </button>
                    </div>
                </header>

                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'my' ? styles.active : ''}`} onClick={() => setActiveTab('my')}>
                        <Users size={16} /> {isArabic ? 'دورياتي' : 'My Leagues'} <span className={styles.count}>{myLeagues.length}</span>
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'discover' ? styles.active : ''}`} onClick={() => setActiveTab('discover')}>
                        <Globe size={16} /> {isArabic ? 'اكتشف' : 'Discover'}
                    </button>
                </div>

                {activeTab === 'my' ? (
                    <div className={styles.leaguesList}>
                        {myLeagues.length === 0 ? (
                            <div className={styles.empty}>
                                <Users size={48} />
                                <h3>{isArabic ? 'لا توجد دوريات' : 'No leagues yet'}</h3>
                                <p>{isArabic ? 'انضم لدوري أو أنشئ دوري جديد' : 'Join a league or create your own'}</p>
                            </div>
                        ) : (
                            myLeagues.map(league => (
                                <Link key={league.id} href={`/leagues/${league.id}`} className={styles.leagueCard}>
                                    <div className={styles.leagueIcon}>{league.type === 'private' ? <Lock size={20} /> : <Globe size={20} />}</div>
                                    <div className={styles.leagueInfo}>
                                        <h3>{isArabic ? league.nameAr : league.name}</h3>
                                        <p className={styles.leagueMeta}><Users size={14} /> {league.memberCount}/{league.maxMembers}</p>
                                    </div>
                                    {league.inviteCode && (
                                        <button className={styles.copyBtn} onClick={(e) => { e.preventDefault(); copyInviteCode(league.inviteCode!, league.id); }}>
                                            {copiedId === league.id ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    )}
                                    <ChevronRight size={20} className={styles.chevron} />
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    <div className={styles.discover}>
                        <div className={styles.searchBar}>
                            <Search size={18} />
                            <input type="text" placeholder={isArabic ? 'ابحث عن دوري...' : 'Search leagues...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className={styles.leaguesList}>
                            {filteredPublicLeagues.length === 0 ? (
                                <div className={styles.empty}><Globe size={48} /><h3>{isArabic ? 'لا توجد دوريات عامة' : 'No public leagues found'}</h3></div>
                            ) : (
                                filteredPublicLeagues.map(league => (
                                    <div key={league.id} className={styles.leagueCard}>
                                        <div className={styles.leagueIcon}><Trophy size={20} /></div>
                                        <div className={styles.leagueInfo}>
                                            <h3>{isArabic ? league.nameAr : league.name}</h3>
                                            <p className={styles.leagueMeta}><Users size={14} /> {league.memberCount}/{league.maxMembers}</p>
                                        </div>
                                        <button className={styles.joinLeagueBtn} onClick={() => handleJoinPublic(league.id, league.inviteCode!)}>{isArabic ? 'انضمام' : 'Join'}</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showJoinModal && (
                <div className={styles.modalOverlay} onClick={() => setShowJoinModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>{isArabic ? 'انضمام برمز الدعوة' : 'Join by Invite Code'}</h2>
                        <input type="text" placeholder={isArabic ? 'رمز الدعوة' : 'Invite code'} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className={styles.codeInput} maxLength={8} />
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowJoinModal(false)} className={styles.cancelBtn}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
                            <button onClick={handleJoinByCode} disabled={joining || !joinCode.trim()} className={styles.confirmBtn}>{joining ? '...' : (isArabic ? 'انضمام' : 'Join')}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>{isArabic ? 'إنشاء دوري جديد' : 'Create New League'}</h2>
                        <div className={styles.formGroup}>
                            <label>{isArabic ? 'اسم الدوري' : 'League Name'}</label>
                            <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="My League" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{isArabic ? 'الوصف' : 'Description'}</label>
                            <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>{isArabic ? 'النوع' : 'Type'}</label>
                                <select value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as 'public' | 'private' })}>
                                    <option value="private">{isArabic ? 'خاص' : 'Private'}</option>
                                    <option value="public">{isArabic ? 'عام' : 'Public'}</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>{isArabic ? 'الحد الأقصى' : 'Max'}</label>
                                <select value={createForm.maxMembers} onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}>
                                    <option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowCreateModal(false)} className={styles.cancelBtn}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
                            <button onClick={handleCreate} disabled={creating || !createForm.name.trim()} className={styles.confirmBtn}>{creating ? '...' : (isArabic ? 'إنشاء' : 'Create')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
