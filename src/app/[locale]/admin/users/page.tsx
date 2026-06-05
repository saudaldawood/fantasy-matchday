'use client';

import { useEffect, useState } from 'react';
import { getUsers, updateUserStatus, AdminUser } from '@/services/admin';
import styles from './page.module.css';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [statusFilter]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const filter = statusFilter === 'all' ? undefined : statusFilter;
            const result = await getUsers(50, undefined, searchTerm, filter);
            setUsers(result.users);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(userId: string, newStatus: 'active' | 'suspended' | 'banned') {
        setActionLoading(true);
        try {
            const result = await updateUserStatus(userId, newStatus);
            if (result.success) {
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, status: newStatus } : u
                ));
                setSelectedUser(null);
            } else {
                alert(result.error || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        fetchUsers();
    }

    function formatDate(timestamp: unknown): string {
        if (!timestamp) return 'N/A';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as string);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>User Management</h1>
                <p className={styles.subtitle}>View and manage all registered users</p>
            </header>

            <div className={styles.controls}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        Search
                    </button>
                </form>

                <div className={styles.filters}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading users...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Credits</th>
                                <th>Points</th>
                                <th>Rank</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={user.status !== 'active' ? styles.inactiveRow : ''}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.displayName} />
                                                ) : (
                                                    <span>{user.displayName?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <span className={styles.userName}>
                                                {user.displayName || 'Anonymous'}
                                                {user.isAdmin && <span className={styles.adminBadge}>Admin</span>}
                                                {user.isPremium && <span className={styles.premiumBadge}>Premium</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{user.credits?.toLocaleString() || 0}</td>
                                    <td>{user.totalPoints?.toLocaleString() || 0}</td>
                                    <td>#{user.globalRank || '-'}</td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className={styles.actionButton}
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className={styles.emptyState}>
                            No users found matching your criteria.
                        </div>
                    )}
                </div>
            )}

            {/* User Action Modal */}
            {selectedUser && (
                <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Manage User</h2>
                        <div className={styles.modalUserInfo}>
                            <p><strong>Name:</strong> {selectedUser.displayName}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Current Status:</strong> {selectedUser.status}</p>
                        </div>
                        <div className={styles.modalActions}>
                            {selectedUser.status !== 'active' && (
                                <button
                                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                                    className={styles.activateButton}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Activate User'}
                                </button>
                            )}
                            {selectedUser.status !== 'suspended' && (
                                <button
                                    onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                                    className={styles.suspendButton}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Suspend User'}
                                </button>
                            )}
                            {selectedUser.status !== 'banned' && (
                                <button
                                    onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                                    className={styles.banButton}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Ban User'}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedUser(null)}
                            className={styles.closeButton}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
