"use client";

interface AdBlockProps {
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  badgeText: string;
  badgeColor: string;
  icon: string;
}

export const AdBlock = ({
  gradientFrom,
  gradientVia,
  gradientTo,
  badgeText,
  badgeColor,
  icon,
}: AdBlockProps) => {
  return (
    <div className="relative w-full lg:w-[180px] h-[200px] sm:h-[250px] rounded-xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} z-0`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        {/* Placeholder for ad image - replace with actual image */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">{icon}</span>
            </div>
            <span className="text-white/90 text-xs font-medium">Advertisement Space</span>
          </div>
        </div>
      </div>
      <div className={`absolute top-3 left-3 bg-white/90 backdrop-blur-md ${badgeColor} text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10`}>
        {badgeText}
      </div>
    </div>
  );
};


