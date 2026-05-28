'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import styles from './help.module.css';
import { ChevronDown, Trophy, Users, Zap, Gift, HelpCircle, Mail } from 'lucide-react';

export default function HelpCenterPage() {
    const [openSection, setOpenSection] = useState<string | null>('getting-started');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Help <span className={styles.highlight}>Center</span>
                </h1>
                <p className={styles.subtitle}>Find answers to common questions and learn how to play</p>
            </div>

            <div className={styles.content}>
                {/* Quick Links */}
                <div className={styles.quickLinks}>
                    <Link href="/matches" className={styles.quickLink}>
                        <Trophy size={24} />
                        <span>Browse Matches</span>
                    </Link>
                    <Link href="/leagues" className={styles.quickLink}>
                        <Users size={24} />
                        <span>Join Leagues</span>
                    </Link>
                    <Link href="/achievements" className={styles.quickLink}>
                        <Gift size={24} />
                        <span>View Achievements</span>
                    </Link>
                </div>

                {/* FAQ Sections */}
                <div className={styles.faqSections}>
                    {/* Getting Started */}
                    <div className={styles.section}>
                        <button 
                            className={`${styles.sectionHeader} ${openSection === 'getting-started' ? styles.open : ''}`}
                            onClick={() => toggleSection('getting-started')}
                        >
                            <h2>Getting Started</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'getting-started' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>How do I create an account?</h3>
                                    <p>Click "Sign Up" in the navigation bar, enter your details, or sign in with Google for quick registration.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>How does Fantasy Matchday work?</h3>
                                    <p>Select a match, build a lineup from players in both teams, and earn points based on their real-world performance. Compete with other users on the leaderboard!</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>Is it free to play?</h3>
                                    <p>Yes! Fantasy Matchday is free to play. You can earn credits through gameplay or purchase them for power-ups and premium features.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Building Your Lineup */}
                    <div className={styles.section}>
                        <button 
                            className={`${styles.sectionHeader} ${openSection === 'lineup' ? styles.open : ''}`}
                            onClick={() => toggleSection('lineup')}
                        >
                            <h2>Building Your Lineup</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'lineup' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>How do I select players?</h3>
                                    <p>Go to Matches, select an upcoming match, then choose 11 starting players and 4 bench players from both teams playing in that match.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>What formations can I use?</h3>
                                    <p>You must select 1 GK, 3-5 DEF, 3-5 MID, and 1-3 FWD. Popular formations include 4-4-2, 4-3-3, and 3-5-2.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>When is the lineup deadline?</h3>
                                    <p>You must submit your lineup before the match kicks off. Once the match starts, lineups are locked and cannot be changed.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>What does the captain do?</h3>
                                    <p>Your captain earns 2x points! Choose wisely - pick a player you expect to perform well in the match.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>Can I save my lineup as a draft?</h3>
                                    <p>Yes! Click "Save Draft" to save your progress. You can return later to complete and submit your lineup.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scoring System */}
                    <div className={styles.section}>
                        <button 
                            className={`${styles.sectionHeader} ${openSection === 'scoring' ? styles.open : ''}`}
                            onClick={() => toggleSection('scoring')}
                        >
                            <h2>Scoring System</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'scoring' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>How are points calculated?</h3>
                                    <p><strong>Goalkeepers & Defenders:</strong> Clean sheet +4, Goal +6, Assist +3, Penalty save +5, 3+ saves +2<br/>
                                    <strong>Midfielders:</strong> Goal +5, Assist +3, Clean sheet +1<br/>
                                    <strong>Forwards:</strong> Goal +4, Assist +3<br/>
                                    <strong>All Positions:</strong> Man of the Match +3, Hat-trick +5, 60+ minutes played +2, Yellow card -1, Red card -3</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>When do points update?</h3>
                                    <p>Points update in real-time during live matches, typically every 2-3 minutes. Final points are locked after the match ends.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>Do bench players earn points?</h3>
                                    <p>Normally, no. However, if you use the "Bench Boost" power-up, your bench players will also earn points for that match.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leagues & Competition */}
                    <div className={styles.section}>
                        <button 
                            className={`${styles.sectionHeader} ${openSection === 'leagues' ? styles.open : ''}`}
                            onClick={() => toggleSection('leagues')}
                        >
                            <h2>Leagues & Competition</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'leagues' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>How do I join a private league?</h3>
                                    <p>Go to Leagues, click "Join by Code", and enter the invite code shared by the league creator.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>How do I create a league?</h3>
                                    <p>Click "Create League" on the Leagues page, set a name and privacy settings, then share the invite code with friends.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>What's the difference between public and private leagues?</h3>
                                    <p>Public leagues are open for anyone to join, while private leagues require an invite code. Both types compete for the same match points.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>How do leaderboards work?</h3>
                                    <p>Global leaderboards rank all users by total points. League leaderboards show rankings within your private leagues. Rankings update after each match.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Credits & Power-ups */}
                    <div className={styles.section}>
                        <button 
                            className={`${styles.sectionHeader} ${openSection === 'credits' ? styles.open : ''}`}
                            onClick={() => toggleSection('credits')}
                        >
                            <h2>Credits & Power-ups</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'credits' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>How do I earn credits?</h3>
                                    <p>Earn credits by: Daily login (+10), Playing matches (+20), Ranking rewards (50-500), Unlocking achievements (25-100), and Winning leagues (200-1000).</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>What are power-ups?</h3>
                                    <p>Power-ups are special boosts you can use on your lineup: Captain Boost (2x points), Triple Captain (3x points), Bench Boost (bench players score), and Wild Card (unlimited transfers).</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>Can I buy credits?</h3>
                                    <p>Yes! Visit the Credits page to purchase credit packages with bonus credits included.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Achievements */}
                    <div className={styles.section}>
                        <button 
                            className={`${styles.sectionHeader} ${openSection === 'achievements' ? styles.open : ''}`}
                            onClick={() => toggleSection('achievements')}
                        >
                            <h2>Achievements</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'achievements' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>What are achievements?</h3>
                                    <p>Achievements are special milestones you unlock by playing matches, earning points, and competing. Each achievement rewards you with credits!</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>How do I claim achievement rewards?</h3>
                                    <p>Go to the Achievements page, and click "Claim Reward" on any completed achievements to receive your credits.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Box */}
                <div className={styles.contactBox}>
                    <HelpCircle size={32} />
                    <h2>Still need help?</h2>
                    <p>Contact our support team and we'll get back to you within 24 hours</p>
                    <a href="mailto:support@fantasymatchday.com" className={styles.contactButton}>
                        <Mail size={18} />
                        support@fantasymatchday.com
                    </a>
                </div>
            </div>
        </div>
    );
}
