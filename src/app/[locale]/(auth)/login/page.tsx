'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/navigation';
import registerImg from '@/images/register.png';
import { signInWithEmail, signInWithGoogle } from '@/services/auth';

export default function LoginPage() {
    const t = useTranslations('Auth');
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmail(email, password);
            router.push('/'); // Redirect to home after login
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            router.push('/'); // Redirect to home after login
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
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
                    <h1 className={styles.title}>{t('welcomeBack')}</h1>
                    <p className={styles.subtitle}>{t('loginSubtitle')}</p>

                    {error && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

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

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder={t('password')}
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Link href="/reset-password" className={styles.forgotPassword}>
                            {t('forgotPassword')}
                        </Link>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className={styles.spinner} />
                                    {t('signingIn')}
                                </>
                            ) : (
                                t('loginButton')
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>{t('orContinueWith')}</span>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className={styles.googleBtn}
                        disabled={loading}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" />
                        </svg>
                        {t('continueWithGoogle')}
                    </button>

                    <div className={styles.switchAuth}>
                        {t('noAccount')} <Link href="/register" className={styles.link}>{t('signUpButton')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
