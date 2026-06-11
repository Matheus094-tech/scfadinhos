import React from 'react';

interface HomeScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onHowToPlay }) => {
  return (
    <div className="min-h-screen bg-night-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.2,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Stadium glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 rounded-t-full"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1/2 h-1/4 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
        {/* Trophy + UCL stars */}
        <div className="flex items-center gap-3">
          <span className="text-gold-400 text-sm tracking-widest uppercase font-semibold opacity-70">
            ★ ★ ★
          </span>
          <span className="text-5xl animate-bounce-in">🏆</span>
          <span className="text-gold-400 text-sm tracking-widest uppercase font-semibold opacity-70">
            ★ ★ ★
          </span>
        </div>

        {/* Title */}
        <div className="animate-slide-up">
          <h1 className="text-gradient text-5xl md:text-7xl font-black leading-none tracking-tight">
            Noites
          </h1>
          <h1 className="text-gradient text-5xl md:text-7xl font-black leading-none tracking-tight">
            Europeias
          </h1>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-none tracking-tight mt-1">
            Draft
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-night-500 text-lg md:text-xl max-w-md animate-fade-in" style={{ color: '#8899aa' }}>
          Monte seu XI dos sonhos com os maiores craques da história da Champions League
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up">
          <button
            onClick={onStart}
            className="btn-gold text-lg px-10 py-4 glow-gold"
          >
            ⚽ Começar Draft
          </button>
          <button
            onClick={onHowToPlay}
            className="btn-outline text-lg px-10 py-4"
          >
            Como Jogar
          </button>
        </div>

        {/* Decorative footer */}
        <div className="flex items-center gap-4 opacity-40 mt-4">
          <div className="h-px w-16 bg-gold-600" />
          <span className="text-gold-600 text-xs tracking-widest uppercase">Champions League Draft</span>
          <div className="h-px w-16 bg-gold-600" />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
