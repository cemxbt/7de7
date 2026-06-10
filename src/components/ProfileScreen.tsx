import { useState } from 'react';
import type { Stats } from '../App';
import { AVATARS, clearHistory, saveProfile, type HistoryEntry, type Profile } from '../profile';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

interface Props {
  lang: Lang;
  profile: Profile;
  setProfile: (p: Profile) => void;
  history: HistoryEntry[];
  setHistory: (h: HistoryEntry[]) => void;
  stats: Stats;
  onBack: () => void;
}

const MODE_ICON: Record<string, string> = { classic: '⚽', almanak: '🧠', hardcore: '🔥', wc2026: '🏟️' };
const STAGE_KEY: Record<string, StringKey> = {
  G1: 'stageG1', G2: 'stageG2', G3: 'stageG3',
  R16: 'stageR16', QF: 'stageQF', SF: 'stageSF', F: 'stageF',
};

export default function ProfileScreen({ lang, profile, setProfile, history, setHistory, stats, onBack }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
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
