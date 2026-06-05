'use client';

import React, { useState } from 'react';
import styles from '../(auth)/login/page.module.css';
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import registerImg from '@/images/register.png';
import { resetPassword } from '@/services/auth';

export default function ResetPasswordPage() {
    const t = useTranslations('Auth');

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            {/* Left Side - Image */}
            <div className={styles.imageSection}>
                <Image
                    src={registerImg}
                    alt="Player"
                    className={styles.playerImage}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </div>

            {/* Right Side - Form */}
            <div className={styles.formSection}>
                <div className={styles.gradientOrb}></div>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>{t('resetPassword')}</h1>
                    <p className={styles.subtitle}>{t('resetPasswordSubtitle')}</p>

                    {error && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className={styles.successAlert}>
                            <CheckCircle size={18} />
                            <div>
                                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                                    {t('resetEmailSent')}
                                </p>
                                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                                    {t('checkEmailInbox')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    placeholder={t('emailAddress')}
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        {t('sendingEmail')}
                                    </>
                                ) : (
                                    t('sendResetLink')
                                )}
                            </button>
                        </form>
                    )}

                    <div className={styles.switchAuth}>
                        <Link href="/login" className={styles.link}>{t('backToLogin')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
