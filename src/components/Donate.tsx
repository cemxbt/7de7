import { useState } from 'react';
import type { Lang } from '../i18n';
import { t } from '../i18n';

const WALLETS: { chain: string; symbol: string; icon: string; address: string }[] = [
  { chain: 'Ethereum', symbol: 'ETH', icon: '⟠', address: '0xed3E356b64ce86f3E2659a566B3f5Dd2faBF3F1e' },
  { chain: 'Bitcoin', symbol: 'BTC', icon: '₿', address: 'bc1qpgt7j3egsqggmetymr83j3jhjq9asjkgl8s0u7' },
  { chain: 'Solana', symbol: 'SOL', icon: '◎', address: '8vdq5AN7ZsxB4aiZyLNmEGEBn5KMgCmxg9YenxG1inHb' },
  { chain: 'Tron', symbol: 'TRX', icon: '♦', address: 'TEja2qKsg1BfrAPojDnKf4LNVpTtXxuDe5' },
  { chain: 'Avalanche', symbol: 'AVAX', icon: '▲', address: '0xed3E356b64ce86f3E2659a566B3f5Dd2faBF3F1e' },
];

const short = (a: string) => `${a.slice(0, 8)}…${a.slice(-6)}`;

export default function Donate({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={e => e.stopPropagation()}>
        <div className="donate-head">
          <h2>☕ {t('donateTitle', lang)}</h2>
          <button className="donate-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="donate-desc">{t('donateDesc', lang)}</p>
        <div className="wallet-list">
          {WALLETS.map(w => (
            <button key={w.chain} className="wallet-row" onClick={() => copy(w.address)}>
              <span className="wallet-icon">{w.icon}</span>
              <span className="wallet-meta">
                <b>{w.chain}</b>
                <code>{short(w.address)}</code>
              </span>
              <span className={`wallet-copy ${copied === w.address ? 'ok' : ''}`}>
                {copied === w.address ? `✓ ${t('copied', lang)}` : t('donateCopy', lang)}
              </span>
            </button>
          ))}
        </div>
        <p className="donate-note">{t('donateNote', lang)}</p>
      </div>
    </div>
  );
}
