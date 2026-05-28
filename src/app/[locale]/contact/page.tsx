import styles from '../help/help.module.css';

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Contact <span className={styles.highlight}>Us</span>
                </h1>
                <p className={styles.subtitle}>Get in touch with our team</p>
            </div>

            <div className={styles.content}>
                <div className={styles.faqSection}>
                    <div className={styles.faqItem}>
                        <h3>📧 Email Support</h3>
                        <p><a href="mailto:support@fantasymatchday.com" style={{ color: '#4ade80', textDecoration: 'underline' }}>support@fantasymatchday.com</a></p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Average response time: 24 hours</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>💬 Live Chat</h3>
                        <p>Coming soon - Real-time support during match days</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>📱 Social Media</h3>
                        <p>Follow us for updates and quick responses</p>
                        <p style={{ marginTop: '1rem' }}>
                            <a href="#" style={{ color: '#4ade80', marginRight: '1rem' }}>Twitter</a>
                            <a href="#" style={{ color: '#4ade80', marginRight: '1rem' }}>Instagram</a>
                            <a href="#" style={{ color: '#4ade80' }}>Facebook</a>
                        </p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>🏢 Business Inquiries</h3>
                        <p>For partnerships and sponsorships:</p>
                        <p><a href="mailto:business@fantasymatchday.com" style={{ color: '#4ade80', textDecoration: 'underline' }}>business@fantasymatchday.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
