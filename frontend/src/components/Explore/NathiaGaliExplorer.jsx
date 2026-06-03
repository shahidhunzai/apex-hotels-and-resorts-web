import React from 'react';

const destinations = [
  {
    name: "BATAKUNDI",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    feature: true,
    button: true,
  },
  {
    name: "GALI'S END BY ROOMY",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200",
    subtext: "ROOMY",
  },
  {
    name: "MOUNTAIN TOP RESORT",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200",
  },
  {
    name: "NORTHRIDGE BY ROOMY",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200",
  },
];

const NathiaGaliExplorer = () => {
  return (
    <div className="min-h-screen bg-[#1a1f2e] font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="text-3xl font-bold text-white tracking-wide">NATHIA GALI</div>
        <div className="text-lg font-semibold text-white uppercase tracking-widest">EXPLORE</div>
      </div>
      {/* Cards Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-6 animate-fade-in">
          {/* Feature Card */}
          <div className="col-span-1 md:col-span-2 relative h-72 md:h-96 rounded-xl overflow-hidden shadow-lg group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <img src={destinations[0].image} alt={destinations[0].name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 flex flex-col justify-center items-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg tracking-wide">{destinations[0].name}</div>
              <button className="mt-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 backdrop-blur-sm transition hover:bg-white/20 hover:text-white hover:scale-105">EXPLORE</button>
            </div>
          </div>
          {/* Other Cards */}
          {destinations.slice(1).map((dest, idx) => (
            <div key={dest.name} className="relative h-64 rounded-xl overflow-hidden shadow-lg group transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 flex flex-col justify-center items-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg tracking-wide">{dest.name}</div>
                {dest.subtext && <div className="text-sm font-semibold text-white/80 mb-2">{dest.subtext}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NathiaGaliExplorer;
