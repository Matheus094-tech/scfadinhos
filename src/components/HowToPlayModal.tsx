import React from 'react';

interface HowToPlayModalProps {
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const steps = [
    {
      icon: '⚙️',
      title: 'Configure seu Draft',
      desc: 'Escolha sua formação preferida (4-3-3, 4-4-2, 4-2-3-1 ou 3-5-2), o modo de jogo e a dificuldade.',
    },
    {
      icon: '🎲',
      title: '11 Rodadas de Draft',
      desc: 'A cada rodada, um time histórico da Champions League é sorteado. Você verá 4-5 jogadores desse elenco.',
    },
    {
      icon: '⭐',
      title: 'Escolha um Jogador',
      desc: 'Selecione o jogador que melhor se encaixa na sua formação. Ele deve preencher uma posição ainda vazia.',
    },
    {
      icon: '🔄',
      title: '3 Re-sorteios',
      desc: 'Não gostou do time sorteado? Use um dos seus 3 tokens para re-sortear um novo elenco histórico.',
    },
    {
      icon: '📊',
      title: 'Modos de Jogo',
      desc: 'Clássico: veja todas as estatísticas dos jogadores. Especialista: apenas o Overall é revelado — confie no instinto!',
    },
    {
      icon: '🏟️',
      title: 'Simule a Campanha',
      desc: 'Com seu XI montado, simule uma campanha completa da Champions League — grupos, oitavas, quartas, semis e final.',
    },
    {
      icon: '🏆',
      title: 'Compartilhe',
      desc: 'Veja seus resultados detalhados e compartilhe sua campanha com seus amigos!',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(3,7,18,0.85)' }}
    >
      <div className="card max-w-lg w-full max-h-screen overflow-y-auto animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-night-500">
          <h2 className="text-2xl font-black text-gradient">Como Jogar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-night-700 border border-night-500 flex items-center justify-center text-xl">
                {step.icon}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{step.title}</h3>
                <p className="text-gray-400 text-sm mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mx-6 mb-6 p-4 bg-night-700 rounded-xl border border-gold-700">
          <p className="text-gold-400 text-sm font-semibold">💡 Dica</p>
          <p className="text-gray-300 text-sm mt-1">
            Jogadores com alto <strong className="text-gold-400">Peso Champions</strong> (⭐) são mais decisivos
            nos grandes palcos. Equilibre qualidade com experiência europeia para maximizar suas chances!
          </p>
        </div>

        {/* Close button */}
        <div className="px-6 pb-6">
          <button onClick={onClose} className="btn-gold w-full">
            Entendido, vamos jogar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
