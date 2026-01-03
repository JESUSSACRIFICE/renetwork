"use client";

interface AdSpaceProps {
  className?: string;
}

export default function AdSpace({ className }: AdSpaceProps) {
  return (
    <div className={`relative w-full h-[250px] rounded-xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">📊</span>
            </div>
            <span className="text-white/90 text-xs font-medium">Advertisement Space</span>
          </div>
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
        Advertise Here
      </div>
    </div>
  );
}

