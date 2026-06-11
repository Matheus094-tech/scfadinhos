import React from 'react';
import { Difficulty, Formation, GameMode } from '../types/game';

interface GameSetupProps {
  formation: Formation;
  gameMode: GameMode;
  difficulty: Difficulty;
  onFormationChange: (f: Formation) => void;
  onGameModeChange: (m: GameMode) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
  onBack: () => void;
}

const FORMATION_DIAGRAMS: Record<Formation, { label: string; dots: [number, number][] }> = {
  '4-3-3': {
    label: '4-3-3',
    dots: [
      [50, 90], // GK
      [20, 72], [38, 70], [62, 70], [80, 72], // Def
      [25, 48], [50, 45], [75, 48], // Mid
      [18, 18], [50, 12], [82, 18], // Atk
    ],
  },
  '4-4-2': {
    label: '4-4-2',
    dots: [
      [50, 90],
      [20, 72], [38, 70], [62, 70], [80, 72],
      [18, 48], [38, 45], [62, 45], [82, 48],
      [35, 12], [65, 12],
    ],
  },
  '4-2-3-1': {
    label: '4-2-3-1',
    dots: [
      [50, 90],
      [20, 72], [38, 70], [62, 70], [80, 72],
      [35, 58], [65, 58],
      [18, 35], [50, 32], [82, 35],
      [50, 12],
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    dots: [
      [50, 90],
      [28, 70], [50, 68], [72, 70],
      [12, 50], [30, 46], [50, 44], [70, 46], [88, 50],
      [35, 12], [65, 12],
    ],
  },
};

const GameSetup: React.FC<GameSetupProps> = ({
  formation,
  gameMode,
  difficulty,
  onFormationChange,
  onGameModeChange,
  onDifficultyChange,
  onStart,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-night-700">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-2xl">
          ←
        </button>
        <h1 className="text-2xl font-black text-gradient">Configurar Draft</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-3xl mx-auto w-full">
        {/* Formation */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            <span className="text-gold-500">1.</span> Escolha sua Formação
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(FORMATION_DIAGRAMS) as Formation[]).map((f) => {
              const diagram = FORMATION_DIAGRAMS[f];
              const isSelected = formation === f;
              return (
                <button
                  key={f}
                  onClick={() => onFormationChange(f)}
                  className={`card p-3 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? 'border-gold-500 bg-night-600 glow-gold'
                      : 'border-night-500 hover:border-night-400'
                  }`}
                >
                  {/* Mini pitch diagram */}
                  <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #1a5c2a 0%, #1e6b31 50%, #1a5c2a 100%)' }}
                  >
                    {/* Halfway line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white opacity-20" />
                    {/* Dots */}
                    {diagram.dots.map(([x, y], i) => (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                          isSelected ? 'bg-gold-400' : 'bg-white'
                        }`}
                        style={{ left: `${x}%`, top: `${y}%` }}
                      />
                    ))}
                  </div>
                  <span className={`font-bold text-sm ${isSelected ? 'text-gold-400' : 'text-gray-300'}`}>
                    {diagram.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Game mode */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            <span className="text-gold-500">2.</span> Modo de Jogo
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: 'classic',
                  label: 'Clássico',
                  icon: '📊',
                  desc: 'Veja todas as estatísticas dos jogadores',
                },
                {
                  value: 'expert',
                  label: 'Especialista',
                  icon: '🔍',
                  desc: 'Apenas o Overall é revelado — confie no instinto!',
                },
              ] as { value: GameMode; label: string; icon: string; desc: string }[]
            ).map(({ value, label, icon, desc }) => (
              <button
                key={value}
                onClick={() => onGameModeChange(value)}
                className={`card p-4 text-left transition-all duration-200 hover:scale-105 ${
                  gameMode === value
                    ? 'border-gold-500 glow-gold'
                    : 'border-night-500 hover:border-night-400'
                }`}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className={`font-bold ${gameMode === value ? 'text-gold-400' : 'text-white'}`}>{label}</div>
                <div className="text-gray-400 text-xs mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            <span className="text-gold-500">3.</span> Dificuldade
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                {
                  value: 'normal',
                  label: 'Normal',
                  icon: '🟢',
                  color: 'border-green-600',
                  selectedColor: 'border-green-400 bg-green-900',
                  desc: 'Passar com 3 vitórias na fase de grupos',
                },
                {
                  value: 'hard',
                  label: 'Difícil',
                  icon: '🟡',
                  color: 'border-yellow-600',
                  selectedColor: 'border-yellow-400 bg-yellow-900',
                  desc: 'Adversários mais fortes nas eliminatórias',
                },
                {
                  value: 'legendary',
                  label: 'Lendário',
                  icon: '🔴',
                  color: 'border-red-700',
                  selectedColor: 'border-red-400 bg-red-900',
                  desc: 'Precisa de 4 vitórias nos grupos — apenas lendas sobrevivem',
                },
              ] as {
                value: Difficulty;
                label: string;
                icon: string;
                color: string;
                selectedColor: string;
                desc: string;
              }[]
            ).map(({ value, label, icon, color, selectedColor, desc }) => (
              <button
                key={value}
                onClick={() => onDifficultyChange(value)}
                className={`card p-4 text-left transition-all duration-200 hover:scale-105 ${
                  difficulty === value ? selectedColor : color
                }`}
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className={`font-bold text-sm ${difficulty === value ? 'text-white' : 'text-gray-300'}`}>
                  {label}
                </div>
                <div className="text-gray-400 text-xs mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Start button */}
        <div className="pb-6">
          <button onClick={onStart} className="btn-gold w-full text-lg py-4">
            ⚽ Iniciar Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
