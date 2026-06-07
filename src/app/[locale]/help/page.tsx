'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import styles from './help.module.css';
import { ChevronDown, Trophy, Users, Zap, Gift, HelpCircle, Mail } from 'lucide-react';

export default function HelpCenterPage() {
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const [openSection, setOpenSection] = useState<string | null>('getting-started');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {isArabic ? 'مركز' : 'Help'} <span className={styles.highlight}>{isArabic ? 'المساعدة' : 'Center'}</span>
                </h1>
                <p className={styles.subtitle}>{isArabic ? 'اعثر على إجابات للأسئلة الشائعة وتعلّم كيفية اللعب' : 'Find answers to common questions and learn how to play'}</p>
            </div>

            <div className={styles.content}>
                {/* Quick Links */}
                <div className={styles.quickLinks}>
                    <Link href="/matches" className={styles.quickLink}>
                        <Trophy size={24} />
                        <span>{isArabic ? 'تصفّح المباريات' : 'Browse Matches'}</span>
                    </Link>
                    <Link href="/leagues" className={styles.quickLink}>
                        <Users size={24} />
                        <span>{isArabic ? 'انضم إلى الدوريات' : 'Join Leagues'}</span>
                    </Link>
                    <Link href="/achievements" className={styles.quickLink}>
                        <Gift size={24} />
                        <span>{isArabic ? 'عرض الإنجازات' : 'View Achievements'}</span>
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
                            <h2>{isArabic ? 'كيف تبدأ' : 'Getting Started'}</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'getting-started' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف أنشئ حسابًا؟' : 'How do I create an account?'}</h3>
                                    <p>{isArabic ? 'اضغط على «إنشاء حساب» في شريط التنقل، وأدخل بياناتك، أو سجّل الدخول عبر Google للتسجيل السريع.' : 'Click "Sign Up" in the navigation bar, enter your details, or sign in with Google for quick registration.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف يعمل Fantasy Matchday؟' : 'How does Fantasy Matchday work?'}</h3>
                                    <p>{isArabic ? 'اختر مباراة، وكوّن تشكيلة من لاعبي الفريقين، واكسب نقاطًا بناءً على أدائهم الحقيقي. نافس المستخدمين الآخرين على قائمة المتصدرين!' : 'Select a match, build a lineup from players in both teams, and earn points based on their real-world performance. Compete with other users on the leaderboard!'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'هل اللعب مجاني؟' : 'Is it free to play?'}</h3>
                                    <p>{isArabic ? 'نعم! Fantasy Matchday مجاني للعب. يمكنك كسب الرصيد من خلال اللعب أو شراؤه للحصول على التعزيزات والميزات المميزة.' : 'Yes! Fantasy Matchday is free to play. You can earn credits through gameplay or purchase them for power-ups and premium features.'}</p>
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
                            <h2>{isArabic ? 'بناء تشكيلتك' : 'Building Your Lineup'}</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'lineup' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف أختار اللاعبين؟' : 'How do I select players?'}</h3>
                                    <p>{isArabic ? 'اذهب إلى المباريات، واختر مباراة قادمة، ثم اختر 11 لاعبًا أساسيًا و4 لاعبين احتياطيين من الفريقين المشاركين في تلك المباراة.' : 'Go to Matches, select an upcoming match, then choose 11 starting players and 4 bench players from both teams playing in that match.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'ما التشكيلات التي يمكنني استخدامها؟' : 'What formations can I use?'}</h3>
                                    <p>{isArabic ? 'يجب اختيار حارس مرمى واحد، و3-5 مدافعين، و3-5 لاعبي وسط، و1-3 مهاجمين. من التشكيلات الشائعة 4-4-2 و4-3-3 و3-5-2.' : 'You must select 1 GK, 3-5 DEF, 3-5 MID, and 1-3 FWD. Popular formations include 4-4-2, 4-3-3, and 3-5-2.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'ما هو الموعد النهائي لتقديم التشكيلة؟' : 'When is the lineup deadline?'}</h3>
                                    <p>{isArabic ? 'يجب تقديم تشكيلتك قبل انطلاق المباراة. بمجرد بدء المباراة، تُقفل التشكيلات ولا يمكن تغييرها.' : 'You must submit your lineup before the match kicks off. Once the match starts, lineups are locked and cannot be changed.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'ما دور القائد؟' : 'What does the captain do?'}</h3>
                                    <p>{isArabic ? 'يحصل قائدك على ضعف النقاط! اختر بحكمة — اختر لاعبًا تتوقع أن يقدّم أداءً جيدًا في المباراة.' : 'Your captain earns 2x points! Choose wisely - pick a player you expect to perform well in the match.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'هل يمكنني حفظ تشكيلتي كمسودة؟' : 'Can I save my lineup as a draft?'}</h3>
                                    <p>{isArabic ? 'نعم! اضغط على «حفظ المسودة» لحفظ تقدّمك. يمكنك العودة لاحقًا لإكمال تشكيلتك وتقديمها.' : 'Yes! Click "Save Draft" to save your progress. You can return later to complete and submit your lineup.'}</p>
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
                            <h2>{isArabic ? 'نظام النقاط' : 'Scoring System'}</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'scoring' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف تُحتسب النقاط؟' : 'How are points calculated?'}</h3>
                                    {isArabic ? (
                                        <p><strong>حراس المرمى والمدافعون:</strong> شباك نظيفة +4، هدف +6، تمريرة حاسمة +3، تصدٍّ لركلة جزاء +5، 3 تصديات أو أكثر +2<br/>
                                        <strong>لاعبو الوسط:</strong> هدف +5، تمريرة حاسمة +3، شباك نظيفة +1<br/>
                                        <strong>المهاجمون:</strong> هدف +4، تمريرة حاسمة +3<br/>
                                        <strong>جميع المراكز:</strong> رجل المباراة +3، هاتريك +5، اللعب 60 دقيقة أو أكثر +2، بطاقة صفراء -1، بطاقة حمراء -3</p>
                                    ) : (
                                        <p><strong>Goalkeepers & Defenders:</strong> Clean sheet +4, Goal +6, Assist +3, Penalty save +5, 3+ saves +2<br/>
                                        <strong>Midfielders:</strong> Goal +5, Assist +3, Clean sheet +1<br/>
                                        <strong>Forwards:</strong> Goal +4, Assist +3<br/>
                                        <strong>All Positions:</strong> Man of the Match +3, Hat-trick +5, 60+ minutes played +2, Yellow card -1, Red card -3</p>
                                    )}
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'متى تُحدّث النقاط؟' : 'When do points update?'}</h3>
                                    <p>{isArabic ? 'تُحدّث النقاط في الوقت الفعلي أثناء المباريات المباشرة، عادةً كل 2-3 دقائق. تُقفل النقاط النهائية بعد انتهاء المباراة.' : 'Points update in real-time during live matches, typically every 2-3 minutes. Final points are locked after the match ends.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'هل يكسب اللاعبون الاحتياطيون نقاطًا؟' : 'Do bench players earn points?'}</h3>
                                    <p>{isArabic ? 'عادةً لا. لكن إذا استخدمت تعزيز «دعم الاحتياط»، فسيكسب لاعبوك الاحتياطيون نقاطًا في تلك المباراة أيضًا.' : 'Normally, no. However, if you use the "Bench Boost" power-up, your bench players will also earn points for that match.'}</p>
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
                            <h2>{isArabic ? 'الدوريات والمنافسة' : 'Leagues & Competition'}</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'leagues' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف أنضم إلى دوري خاص؟' : 'How do I join a private league?'}</h3>
                                    <p>{isArabic ? 'اذهب إلى الدوريات، واضغط على «الانضمام برمز»، وأدخل رمز الدعوة الذي شاركه منشئ الدوري.' : 'Go to Leagues, click "Join by Code", and enter the invite code shared by the league creator.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف أنشئ دوريًا؟' : 'How do I create a league?'}</h3>
                                    <p>{isArabic ? 'اضغط على «إنشاء دوري» في صفحة الدوريات، وحدّد اسمًا وإعدادات الخصوصية، ثم شارك رمز الدعوة مع أصدقائك.' : 'Click "Create League" on the Leagues page, set a name and privacy settings, then share the invite code with friends.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'ما الفرق بين الدوريات العامة والخاصة؟' : "What's the difference between public and private leagues?"}</h3>
                                    <p>{isArabic ? 'الدوريات العامة مفتوحة لأي شخص للانضمام، بينما تتطلب الدوريات الخاصة رمز دعوة. كلا النوعين يتنافسان على نقاط المباريات نفسها.' : 'Public leagues are open for anyone to join, while private leagues require an invite code. Both types compete for the same match points.'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف تعمل قوائم المتصدرين؟' : 'How do leaderboards work?'}</h3>
                                    <p>{isArabic ? 'ترتّب قوائم المتصدرين العالمية جميع المستخدمين حسب إجمالي النقاط. تعرض قوائم متصدري الدوري الترتيب داخل دورياتك الخاصة. يُحدّث الترتيب بعد كل مباراة.' : 'Global leaderboards rank all users by total points. League leaderboards show rankings within your private leagues. Rankings update after each match.'}</p>
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
                            <h2>{isArabic ? 'الرصيد والتعزيزات' : 'Credits & Power-ups'}</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'credits' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف أكسب الرصيد؟' : 'How do I earn credits?'}</h3>
                                    <p>{isArabic ? 'اكسب الرصيد عبر: تسجيل الدخول اليومي (+10)، لعب المباريات (+20)، مكافآت الترتيب (50-500)، فتح الإنجازات (25-100)، والفوز بالدوريات (200-1000).' : 'Earn credits by: Daily login (+10), Playing matches (+20), Ranking rewards (50-500), Unlocking achievements (25-100), and Winning leagues (200-1000).'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'ما هي التعزيزات؟' : 'What are power-ups?'}</h3>
                                    <p>{isArabic ? 'التعزيزات هي ميزات خاصة يمكنك استخدامها على تشكيلتك: تعزيز القائد (ضعف النقاط)، القائد الثلاثي (ثلاثة أضعاف النقاط)، دعم الاحتياط (احتساب نقاط الاحتياط)، والبطاقة الحرة (انتقالات غير محدودة).' : 'Power-ups are special boosts you can use on your lineup: Captain Boost (2x points), Triple Captain (3x points), Bench Boost (bench players score), and Wild Card (unlimited transfers).'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'هل يمكنني شراء الرصيد؟' : 'Can I buy credits?'}</h3>
                                    <p>{isArabic ? 'نعم! تفضّل بزيارة صفحة الرصيد لشراء باقات رصيد تتضمن رصيدًا إضافيًا.' : 'Yes! Visit the Credits page to purchase credit packages with bonus credits included.'}</p>
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
                            <h2>{isArabic ? 'الإنجازات' : 'Achievements'}</h2>
                            <ChevronDown size={24} />
                        </button>
                        {openSection === 'achievements' && (
                            <div className={styles.sectionContent}>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'ما هي الإنجازات؟' : 'What are achievements?'}</h3>
                                    <p>{isArabic ? 'الإنجازات هي معالم خاصة تفتحها من خلال لعب المباريات وكسب النقاط والمنافسة. يكافئك كل إنجاز برصيد!' : 'Achievements are special milestones you unlock by playing matches, earning points, and competing. Each achievement rewards you with credits!'}</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <h3>{isArabic ? 'كيف أطالب بمكافآت الإنجازات؟' : 'How do I claim achievement rewards?'}</h3>
                                    <p>{isArabic ? 'اذهب إلى صفحة الإنجازات، واضغط على «المطالبة بالمكافأة» على أي إنجاز مكتمل لاستلام رصيدك.' : 'Go to the Achievements page, and click "Claim Reward" on any completed achievements to receive your credits.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Box */}
                <div className={styles.contactBox}>
                    <HelpCircle size={32} />
                    <h2>{isArabic ? 'هل ما زلت بحاجة إلى مساعدة؟' : 'Still need help?'}</h2>
                    <p>{isArabic ? 'تواصل مع فريق الدعم وسنردّ عليك خلال 24 ساعة' : "Contact our support team and we'll get back to you within 24 hours"}</p>
                    <a href="mailto:support@fantasymatchday.com" className={styles.contactButton}>
                        <Mail size={18} />
                        support@fantasymatchday.com
                    </a>
                </div>
            </div>
        </div>
    );
}
