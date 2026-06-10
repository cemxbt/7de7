import { useMemo, useState } from 'react';
import type { MatchResult, Mode, Slot, TournamentResult } from '../game/engine';
import type { Lang, StringKey } from '../i18n';
import { t } from '../i18n';

interface Props {
  lang: Lang;
  result: TournamentResult;
  slots: Slot[];
  mode: Mode;
  formationName: string;
  styleName: string;
  onPlayAgain: () => void;
}

const STAGE_KEY: Record<string, StringKey> = {
  G1: 'stageG1', G2: 'stageG2', G3: 'stageG3',
  R16: 'stageR16', QF: 'stageQF', SF: 'stageSF', F: 'stageF',
};

function MatchCard({ m, lang }: { m: MatchResult; lang: Lang }) {
  const oppName = lang === 'tr' ? m.opp.tr : m.opp.c;
  return (
    <div className={`match-card ${m.won ? 'won' : m.drawn && !m.pens ? 'drew' : 'lost'}`}>
      <div className="match-stage">{t(STAGE_KEY[m.stage], lang)}</div>
      <div className="match-score">
        <span className="match-team you">⭐ {t('yourTeam', lang)}</span>
        <span className="score">{m.gf} – {m.ga}</span>
        <span className="match-team">{m.opp.f} {oppName} {m.opp.y}</span>
      </div>
      {m.pens && (
        <div className="pens">({t('pens', lang)} {m.pens[0]} – {m.pens[1]})</div>
      )}
      {m.scorers.length > 0 && (
        <div className="scorers">
          ⚽ {m.scorers.map(s => `${s.name} ${s.minute}'`).join(', ')}
        </div>
      )}
    </div>
  );
}

export default function Tournament({ lang, result, slots, mode, formationName, styleName, onPlayAgain }: Props) {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const total = result.matches.length;
  const finished = step >= total;

  const topScorer = useMemo(() => {
    const counts = new Map<string, number>();
    result.matches.forEach(m => m.scorers.forEach(s => counts.set(s.name, (counts.get(s.name) ?? 0) + 1)));
    let best: [string, number] | null = null;
    counts.forEach((n, name) => {
      if (!best || n > best[1]) best = [name, n];
    });
    return best as [string, number] | null;
  }, [result]);

  const elimKey: StringKey | null = result.eliminatedAt
    ? (`elim${result.eliminatedAt}` as StringKey)
    : null;

  const shareText = () => {
    const lines: string[] = [];
    lines.push(`${t('title', lang)} ⚽ ${formationName} · ${styleName}`);
    lines.push(`${t('teamPower', lang)}: ${result.teamStr.toFixed(1)}`);
    result.matches.forEach(m => {
      const icon = m.won ? '✅' : m.drawn && !m.pens ? '➖' : m.pens && m.won ? '✅' : '❌';
      const pen = m.pens ? ` (${m.pens[0]}-${m.pens[1]} ${t('pens', lang)})` : '';
      lines.push(`${icon} ${m.gf}-${m.ga}${pen} ${m.opp.f} ${lang === 'tr' ? m.opp.tr : m.opp.c} ${m.opp.y}`);
    });
    if (result.perfect) lines.push(`💎 ${t('perfect', lang)}`);
    else if (result.champion) lines.push(`🏆 ${t('champion', lang)}`);
    else if (elimKey) lines.push(`☠️ ${t(elimKey, lang)}`);
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

  const visibleMatches = result.matches.slice(0, finished ? total : step + 1);
  const groupDone = visibleMatches.filter(m => m.stage.startsWith('G')).length === 3;

  return (
    <main className="tournament">
      {mode === 'memory' && step === 0 && !finished && (
        <div className="reveal-banner">🔓 {t('revealed', lang)} {t('teamPower', lang)}: <b>{result.teamStr.toFixed(1)}</b></div>
      )}

      <div className="match-list">
        {visibleMatches.map((m, i) => (
          <MatchCard key={i} m={m} lang={lang} />
        ))}
      </div>

      {groupDone && (
        <div className="card table-card">
          <h2>{t('table', lang)}</h2>
          <table className="standings">
            <thead>
              <tr><th>{t('team', lang)}</th><th>{t('pts', lang)}</th><th>+/-</th></tr>
            </thead>
            <tbody>
              {result.groupTable.map((r, i) => (
                <tr key={i} className={r.name === 'YOU' ? 'you-row' : ''}>
                  <td>{r.name === 'YOU' ? `⭐ ${t('yourTeam', lang)}` : `${r.flag} ${lang === 'tr' ? r.tr : r.name} ${r.year}`}</td>
                  <td>{r.pts}</td>
                  <td>{r.gf - r.ga > 0 ? '+' : ''}{r.gf - r.ga}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!finished ? (
        <div className="sim-controls">
          <button className="cta" onClick={() => setStep(step + 1)}>
            {step + 1 < total ? t('next', lang) : t('skipAll', lang)} →
          </button>
          {step + 2 < total && (
            <button className="ghost" onClick={() => setStep(total)}>{t('skipAll', lang)}</button>
          )}
        </div>
      ) : (
        <div className={`result-card ${result.champion ? 'gold' : ''}`}>
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
              {elimKey && <p>{t(elimKey, lang)}</p>}
            </>
          )}

          <div className="result-stats">
            <div><b>{result.wins} / {result.draws} / {result.losses}</b><span>{t('record', lang)}</span></div>
            <div><b>{result.gf} / {result.ga}</b><span>{t('goals', lang)}</span></div>
            <div><b>{result.teamStr.toFixed(1)}</b><span>{t('teamPower', lang)}</span></div>
            {topScorer && <div><b>{topScorer[0]} ({topScorer[1]})</b><span>{t('motm', lang)}</span></div>}
          </div>

          <div className="result-xi">
            <h3>{t('yourXI', lang)} — {formationName}</h3>
            <ul>
              {slots.filter(s => s.player).map(s => (
                <li key={s.id}>
                  <span className={`pos-tag pos-${s.pos}`}>{s.pos}</span>
                  {s.player!.flag} {s.player!.n} <small>{s.player!.year}</small>
                  <b>{s.player!.r}</b>
                </li>
              ))}
            </ul>
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
