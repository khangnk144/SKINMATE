'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';

interface AnalysisResult {
  originalName: string;
  mappedName: string;
  effect: 'GOOD' | 'BAD' | 'NEUTRAL';
  description?: string | null;
}

interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
  score: number;
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin"></div>
          <p className="mt-4 font-serif text-slate-400 tracking-widest uppercase text-xs">Đang tải trải nghiệm...</p>
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInci = searchParams?.get('inci') || '';

  const [inciString, setInciString] = useState(initialInci);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  const { user, token } = useAuth();

  const fetchRecommendations = async (ingredients: string[] = []) => {
    setRecLoading(true);
    try {
      const query = ingredients.length > 0 ? `?ingredients=${encodeURIComponent(ingredients.join(','))}` : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/recommendations${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setRecLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-stone-50 px-4 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[120px] -z-10"></div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] max-w-md w-full text-center">
          <h2 className="text-4xl font-serif mb-6 text-slate-800 tracking-tight">Truy Cập Bị Hạn Chế</h2>
          <p className="mb-10 text-slate-500 font-light leading-relaxed">
            Để mở khóa phân tích thành phần cao cấp và đề xuất cá nhân hóa, vui lòng đăng nhập vào tài khoản của bạn.
          </p>
          <Link href="/login" className="block w-full py-4 bg-slate-900 text-white text-sm font-medium tracking-[0.2em] uppercase rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            Đăng Nhập
          </Link>
          <div className="mt-8">
            <Link href="/register" className="text-sm text-slate-400 hover:text-rose-400 transition-colors tracking-wide">
              Chưa có tài khoản? <span className="underline underline-offset-4 decoration-rose-200">Tham gia Skinmate</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    if (!inciString.trim()) {
      setError('Vui lòng nhập một số thành phần để phân tích.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/analysis/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inciString }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Phân tích thành phần thất bại');
      }

      const data = await response.json();
      setResults(data);

      if (data.length > 0) {
        const ingredients = data.map((r: any) => r.mappedName);
        fetchRecommendations(ingredients);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi trong quá trình phân tích');
    } finally {
      setLoading(false);
    }
  };

  const getEffectClasses = (effect: string) => {
    switch (effect) {
      case 'BAD':
        return 'bg-rose-50/60 text-rose-700 border-rose-100 hover:bg-rose-100/80';
      case 'GOOD':
        return 'bg-emerald-50/60 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80';
      default:
        return 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100';
    }
  };

  return (
    <div className="relative min-h-screen bg-stone-50/50 pb-24">
      {/* Background Blobs */}
      <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-serif text-slate-900 tracking-tight mb-2">Phân Tích</h1>
            <p className="text-slate-400 text-sm tracking-widest uppercase">Thấu hiểu thành phần</p>
          </div>
          <Link href="/" className="group flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-all duration-300">
            <span className="w-8 h-px bg-slate-200 group-hover:w-12 group-hover:bg-rose-300 transition-all duration-500"></span>
            Về Trang Chủ
          </Link>
        </div>

        {/* Main Grid: Image + Analysis Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch min-h-[600px] mb-20">
          {/* Left Column: Aesthetic Image */}
          <div className="relative w-full h-full min-h-[450px] lg:min-h-[650px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <Image 
              src="/images/minimal-beauty-products-composition.jpg" 
              alt="Luxury skincare routine" 
              fill 
              className="object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms]"
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-12 left-12 right-12 text-white">
              <p className="font-serif text-3xl mb-2 tracking-tight">Công Thức Tinh Khiết</p>
              <p className="text-white/80 text-sm tracking-widest uppercase font-light">Được tạo ra cho làn da độc đáo của bạn</p>
            </div>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 md:p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full border border-rose-100 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.15em]">Cá nhân hóa cho da {user.skinType}</span>
                </div>
                <h2 className="text-3xl font-serif text-slate-800 mb-4 tracking-tight">Kiểm Tra Thành Phần</h2>
                <p className="text-slate-500 font-light leading-relaxed">
                  Dán danh sách INCI của bạn bên dưới. Chúng tôi sẽ đối chiếu từng thành phần với hồ sơ của bạn để đảm bảo an toàn và hiệu quả tuyệt đối.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Danh sách INCI</label>
                  <textarea
                    className="w-full h-56 p-8 bg-stone-50/50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50 focus:border-rose-200 focus:bg-white transition-all resize-none text-slate-700 text-lg font-light leading-relaxed placeholder:text-slate-300"
                    placeholder="Water, Glycerin, Niacinamide..."
                    value={inciString}
                    onChange={(e) => setInciString(e.target.value)}
                  />
                </div>

                {/* Improved Profile & Mode Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Hồ Sơ Của Bạn</label>
                    <div className="w-full min-h-[60px] px-6 py-4 bg-stone-50/50 border border-slate-100 rounded-2xl text-slate-600 text-sm font-medium flex items-center justify-between gap-4 group-hover:bg-white group-hover:border-rose-100 transition-all duration-300">
                      <span className="truncate uppercase tracking-wider">{user.skinType}</span>
                      <Link href="/profile" className="flex-shrink-0 text-rose-400 text-xs font-bold hover:text-rose-500 underline underline-offset-4 decoration-rose-200">Thay Đổi</Link>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Chế Độ Phân Tích</label>
                    <div className="w-full min-h-[60px] px-6 py-4 bg-stone-50/50 border border-slate-100 rounded-2xl text-slate-600 text-sm font-medium flex items-center group-hover:bg-white group-hover:border-emerald-100 transition-all duration-300">
                      <span className="truncate">An Toàn & Hiệu Quả</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-rose-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0116 0z"></path></svg>
                    {error}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`group relative mt-10 w-full py-5 rounded-[2rem] overflow-hidden transition-all duration-500 ${
                loading ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-300/20 to-emerald-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative text-white text-sm font-semibold tracking-[0.25em] uppercase flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Chạy Phân Tích
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-4xl font-serif text-slate-800 mb-4 tracking-tight">Kết Quả Phân Tích</h2>
              <div className="h-1 w-20 bg-rose-100 rounded-full"></div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md p-10 md:p-16 rounded-[4rem] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex flex-wrap justify-center gap-4">
                {results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIngredient(result)}
                    className={`px-8 py-3 rounded-full border text-xs font-semibold tracking-widest uppercase transition-all duration-500 hover:-translate-y-1 hover:shadow-md active:scale-95 ${getEffectClasses(
                      result.effect
                    )}`}
                  >
                    {result.originalName}
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="py-12 text-center w-full">
                    <p className="text-slate-400 font-serif italic text-xl">Không phát hiện thành phần nào trong danh sách.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-12 pt-8 border-t border-stone-100 text-center">
                <p className="text-slate-400 text-xs tracking-widest uppercase font-bold">Nhấp vào một thành phần để xem thông tin chi tiết</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {results && (
          <div className="animate-in fade-in duration-1000">
            <div className="flex flex-col items-center mb-16">
              <p className="text-rose-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4">Lựa Chọn Tuyển Tập</p>
              <h2 className="text-5xl font-serif text-slate-800 tracking-tight">Đề Xuất Cho Bạn</h2>
            </div>

            {recLoading ? (
              <div className="flex flex-col items-center justify-center p-20">
                <div className="w-16 h-16 border-b-2 border-rose-300 rounded-full animate-spin"></div>
                <p className="mt-8 font-serif text-slate-400 italic">Đang tìm kiếm sản phẩm tương thích...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {recommendations.map((product) => (
                  <div key={product.id} className="hover:-translate-y-2 transition-transform duration-500">
                    <ProductCard name={product.name} brand={product.brand} imageUrl={product.imageUrl} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm p-20 rounded-[3rem] border border-white/40 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-12 h-12 text-stone-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  <p className="text-slate-500 text-xl font-serif italic mb-2">Chờ Tương Thích</p>
                  <p className="text-slate-400 text-sm font-light">Chúng tôi không thể tìm thấy sản phẩm hoàn hảo cho hồ sơ da và thành phần hiện tại của bạn. Hãy thử khám phá danh mục của chúng tôi.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ingredient Detail Modal */}
        {selectedIngredient && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-500" onClick={() => setSelectedIngredient(null)}>
            <div 
              className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.12)] p-12 md:p-16 max-w-2xl w-full transform transition-all animate-in zoom-in-95 duration-500 border border-stone-50 overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative Blob in Modal */}
              <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-20 -mr-20 -mt-20 ${
                selectedIngredient.effect === 'GOOD' ? 'bg-emerald-400' : selectedIngredient.effect === 'BAD' ? 'bg-rose-400' : 'bg-slate-400'
              }`}></div>

              <div className="relative">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`w-2 h-2 rounded-full ${
                        selectedIngredient.effect === 'GOOD' ? 'bg-emerald-400' : selectedIngredient.effect === 'BAD' ? 'bg-rose-400' : 'bg-slate-400'
                      }`}></span>
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Thông Tin Thành Phần</span>
                    </div>
                    <h3 className="text-4xl font-serif text-slate-800 capitalize leading-tight tracking-tight">{selectedIngredient.mappedName}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedIngredient(null)}
                    className="text-slate-300 hover:text-slate-800 transition-colors p-3 rounded-full hover:bg-stone-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="mb-10">
                  <span className={`inline-flex items-center px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border ${
                    selectedIngredient.effect === 'GOOD' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    selectedIngredient.effect === 'BAD' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                    'bg-stone-50 text-slate-500 border-stone-100'
                  }`}>
                    Đánh giá an toàn: {selectedIngredient.effect === 'GOOD' ? 'Tốt' : selectedIngredient.effect === 'BAD' ? 'Xấu' : 'Trung bình'}
                  </span>
                </div>

                <div className="space-y-6">
                  <p className="text-slate-600 font-light leading-[1.8] text-xl">
                    {selectedIngredient.description || 'Cơ sở dữ liệu lâm sàng của chúng tôi hiện đang được cập nhật với phân tích chi tiết cho thành phần cụ thể này. Vui lòng quay lại sau để xem thông tin sâu hơn.'}
                  </p>
                  
                  <div className="pt-8 mt-8 border-t border-stone-100">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">Hành Động Khuyến Nghị</p>
                    <p className="text-slate-500 text-sm mt-2">
                      {selectedIngredient.effect === 'BAD' ? 'Chúng tôi khuyên bạn nên tránh các sản phẩm có thành phần này do độ nhạy cảm của da bạn.' : 
                       selectedIngredient.effect === 'GOOD' ? 'Thành phần này rất tương thích với loại da của bạn và sẽ mang lại lợi ích đáng kể.' : 
                       'Thành phần này nói chung là an toàn cho hầu hết người dùng có hồ sơ của bạn.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
