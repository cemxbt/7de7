import { useMemo, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import type { CampaignResult, Fixture, Stage } from '../game/sim';
import type { DraftState, PlacedPlayer } from '../game/types';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

interface Props {
  lang: Lang;
  result: CampaignResult;
  draft: DraftState;
  onPlayAgain: () => void;
}

const STAGE_KEY: Record<Stage, StringKey> = {
  G1: 'stageG1', G2: 'stageG2', G3: 'stageG3',
  R16: 'stageR16', QF: 'stageQF', SF: 'stageSF', F: 'stageF',
};

const countAgg = (names: string[]): string => {
  const m = new Map<string, number>();
  names.forEach(n => m.set(n, (m.get(n) ?? 0) + 1));
  return [...m].map(([n, c]) => (c > 1 ? `${n} (${c})` : n)).join(', ');
};

function FixtureCard({ f, lang, final }: { f: Fixture; lang: Lang; final: boolean }) {
  const c = COUNTRIES[f.oppSel];
  const won = f.group ? f.outcome === 'W' : f.advanced;
  const lost = f.group ? f.outcome === 'L' : !f.advanced;
  const mark = final && f.advanced ? '🏆' : won ? '✓' : lost ? '✕' : '–';
  return (
    <div className={`fixture ${won ? 'won' : lost ? 'lost' : 'drew'} ${final ? 'is-final' : ''}`}>
      <div className="fx-top">
        <span className="fx-stage">{t(STAGE_KEY[f.stage], lang)}</span>
        <span className="fx-mark">{mark}</span>
      </div>
      <div className="fx-row">
        <span className="fx-you">⭐ {t('yourTeam', lang)}</span>
        <span className="fx-score">{f.gf} – {f.ga}</span>
        <span className="fx-opp">{c?.flag} {c ? c[lang] : f.oppSel} {f.oppCopa}</span>
      </div>
      {f.pens && (
        <div className="fx-pens">
          🥅 {t('pen', lang)} <b>{f.pens.score}</b>
          <span className="fx-kicks">
            {f.pens.me.map(k => (k ? '🟢' : '🔴'))}{f.pens.sd && f.pens.sd.me.map(k => (k ? '🟢' : '🔴'))}
            {' / '}
            {f.pens.them.map(k => (k ? '🟢' : '🔴'))}{f.pens.sd && f.pens.sd.them.map(k => (k ? '🟢' : '🔴'))}
          </span>
        </div>
      )}
      {(f.scorers.length > 0 || f.conceded.length > 0) && (
        <div className="fx-scorers">
          {f.scorers.length > 0 && <span>⚽ {t('scored', lang)} {countAgg(f.scorers)}</span>}
          {f.conceded.length > 0 && <span className="fx-conceded">🥅 {t('concededLbl', lang)} {countAgg(f.conceded)}</span>}
        </div>
      )}
    </div>
  );
}

export default function Reveal({ lang, result, draft, onPlayAgain }: Props) {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const total = result.campaign.length;
  const finished = step >= total;
  const visible = result.campaign.slice(0, finished ? total : step + 1);
  const g3 = visible.find(f => f.stage === 'G3');

  const xi = draft.filled.filter((p): p is PlacedPlayer => p !== null);

  const topScorer = useMemo(() => {
    const counts = new Map<string, number>();
    result.campaign.forEach(f => f.scorers.forEach(s => counts.set(s, (counts.get(s) ?? 0) + 1)));
    let best: [string, number] | null = null;
    counts.forEach((n, name) => { if (!best || n > best[1]) best = [name, n]; });
    return best as [string, number] | null;
  }, [result]);

  const shareText = () => {
    const lines: string[] = [];
    lines.push(`${t('title', lang)} ⚽ ${draft.formation} · ${t('seedLbl', lang, { seed: result.seed })}`);
    result.campaign.forEach(f => {
      const c = COUNTRIES[f.oppSel];
      const won = f.group ? f.outcome === 'W' : f.advanced;
      const icon = won ? '✅' : f.outcome === 'D' && f.group ? '➖' : '❌';
      const pen = f.pens ? ` (${t('pen', lang)} ${f.pens.score})` : '';
      lines.push(`${icon} ${f.gf}-${f.ga}${pen} ${c?.flag ?? ''} ${c ? c[lang] : f.oppSel} ${f.oppCopa}`);
    });
    if (result.perfect) lines.push(`💎 ${t('perfect', lang)} · ${t('overall', lang)} ${result.overall}`);
    else if (result.champion) lines.push(`🏆 ${t('champion', lang)} ${result.record} · ${t('overall', lang)} ${result.overall}`);
    else lines.push(`☠️ ${t('eliminated', lang)} ${result.record}`);
    if (result.badge) lines.push(`★ ${t(result.badge === 'CRUSHER' ? 'badgeCrusher' : 'badgeWall', lang)}`);
    lines.push(window.location.href);
    return lines.join('\n');
  };

  const doShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <main className="reveal">
      <div className="fixture-list">
        {visible.map((f, i) => (
          <FixtureCard key={i} f={f} lang={lang} final={f.stage === 'F'} />
        ))}
      </div>

      {g3?.groupTable && (
        <div className="card table-card">
          <h2>{t('groupTable', lang)}</h2>
          <table className="standings">
            <thead>
              <tr><th></th><th>P</th><th>+/-</th><th>⚽</th></tr>
            </thead>
            <tbody>
              {g3.groupTable.map((r, i) => {
                const c = r.sel ? COUNTRIES[r.sel] : null;
                return (
                  <tr key={i} className={r.me ? 'you-row' : ''}>
                    <td>{r.me ? `⭐ ${t('yourTeam', lang)}` : `${c?.flag ?? ''} ${c ? c[lang] : r.sel} ${r.copa}`}</td>
                    <td>{r.pts}</td>
                    <td>{r.gd > 0 ? '+' : ''}{r.gd}</td>
                    <td>{r.gf}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {finished || step >= 3 ? null : <p className="qualified-note">{t('qualified', lang)}</p>}
        </div>
      )}

      {!finished ? (
        <div className="sim-controls">
          <button className="cta" onClick={() => setStep(step + 1)}>
            {t('next', lang)} →
          </button>
          {step + 2 < total && (
            <button className="ghost" onClick={() => setStep(total)}>⏩ {t('autoSim', lang)}</button>
          )}
        </div>
      ) : (
        <div className={`result-card ${result.champion ? 'gold' : ''}`}>
          <div className="rc-seed">{t('seedLbl', lang, { seed: result.seed })}</div>

          {result.perfect ? (
            <>
              <div className="result-icon">💎🏆</div>
              <h1 className="result-title">{t('perfect', lang)}</h1>
            </>
          ) : result.champion ? (
            <>
              <div className="result-icon">🏆</div>
              <h1 className="result-title">{t('champion', lang)}</h1>
            </>
          ) : (
            <>
              <div className="result-icon">☠️</div>
              <h1 className="result-title">{t('eliminated', lang)}</h1>
            </>
          )}

          <div className="rc-record">{result.record}</div>

          {result.badge && (
            <div className="rc-badge">★ {t(result.badge === 'CRUSHER' ? 'badgeCrusher' : 'badgeWall', lang)} ★</div>
          )}

          <div className="result-stats">
            <div><b>{result.gf}</b><span>{t('gf', lang)}</span></div>
            <div><b>{result.ga}</b><span>{t('ga', lang)}</span></div>
            <div><b>{result.overall}</b><span>{t('overall', lang)}</span></div>
            <div><b>{result.wins}</b><span>{result.perfect ? t('unbeaten', lang) : t('wins', lang)}</span></div>
            {topScorer && <div><b>{topScorer[0]} ({topScorer[1]})</b><span>{t('topScorer', lang)}</span></div>}
          </div>

          <div className="rc-lineup">
            {xi.map((p, i) => {
              const c = COUNTRIES[p.sel];
              return (
                <span key={i} className={`rc-chip ${p.leg ? 'legend' : ''}`}>
                  <span className="rc-chip-no">{p.no || '–'}</span>
                  <span className="rc-chip-name">{p.n}</span>
                  <span className="rc-chip-org">{c?.flag} {p.copa}</span>
                </span>
              );
            })}
          </div>

          <div className="result-actions">
            <button className="cta" onClick={onPlayAgain}>🔁 {t('playAgain', lang)}</button>
            <button className="ghost big" onClick={doShare}>
              {copied ? `✓ ${t('copied', lang)}` : `📋 ${t('share', lang)}`}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
