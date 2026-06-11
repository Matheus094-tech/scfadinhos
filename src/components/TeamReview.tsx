import React from 'react';
import { DraftSlot, Formation, GameMode, TeamStats } from '../types/game';
import TeamPitch from './TeamPitch';

interface TeamReviewProps {
  draftSlots: DraftSlot[];
  formation: Formation;
  gameMode: GameMode;
  teamStats: TeamStats;
  onSimulate: () => void;
  onBack: () => void;
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 stat-bar h-3">
        <div
          className={`stat-bar-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-white font-bold text-sm w-8 text-right">{value}</span>
    </div>
  );
}

function ChemistryMeter({ value }: { value: number }) {
  const color =
    value >= 75
      ? 'from-green-500 to-green-400'
      : value >= 50
      ? 'from-yellow-500 to-yellow-400'
      : 'from-red-500 to-red-400';

  const label =
    value >= 80
      ? 'Química Perfeita ⚡'
      : value >= 65
      ? 'Boa Química'
      : value >= 50
      ? 'Química Regular'
      : 'Química Baixa';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Química do Time</span>
        <span className="text-white font-bold text-sm">{label}</span>
      </div>
      <div className="stat-bar h-4">
        <div
          className={`stat-bar-fill bg-gradient-to-r ${color} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-400">{value}/100</div>
    </div>
  );
}

const TeamReview: React.FC<TeamReviewProps> = ({
  draftSlots,
  formation,
  gameMode,
  teamStats,
  onSimulate,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-night-700 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-2xl">
          ←
        </button>
        <h1 className="text-2xl font-black text-gradient">Revisão do Time</h1>
        <span className="text-gray-500 text-sm ml-auto">{formation}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pitch */}
            <div className="card p-4">
              <TeamPitch draftSlots={draftSlots} gameMode={gameMode} />
            </div>

            {/* Stats panel */}
            <div className="space-y-4">
              {/* Overall */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-white">Overall do Time</h2>
                  <div className="text-5xl font-black text-gradient">{teamStats.overall}</div>
                </div>

                <div className="space-y-2">
                  <StatRow label="Força Ofensiva" value={teamStats.offensiveForce} color="bg-red-500" />
                  <StatRow label="Solidez Defensiva" value={teamStats.defensiveForce} color="bg-blue-500" />
                  <StatRow label="Controle de Meio" value={teamStats.midfieldControl} color="bg-green-500" />
                  <StatRow label="Exp. Europeia" value={teamStats.europeanExperience} color="bg-yellow-500" />
                </div>
              </div>

              {/* Chemistry */}
              <div className="card p-4">
                <ChemistryMeter value={teamStats.chemistry} />
              </div>

              {/* Strength / Weakness */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3">
                  <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1">Força</p>
                  <p className="text-white font-bold">{teamStats.strength}</p>
                </div>
                <div className="card p-3">
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Fraqueza</p>
                  <p className="text-white font-bold">{teamStats.weakness}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Star Player */}
          <div className="card p-4 border-gold-700">
            <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-3">⭐ Craque do Time</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-600 to-gold-800 flex items-center justify-center text-night-900 font-black text-xl flex-shrink-0">
                {teamStats.starPlayer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-black text-xl">{teamStats.starPlayer.name}</h3>
                <p className="text-gray-400 text-sm">
                  {teamStats.starPlayer.club} · {teamStats.starPlayer.season}
                </p>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{teamStats.starPlayer.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-4xl font-black text-gold-400">{teamStats.starPlayer.overall}</div>
                <div className="text-gold-600 text-xs">Overall</div>
              </div>
            </div>
          </div>

          {/* Player list */}
          <div className="card p-4">
            <h3 className="text-white font-bold mb-3">Elenco Completo</h3>
            <div className="space-y-2">
              {draftSlots
                .filter((s) => s.player !== null)
                .map((s) => (
                  <div key={s.slot.slotIndex} className="flex items-center gap-3 py-1.5 border-b border-night-600 last:border-0">
                    <span className="text-xs bg-night-700 text-gray-300 px-2 py-0.5 rounded font-mono w-12 text-center">
                      {s.slot.position}
                    </span>
                    <span className="text-white font-semibold flex-1 text-sm">{s.player!.name}</span>
                    <span className="text-gray-500 text-xs">{s.player!.club} {s.player!.season}</span>
                    <span className="text-gold-400 font-bold text-sm">{s.player!.overall}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Simulate button */}
          <div className="pb-6">
            <button onClick={onSimulate} className="btn-gold w-full text-lg py-4">
              🏆 Simular Campanha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamReview;
