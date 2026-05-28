'use client';

import React from 'react';
import styles from './Footer.module.css';
import { Mail, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export const Footer = () => {
    const t = useTranslations('Footer');

    return (
        <footer className={styles.footer}>
            {/* Main Footer Content */}
            <div className={styles.footerMain}>
                {/* Left Side - Newsletter */}
                <div className={styles.newsletter}>
                    <h4 className={styles.logo}>
                        FANTASY<span className={styles.logoHighlight}>MATCHDAY</span>
                    </h4>
                    <p className={styles.newsletterText}>
                        {t('newsletterText')}
                    </p>
                    <div className={styles.emailForm}>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.mailIcon} />
                            <input
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                className={styles.emailInput}
                            />
                        </div>
                        <button className={styles.subscribeBtn}>{t('subscribe')}</button>
                    </div>
                    <p className={styles.policyText}>
                        {t('policyText')} <a href="#" className={styles.policyLink}>{t('policy')}</a>
                    </p>
                </div>

                {/* Right Side - Navigation Columns */}
                <div className={styles.navColumns}>
                    <div className={styles.navColumn}>
                        <h5 className={styles.columnTitle}>{t('platform')}</h5>
                        <ul className={styles.navList}>
                            <li><Link href="/">{t('liveMatches')}</Link></li>
                            <li><Link href="/leagues">{t('leagues')}</Link></li>
                            <li><Link href="/players">{t('players')}</Link></li>
                            <li><Link href="/prizes">{t('prizes')}</Link></li>
                        </ul>
                    </div>

                    <div className={styles.navColumn}>
                        <h5 className={styles.columnTitle}>{t('support')}</h5>
                        <ul className={styles.navList}>
                            <li><Link href="/help">{t('helpCenter')}</Link></li>
                            <li><Link href="/contact">{t('contact')}</Link></li>
                            <li><Link href="/privacy">{t('privacyPolicy')}</Link></li>
                            <li><Link href="/terms">{t('terms')}</Link></li>
                        </ul>
                    </div>

                    <div className={styles.navColumn}>
                        <h5 className={styles.columnTitle}>{t('learnMore')}</h5>
                        <p className={styles.learnMoreText}>
                            {t('learnMoreText')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottomBar}>
                <h4 className={styles.logoSmall}>
                    FANTASY<span className={styles.logoHighlight}>MATCHDAY</span>
                </h4>

                <p className={styles.copyright}>
                    {t('copyright')}
                </p>

                <div className={styles.bottomLinks}>
                    <Link href="/terms">{t('terms')}</Link>
                    <Link href="/help">{t('accessibility')}</Link>
                    <Link href="/privacy">{t('privacyCookies')}</Link>
                </div>

                <div className={styles.socialLinks}>
                    <a href="#" className={styles.socialLink}><Facebook size={18} /></a>
                    <a href="#" className={styles.socialLink}><Instagram size={18} /></a>
                    <a href="#" className={styles.socialLink}><Youtube size={18} /></a>
                    <a href="#" className={styles.socialLink}><Twitter size={18} /></a>
                </div>
            </div>
        </footer>
    );
};
