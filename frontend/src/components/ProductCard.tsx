import Image from 'next/image';

interface ProductCardProps {
  name: string;
  brand: string;
  imageUrl?: string | null;
}

export const ProductCard = ({ name, brand, imageUrl }: ProductCardProps) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden border border-white/40 flex flex-col h-full hover:-translate-y-2">
      <div className="w-full h-64 bg-stone-50 relative overflow-hidden">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-rose-100 bg-stone-50/50">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700"></div>
      </div>
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-[14px] font-black text-rose-400 uppercase tracking-[0.25em] mb-3">{brand}</p>
          <h2 className="text-3xl font-serif text-slate-800 leading-tight tracking-tight group-hover:text-rose-900 transition-colors">{name}</h2>
        </div>
        <div className="mt-8 flex items-center justify-between">
           <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Chi tiết</span>
           <div className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
           </div>
        </div>
      </div>
    </div>
  );
};

