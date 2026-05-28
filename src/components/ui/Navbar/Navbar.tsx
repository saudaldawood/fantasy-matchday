"use client";

import React, { useState } from 'react';
import { Link } from '@/navigation';
import styles from './Navbar.module.css';
import { Button } from '../Button/Button';
import { Menu, X, User, LogOut, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/auth';

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const t = useTranslations('Navbar');
    const tUser = useTranslations('UserMenu');
    const { user, profile, loading } = useAuth();

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                FANTASY<span className="text-primary">MATCHDAY</span>
            </Link>

            <div className={styles.mobileMenuBtn} onClick={toggleMenu}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </div>

            <ul className={clsx(styles.navLinks, isMobileMenuOpen && styles.active)}>
                <li><Link href="/matches" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('matches')}</Link></li>
                <li><Link href="/lineup" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('lineup')}</Link></li>
                <li><Link href="/leaderboard" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('leaderboard')}</Link></li>
                <li><Link href="/credits" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{'Credits'}</Link></li>
                <li><Link href="/achievements" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('achievements')}</Link></li>
                <li><Link href="/friends" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('friends') || 'Friends'}</Link></li>
                <li><Link href="/help" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('help')}</Link></li>

                {!loading && user ? (
                    <>
                        {/* Notification Bell */}
                        <li className={styles.notificationBell}>
                            <button className={styles.bellButton}>
                                <Bell size={20} />
                            </button>
                        </li>

                        {/* User Menu */}
                        <li className={styles.userMenuContainer}>
                            <button
                                className={styles.userButton}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <div className={styles.userAvatar}>
                                    {profile?.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt={profile.displayName} />
                                    ) : (
                                        <span>{getInitials(profile?.displayName || user.displayName || user.email || 'U')}</span>
                                    )}
                                </div>
                                <span className={styles.userName}>{profile?.displayName || user.displayName || user.email?.split('@')[0] || 'User'}</span>
                            </button>
                            {isUserMenuOpen && (
                                <div className={styles.userDropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <span className={styles.dropdownName}>{profile?.displayName || user.displayName || 'User'}</span>
                                        <Link href="/credits" className={styles.dropdownCreditsLink} onClick={() => setIsMobileMenuOpen(false)}>
                                            <span className={styles.dropdownCredits}>💰 {profile?.credits || 0} {tUser('credits')}</span>
                                        </Link>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <User size={16} />
                                        {tUser('profile')}
                                    </Link>
                                    <div
                                        className={styles.dropdownItem}
                                        onClick={handleSignOut}
                                    >
                                        <LogOut size={16} />
                                        {tUser('signOut')}
                                    </div>
                                </div>
                            )}
                        </li>
                    </>
                ) : !loading ? (
                    <>
                        <li><Link href="/login" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>{t('login')}</Link></li>
                        <li>
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button size="sm" className={styles.signUpBtn}>{t('signUp')}</Button>
                            </Link>
                        </li>
                    </>
                ) : null}

                <li>
                    <LanguageSwitcher />
                </li>
            </ul>
        </nav>
    );
};
