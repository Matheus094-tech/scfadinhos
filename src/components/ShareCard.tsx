import React, { useState } from 'react';
import { CampaignStats, DraftSlot, Formation, Phase, TeamStats } from '../types/game';

interface ShareCardProps {
  formation: Formation;
  campaignStats: CampaignStats;
  teamStats: TeamStats;
  draftSlots: DraftSlot[];
}

function getPhaseText(phase: Phase): string {
  switch (phase) {
    case 'champion': return 'CAMPEÃO DA EUROPA 🏆';
    case 'final': return 'Vice-Campeão 🥈';
    case 'semifinal': return 'Semifinalista';
    case 'quarterfinal': return 'Quartas de Final';
    case 'round16': return 'Oitavas de Final';
    case 'groups': return 'Fase de Grupos';
  }
}

const ShareCard: React.FC<ShareCardProps> = ({ formation, campaignStats, teamStats, draftSlots }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const players = draftSlots
      .filter((s) => s.player !== null)
      .sort((a, b) => {
        const order = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'];
        return order.indexOf(a.slot.position) - order.indexOf(b.slot.position);
      });

    const playerLines = players
      .map((s) => `${s.slot.position}: ${s.player!.name} (${s.player!.club} ${s.player!.season})`)
      .join('\n');

    const text = [
      '⚽ Noites Europeias Draft',
      `Formação: ${formation}`,
      `Campanha: ${getPhaseText(campaignStats.phase)}`,
      `Craque: ${teamStats.starPlayer.name}`,
      `Artilheiro: ${campaignStats.topScorer} (${campaignStats.topScorerGoals} gols)`,
      `Nota: ${campaignStats.rating}/100`,
      '',
      'Meu XI:',
      playerLines,
      '',
      '#NoitesEuropeias #ChampionsLeague',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const players = draftSlots
    .filter((s) => s.player !== null)
    .sort((a, b) => {
      const order = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'];
      return order.indexOf(a.slot.position) - order.indexOf(b.slot.position);
    });

  return (
    <div className="space-y-4">
      {/* Visual share card */}
      <div className="card p-5 border-gold-700" style={{ background: 'linear-gradient(135deg, #0a0f1e, #1a2744)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gradient font-black text-lg">Noites Europeias Draft</h3>
            <p className="text-gray-500 text-xs">#NoitesEuropeias</p>
          </div>
          <span className="text-3xl">⚽</span>
        </div>

        {/* Phase */}
        <div className="text-center py-3 border-y border-night-500 mb-4">
          <p className="text-gold-400 font-black text-xl">{getPhaseText(campaignStats.phase)}</p>
          <p className="text-gray-400 text-sm mt-1">Formação: {formation}</p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-black text-white">
              {campaignStats.wins}V {campaignStats.draws}E {campaignStats.losses}D
            </div>
            <div className="text-gray-500 text-xs">Campanha</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gold-400">{campaignStats.rating}</div>
            <div className="text-gray-500 text-xs">Nota</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-sapphire-400">
              {campaignStats.goalsFor}–{campaignStats.goalsAgainst}
            </div>
            <div className="text-gray-500 text-xs">Gols</div>
          </div>
        </div>

        {/* Star player */}
        <div className="bg-night-700 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center text-night-900 font-black">
              {teamStats.starPlayer.name.charAt(0)}
            </div>
            <div>
              <p className="text-gold-400 text-xs font-semibold">⭐ Craque</p>
              <p className="text-white font-bold text-sm">{teamStats.starPlayer.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-gold-400 text-xs font-semibold">⚽ Artilheiro</p>
              <p className="text-white text-xs font-semibold">
                {campaignStats.topScorer} ({campaignStats.topScorerGoals})
              </p>
            </div>
          </div>
        </div>

        {/* Player list (compact) */}
        <div className="grid grid-cols-2 gap-1">
          {players.map((s) => (
            <div key={s.slot.slotIndex} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-mono w-8">{s.slot.position}</span>
              <span className="text-xs text-gray-300 truncate">{s.player!.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
          copied
            ? 'bg-green-600 text-white'
            : 'btn-outline'
        }`}
      >
        {copied ? '✓ Copiado!' : '📋 Copiar Resultado'}
      </button>
    </div>
  );
};

export default ShareCard;
