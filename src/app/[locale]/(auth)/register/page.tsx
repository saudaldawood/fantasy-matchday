'use client';

import React, { useState } from 'react';
import styles from '../login/page.module.css';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/navigation';
import registerImg from '@/images/register.png';
import { registerWithEmail, signInWithGoogle } from '@/services/auth';

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const router = useRouter();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await registerWithEmail(formData.email, formData.password, formData.displayName);
            router.push('/'); // Redirect to home after registration
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            router.push('/');
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
                    <h1 className={styles.title}>{t('hello')}</h1>
                    <p className={styles.subtitle}>{t('signUpToGetStarted')}</p>

                    {error && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                name="displayName"
                                placeholder={t('fullName')}
                                className={styles.input}
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                placeholder={t('emailAddress')}
                                className={styles.input}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                name="password"
                                placeholder={t('password')}
                                className={styles.input}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder={t('confirmPassword')}
                                className={styles.input}
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                    {t('creatingAccount')}
                                </>
                            ) : (
                                t('register')
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
                        {t('hasAccount')} <Link href="/login" className={styles.link}>{t('loginButton')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
