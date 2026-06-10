import { useEffect, useState } from 'react';
import type { Stats } from '../App';
import { AVATARS, clearHistory, saveProfile, type HistoryEntry, type Profile } from '../profile';
import {
  fetchLeaderboard, signIn, signOut, signUp, upsertCloudProfile,
  type LeaderboardRow, type User,
} from '../online';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

interface Props {
  lang: Lang;
  profile: Profile;
  setProfile: (p: Profile) => void;
  history: HistoryEntry[];
  setHistory: (h: HistoryEntry[]) => void;
  stats: Stats;
  user: User | null;
  onBack: () => void;
}

function AccountCard({ lang, user }: { lang: Lang; user: User | null }) {
  const [tab, setTab] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (tab === 'in') {
        await signIn(email, pass);
      } else {
        const { needsConfirm } = await signUp(email, pass);
        if (needsConfirm) setMsg(t('confirmEmail', lang));
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <section className="card">
        <h2>{t('account', lang)}</h2>
        <div className="account-row">
          <span className="account-mail">✅ {t('signedIn', lang)}: <b>{user.email}</b></span>
          <button className="ghost small" onClick={() => signOut()}>{t('signOut', lang)}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>{t('account', lang)}</h2>
      <p className="auth-hint">☁️ {t('authHint', lang)}</p>
      <div className="auth-tabs">
        <button className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>{t('signIn', lang)}</button>
        <button className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>{t('signUp', lang)}</button>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <input
          type="email" required autoComplete="email"
          placeholder={t('email', lang)}
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password" required minLength={6}
          autoComplete={tab === 'in' ? 'current-password' : 'new-password'}
          placeholder={t('password', lang)}
          value={pass} onChange={e => setPass(e.target.value)}
        />
        <button className="cta auth-submit" type="submit" disabled={busy}>
          {busy ? '…' : tab === 'in' ? `🔑 ${t('signIn', lang)}` : `✨ ${t('signUp', lang)}`}
        </button>
      </form>
      {msg && <p className="auth-msg">{msg}</p>}
    </section>
  );
}

function LeaderboardCard({ lang }: { lang: Lang }) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    fetchLeaderboard().then(setRows).catch(() => setRows([]));
  }, []);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`);

  return (
    <section className="card">
      <h2>🌍 {t('leaderboard', lang)}</h2>
      {rows === null ? (
        <p className="history-empty">…</p>
      ) : rows.length === 0 ? (
        <p className="history-empty">{t('lbEmpty', lang)}</p>
      ) : (
        <div className="lb-list">
          {rows.map((r, i) => (
            <div key={i} className={`lb-row ${i < 3 ? 'top' : ''}`}>
              <span className="lb-rank">{medal(i)}</span>
              <span className="lb-avatar">{r.avatar}</span>
              <span className="lb-name">{r.name || t('lbAnon', lang)}</span>
              <span className="lb-stats">
                🏆 {r.titles}{r.perfect > 0 && <> · 💎 {r.perfect}</>}
                <small>{r.played} {t('statPlayed', lang).toLowerCase()} · {t('statBest', lang).toLowerCase()} {r.best}</small>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const MODE_ICON: Record<string, string> = { classic: '⚽', almanak: '🧠', hardcore: '🔥', wc2026: '🏟️' };
const STAGE_KEY: Record<string, StringKey> = {
  G1: 'stageG1', G2: 'stageG2', G3: 'stageG3',
  R16: 'stageR16', QF: 'stageQF', SF: 'stageSF', F: 'stageF',
};

export default function ProfileScreen({ lang, profile, setProfile, history, setHistory, stats, user, onBack }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
    if (user) upsertCloudProfile(user.id, next).catch(() => { /* offline */ });
  };

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' });

  return (
    <main className="profile">
      <section className="card">
        <h2>{t('profile', lang)}</h2>
        <div className="profile-head">
          <span className="profile-avatar">{profile.avatar}</span>
          <input
            className="profile-name"
            type="text"
            maxLength={18}
            value={profile.name}
            placeholder={t('nicknamePh', lang)}
            onChange={e => update({ name: e.target.value })}
            aria-label={t('nickname', lang)}
          />
        </div>
        <div className="avatar-grid">
          {AVATARS.map(a => (
            <button
              key={a}
              className={`avatar-pick ${profile.avatar === a ? 'sel' : ''}`}
              onClick={() => update({ avatar: a })}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <AccountCard lang={lang} user={user} />

      <LeaderboardCard lang={lang} />

      {stats.played > 0 && (
        <section className="card stats">
          <h2>{t('stats', lang)}</h2>
          <div className="stat-grid">
            <div><b>{stats.played}</b><span>{t('statPlayed', lang)}</span></div>
            <div><b>🏆 {stats.titles}</b><span>{t('statTitles', lang)}</span></div>
            <div><b>💎 {stats.perfect}</b><span>{t('statPerfect', lang)}</span></div>
            <div><b>{stats.best}</b><span>{t('statBest', lang)}</span></div>
          </div>
        </section>
      )}

      <section className="card">
        <h2>{t('historyTitle', lang)}</h2>
        {history.length === 0 ? (
          <p className="history-empty">{t('noHistory', lang)}</p>
        ) : (
          <>
            <div className="history-list">
              {history.map((h, i) => (
                <div key={i} className={`history-row ${h.champion ? 'champ' : ''}`}>
                  <span className="hr-icon">{h.perfect ? '💎' : h.champion ? '🏆' : '☠️'}</span>
                  <span className="hr-main">
                    <b>{MODE_ICON[h.mode] ?? '⚽'} {h.formation}</b>
                    <small>
                      {fmtDate(h.ts)} · {h.champion
                        ? `${t('champion', lang)} ${h.record}`
                        : `${t(STAGE_KEY[h.stage] ?? 'stageG1', lang)} · ${h.record}`}
                    </small>
                  </span>
                  <span className="hr-stats">
                    <b>{h.overall}</b>
                    <small>{h.gf}–{h.ga}</small>
                  </span>
                </div>
              ))}
            </div>
            <button
              className={`ghost small history-clear ${confirmClear ? 'danger' : ''}`}
              onClick={() => {
                if (!confirmClear) { setConfirmClear(true); return; }
                setHistory(clearHistory());
                setConfirmClear(false);
              }}
            >
              {confirmClear ? '⚠️ ' : '🗑 '}{t('clearHistory', lang)}{confirmClear ? '?' : ''}
            </button>
          </>
        )}
      </section>

      <p className="local-note">{t('localNote', lang)}</p>

      <button className="cta" onClick={onBack}>← {t('back', lang)}</button>
    </main>
  );
}
