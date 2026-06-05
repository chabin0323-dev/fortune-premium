import React, { useState, useEffect } from 'react';

const DIRECTIONS = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
const L_ITEMS = ["天然石のブレスレット", "銀のブックマーク", "シルクのハンカチ", "アンティークの鍵", "革のパスケース", "クリスタルの置物", "手書きのメッセージ", "お気に入りの万年筆"];
const L_COLORS = ["ミッドナイトネイビー", "シャンパンゴールド", "パールホワイト", "ローズマダー", "セージグリーン", "テラコッタ", "ライラック", "コバルトブルー"];

const STARS_BG = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: (i % 3) + 1,
  delay: `${(i * 0.15) % 3}s`,
  duration: `${((i * 0.31) % 2) + 1.5}s`,
  opacity: ((i % 5) + 3) / 10,
}));

const LOADING_MSGS = ['運命の星を解析中...', '生命エネルギーを計測中...', '宿命のパターンを読み解き中...', '鑑定書を作成中...'];

const textShadow = { textShadow: '0 2px 4px rgba(0,0,0,0.9)' };
const cardBg = "bg-[#0a0518] border border-purple-500/20 rounded-3xl p-6 shadow-2xl text-left";
const titleColor = "text-yellow-300 font-bold";
const textColor = "text-gray-200";

const ScoreGauge = ({ score }: { score: number }) => {
  const pct = Math.min(99, Math.max(0, score));
  const color = pct >= 83 ? '#22d3ee' : pct >= 66 ? '#a78bfa' : pct >= 48 ? '#fbbf24' : pct >= 29 ? '#f97316' : '#ef4444';
  const circumference = 2 * Math.PI * 50;
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="130" height="130" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1e1b4b" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-3xl font-bold text-white">{pct}</div>
          <div className="text-[10px] text-gray-400">/ 100</div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">総合運気スコア</p>
    </div>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState<'SPLASH' | 'INPUT' | 'RESULT'>('SPLASH');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [splashPhase, setSplashPhase] = useState(0);
  const [targetDate, setTargetDate] = useState<'今日' | '明日'>('今日');
  const [isLocked, setIsLocked] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fortuneResult, setFortuneResult] = useState<any>(null);
  const [nameVal, setNameVal] = useState('');
  const [yVal, setYVal] = useState('不明');
  const [mVal, setMVal] = useState('不明');
  const [dVal, setDVal] = useState('不明');
  const [btVal, setBtVal] = useState('不明');
  const [csVal, setCsVal] = useState('不明');
  const [zdVal, setZdVal] = useState('不明');

  useEffect(() => {
    if (page !== 'SPLASH') return;
    const t1 = setTimeout(() => setSplashPhase(1), 300);
    const t2 = setTimeout(() => setSplashPhase(2), 1200);
    const t3 = setTimeout(() => setPage('INPUT'), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [page]);

  useEffect(() => {
    const saved = localStorage.getItem('starme_v1');
    if (saved) {
      const d = JSON.parse(saved);
      setNameVal(d.name || '');
      setYVal(d.y); setMVal(d.m); setDVal(d.d);
      setBtVal(d.bt); setCsVal(d.cs); setZdVal(d.zd);
      setIsLocked(true);
    }
  }, []);

  const getDailyGeneralComment = (stars: number, seed: number) => {
    const db: Record<number, string[]> = {
      5: [
        "珍しく全ての星が整列しています。しかしこれは一時的なもの。この好機を掴めるかどうかは、あなたが日頃の怠慢を脱せるかにかかっています。チャンスは待ってくれません。今すぐ動いてください。",
        "最高峰の運気が訪れています。ただし、これまでの努力があってこその開花です。何もしていないなら、この運気もただ通り過ぎるだけ。具体的な行動なくして、奇跡は起きません。",
      ],
      4: [
        "運気は高水準にありますが、油断は最大の敵です。あなたには自分の実力を過大評価する傾向がある。今日は謙虚さを忘れず、確実な一手を積み重ねてください。",
        "良い流れの中にいますが、それに甘えてはいけません。周囲はあなたの行動をよく見ています。言葉より行動で示す日にしてください。",
      ],
      3: [
        "可もなく不可もない平凡な運気です。何も変えなければ、明日も同じ景色が続くでしょう。現状に満足しているなら話は別ですが、本当にそれで良いのか、自問してください。",
        "普通の一日です。普通であることは安心ではありません。停滞は後退の始まりです。小さくても良い、何か一つ前進することを意識してください。",
      ],
      2: [
        "運気は明らかに低迷しています。これは偶然ではなく、これまでの選択の積み重ねが招いた結果かもしれません。言い訳を探すより、何が問題なのかを直視する勇気を持ってください。",
        "エネルギーの流れが乱れています。感情的な判断や衝動的な行動は厳禁です。今の自分の状態を冷静に認め、一歩引いて全体像を見直すことが急務です。",
      ],
      1: [
        "今日は厳しい現実を突きつけられる可能性があります。しかしそれは宇宙があなたに与えた試練であり、逃げることはできません。痛みを受け入れ、そこから学ぶことが唯一の正解です。無理に動かず、静かに自分を見つめ直してください。",
        "底を打っています。これ以上悪くなることはそうありませんが、自分を被害者だと思っていては何も変わりません。今こそ、自分の言動を徹底的に振り返る時です。",
      ],
    };
    const list = db[stars] || db[3];
    return list[seed % list.length];
  };

  const getSynchronizedComment = (type: string, stars: number) => {
    const db: Record<string, string[]> = {
      money: [
        "散財の傾向が見られます。衝動買いや見栄のための出費は今すぐやめてください。",
        "金運は低迷中。収入より支出が気になる状態です。家計を見直すことを強くお勧めします。",
        "金運は普通ですが、あなたはお金に無頓着すぎる傾向があります。もっと真剣に向き合って。",
        "財運は上向きです。ただし、ギャンブル的な判断は厳禁。堅実な選択が吉です。",
        "金運は絶好調。しかし浮かれてはいけません。このタイミングでの無駄遣いは後悔の元です。",
      ],
      health: [
        "体が悲鳴を上げています。無理を続けてきた結果です。今すぐ休息を取らないと、深刻な影響が出かねません。",
        "体調不良の予兆があります。不規則な生活習慣が原因の可能性が高い。自分の身体を軽視しないでください。",
        "健康状態は普通ですが、油断は禁物。あなたは健康管理が苦手な傾向があります。",
        "体のエネルギーは良好です。ただし、過信して無理をすると一気に崩れます。ペースを守って。",
        "生命力は最高潮ですが、この状態がいつまでも続くわけではありません。今のうちに良い習慣を固めてください。",
      ],
      love: [
        "恋愛運は厳しい状況です。相手への依存や自己中心的な言動が関係を傷つけているかもしれません。",
        "恋愛の流れは停滞気味。自分磨きを後回しにしてきた結果が出ています。内面から変えてください。",
        "恋愛運は平均的。しかし「待っていれば来る」という受け身の姿勢は通用しません。",
        "恋愛に良い兆しがあります。ただし、過去の失敗パターンを繰り返さないよう注意してください。",
        "恋愛運は最高潮。ただし、浮かれて本質を見誤らないように。相手の言葉より行動を見てください。",
      ],
      work: [
        "仕事運は最低水準。現状に甘えている間に、周囲はどんどん進んでいます。危機感を持ってください。",
        "仕事の流れが滞っています。他者のせいにしている限り、状況は変わりません。まず自分から。",
        "仕事運は普通。ただし、現状維持は退化と同じです。一つでも良い、新しいことに挑戦してください。",
        "仕事運は上向き。今がチャンスですが、準備不足のまま動いても空振りに終わります。",
        "仕事運は絶好調。この波に乗れるかどうかは、あなたがこれまで積み上げてきたものにかかっています。",
      ],
    };
    return db[type][stars - 1];
  };

  const getAdvice = (seed: number) => {
    const list = [
      "今日は何も言い訳をしないと決める。",
      "苦手な人に自分から挨拶する。",
      "先週の自分と比較して、一点でも成長できているか確認する。",
      "やりかけのことを一つ完結させる。",
      "感謝の言葉を声に出して伝える。",
    ];
    return list[seed % list.length];
  };

  const getMonthlyOutlook = (pSeed: number) => {
    const now = new Date();
    const labels = ['低迷', '注意', '普通', '好調', '絶好調'];
    const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-cyan-400'];
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const mSeed = pSeed + d.getFullYear() * 12 + d.getMonth();
      const mStar = Math.max(1, Math.min(5, (mSeed % 5) + 1));
      return { month: `${d.getMonth() + 1}月`, star: mStar, label: labels[mStar - 1], color: colors[mStar - 1] };
    });
  };

  const handleStartFortune = () => {
    if (yVal === '不明' && mVal === '不明' && dVal === '不明' && btVal === '不明' && csVal === '不明' && zdVal === '不明') {
      setErrorMsg('生年月日などの情報を入力してください（最低１つ以上）');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setLoading(true);
    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const iv = setInterval(() => { idx = (idx + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[idx]); }, 750);

    setTimeout(() => {
      clearInterval(iv);
      const baseDate = new Date();
      if (targetDate === '明日') baseDate.setDate(baseDate.getDate() + 1);
      const dSeed = baseDate.getFullYear() + (baseDate.getMonth() + 1) * 31 + baseDate.getDate();
      const pSeed = (yVal + btVal + csVal + zdVal + nameVal).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const totalSeed = pSeed + dSeed;
      const birthBase = yVal === '不明' ? new Date(2000, 0, 1) : new Date(`${yVal}-${mVal === '不明' ? '01' : mVal.padStart(2, '0')}-${dVal === '不明' ? '01' : dVal.padStart(2, '0')}`);

      const getStarByDate = (t: Date, off = 0) => {
        const diff = Math.floor((t.getTime() - birthBase.getTime()) / 86400000);
        const hash = (totalSeed + off * 23 + diff) % 100;
        if (off === 0) { if (hash < 15) return 1; if (hash < 35) return 2; if (hash < 68) return 3; if (hash < 88) return 4; return 5; }
        return Math.max(1, Math.min(5, ((hash + off * 7) % 4) + 2));
      };

      const mainStar = getStarByDate(baseDate);
      const getSyncStar = (o: number) => Math.max(1, Math.min(5, (mainStar === 1 ? 1 : mainStar - 1) + ((totalSeed + o) % 2)));
      const score = Math.min(84, (mainStar - 1) * 15 + 20 + (totalSeed % 12));
      const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
      const weekly = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(baseDate); d.setDate(baseDate.getDate() + i);
        return { date: `${d.getMonth() + 1}/${d.getDate()}`, day: dayLabels[d.getDay()], star: getStarByDate(d, i) };
      });

      setFortuneResult({
        name: nameVal,
        dateStr: `${baseDate.getFullYear()}年${baseDate.getMonth() + 1}月${baseDate.getDate()}日`,
        general: getDailyGeneralComment(mainStar, totalSeed),
        advice: getAdvice(totalSeed),
        score,
        stars: {
          total: mainStar,
          money: { s: getSyncStar(1), c: getSynchronizedComment('money', getSyncStar(1)) },
          health: { s: getSyncStar(2), c: getSynchronizedComment('health', getSyncStar(2)) },
          love: { s: getSyncStar(3), c: getSynchronizedComment('love', getSyncStar(3)) },
          work: { s: getSyncStar(4), c: getSynchronizedComment('work', getSyncStar(4)) },
        },
        lucky: { direction: DIRECTIONS[totalSeed % 8], number: (totalSeed % 9) + 1, item: L_ITEMS[totalSeed % L_ITEMS.length], color: L_COLORS[totalSeed % L_COLORS.length] },
        weekly,
        monthly: getMonthlyOutlook(pSeed),
      });
      setLoading(false); setPage('RESULT'); window.scrollTo(0, 0);
    }, 3200);
  };

  const renderStars = (count: number) => (
    <div className="flex gap-0.5 justify-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < count ? 'text-yellow-400' : 'text-gray-700'} style={textShadow}>★</span>
      ))}
    </div>
  );

  if (page === 'SPLASH') {
    return (
      <div className="min-h-screen bg-[#050212] flex flex-col items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => setPage('INPUT')}>
        {STARS_BG.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{ left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animationDelay: s.delay, animationDuration: s.duration }} />
        ))}

        <div className={`flex flex-col items-center transition-all duration-1000 ${splashPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="relative w-52 h-52 flex items-center justify-center">
            <div className={`absolute w-48 h-48 rounded-full border-2 border-yellow-400 transition-opacity duration-700 ${splashPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}
              style={{ boxShadow: '0 0 24px rgba(250,204,21,0.4)', animation: 'spin 10s linear infinite' }} />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{ left: `${50 + 46 * Math.cos((deg - 90) * Math.PI / 180)}%`, top: `${50 + 46 * Math.sin((deg - 90) * Math.PI / 180)}%`, transform: 'translate(-50%,-50%)', boxShadow: '0 0 8px rgba(250,204,21,0.9)' }} />
            ))}
            <svg width="110" height="110" viewBox="0 0 100 100" className="relative z-10 drop-shadow-[0_0_16px_rgba(124,58,237,0.8)]">
              <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#7c3aed" stroke="#a855f7" strokeWidth="1.5" />
              <polygon points="50,22 57,40 76,40 61,51 67,70 50,59 33,70 39,51 24,40 43,40" fill="#6d28d9" />
              <polygon points="50,32 56,43 50,52 44,43" fill="#c4b5fd" opacity="0.95" />
            </svg>
            <div className="absolute text-yellow-300 text-xl font-bold" style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)' }}>+</div>
          </div>

          <div className={`text-center mt-6 transition-all duration-1000 ${splashPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="text-5xl font-bold text-yellow-400 tracking-widest" style={{ textShadow: '0 0 24px rgba(250,204,21,0.7)' }}>STAR ME</div>
            <div className="text-purple-300 text-sm tracking-widest mt-2">個人運命鑑定</div>
            <div className="text-gray-500 text-[11px] mt-2 tracking-wider">生まれ持った才能と使命を読み解く</div>
          </div>
        </div>

        <button
          className={`absolute bottom-10 transition-all duration-1000 ${splashPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          onClick={() => setPage('INPUT')}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 40%, #a855f7 70%, #f59e0b 100%)',
            backgroundSize: '300% 300%',
            animation: 'float 2.4s ease-in-out infinite, shimmerBg 3s ease infinite, glow 2.4s ease-in-out infinite',
            padding: '18px 44px',
            borderRadius: '60px',
            fontSize: '19px',
            fontWeight: 800,
            color: 'white',
            border: '2px solid rgba(255,255,255,0.35)',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            position: 'relative',
            minWidth: '260px',
          }}
        >
          ✨ タップして開始 ✨
        </button>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
          @keyframes shimmerBg { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 24px rgba(245,158,11,0.7), 0 0 48px rgba(236,72,153,0.4), 0 0 80px rgba(168,85,247,0.2); }
            50% { box-shadow: 0 0 48px rgba(245,158,11,1), 0 0 80px rgba(236,72,153,0.7), 0 0 120px rgba(168,85,247,0.5); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050212] text-gray-200 font-sans flex flex-col items-center pb-20 relative text-center overflow-x-hidden">
      {STARS_BG.slice(0, 30).map((s, i) => (
        <div key={i} className="fixed rounded-full bg-white animate-pulse pointer-events-none"
          style={{ left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity * 0.4, animationDelay: s.delay, animationDuration: s.duration }} />
      ))}

      {errorMsg && (
        <div className="fixed top-24 left-0 w-full z-[100] px-6 pointer-events-none">
          <div className="bg-red-600 text-white px-4 py-4 rounded-2xl shadow-2xl font-bold animate-bounce text-sm mx-auto max-w-xs pointer-events-auto leading-normal">
            ⚠️ {errorMsg}
          </div>
        </div>
      )}

      <div className="mt-8 mb-10 flex items-center justify-center gap-3 relative z-10">
        <button onClick={() => { setSplashPhase(0); setPage('SPLASH'); }} className="flex flex-col items-center">
          <div className="text-2xl font-bold text-yellow-400 tracking-widest" style={{ textShadow: '0 0 16px rgba(250,204,21,0.6)' }}>STAR ME</div>
          <div className="text-[10px] text-purple-400 tracking-widest">個人運命鑑定</div>
        </button>
        <button onClick={() => setShowManual(true)} className="py-1 px-3 rounded-full bg-white/10 border border-white/20 text-[10px] text-purple-200">取扱説明書</button>
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 border-4 border-t-yellow-400 border-purple-500/20 rounded-full animate-spin" />
              <div className="absolute inset-3 border-4 border-t-purple-400 border-white/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-6 border-2 border-t-yellow-200/50 border-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <p className="mt-8 text-yellow-300 tracking-widest animate-pulse font-serif text-sm" style={textShadow}>{loadingMsg}</p>
          </div>
        ) : page === 'INPUT' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white" style={textShadow}>情報を入力して下さい</h2>

            <div className="space-y-2 text-left">
              <p className="text-purple-300 font-bold text-xs">お名前（任意）</p>
              <input type="text" value={nameVal} onChange={e => setNameVal(e.target.value)} disabled={isLocked}
                placeholder="例：山田 花子"
                className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white outline-none placeholder-gray-600 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="space-y-2">
                <p className="text-purple-300 font-bold">生年月日</p>
                <select value={yVal} onChange={e => setYVal(e.target.value)} disabled={isLocked} className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white outline-none appearance-none">
                  <option value="不明">不明</option>
                  {Array.from({ length: 80 }, (_, i) => (2026 - i).toString()).map(v => <option key={v} value={v}>{v}年</option>)}
                </select>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <select value={mVal} onChange={e => setMVal(e.target.value)} disabled={isLocked} className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white appearance-none outline-none">
                  <option value="不明">不明</option>
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(v => <option key={v} value={v}>{v}月</option>)}
                </select>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <select value={dVal} onChange={e => setDVal(e.target.value)} disabled={isLocked} className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white appearance-none outline-none">
                  <option value="不明">不明</option>
                  {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(v => <option key={v} value={v}>{v}日</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="space-y-2">
                <p className="text-purple-300 font-bold">血液型</p>
                <select value={btVal} onChange={e => setBtVal(e.target.value)} disabled={isLocked} className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white appearance-none">
                  <option value="不明">不明</option>
                  {['A型', 'B型', 'O型', 'AB型'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-purple-300 font-bold">星座</p>
                <select value={csVal} onChange={e => setCsVal(e.target.value)} disabled={isLocked} className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white appearance-none">
                  <option value="不明">不明</option>
                  {['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-purple-300 font-bold">干支</p>
                <select value={zdVal} onChange={e => setZdVal(e.target.value)} disabled={isLocked} className="w-full bg-[#0a0518] border border-purple-500/30 rounded-lg p-3 text-white appearance-none">
                  <option value="不明">不明</option>
                  {['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="flex bg-[#0a0518] rounded-xl p-1 border border-purple-500/20">
              <button onClick={() => setTargetDate('今日')} className={`flex-1 py-3 text-xs rounded-lg transition-all ${targetDate === '今日' ? 'bg-purple-700 text-white' : 'text-purple-400'}`}>今日</button>
              <button onClick={() => setTargetDate('明日')} className={`flex-1 py-3 text-xs rounded-lg transition-all ${targetDate === '明日' ? 'bg-purple-700 text-white' : 'text-gray-500'}`}>明日</button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {!isLocked ? (
                <button onClick={() => { localStorage.setItem('starme_v1', JSON.stringify({ name: nameVal, y: yVal, m: mVal, d: dVal, bt: btVal, cs: csVal, zd: zdVal })); setIsLocked(true); }}
                  className="bg-white/5 text-purple-200 text-[10px] py-2 px-6 rounded-lg border border-white/10 shadow-md">入力を固定</button>
              ) : (
                <>
                  <button onClick={() => { localStorage.removeItem('starme_v1'); setIsLocked(false); }} className="bg-red-900/20 text-red-300 text-[10px] py-2 px-4 rounded-lg">解除</button>
                  <button onClick={() => { setNameVal(''); setYVal('不明'); setMVal('不明'); setDVal('不明'); setBtVal('不明'); setCsVal('不明'); setZdVal('不明'); setIsLocked(false); }} className="bg-white/5 text-purple-200 text-[10px] py-2 px-4 rounded-lg border border-white/10">他人を占う</button>
                </>
              )}
            </div>

            <button onClick={handleStartFortune} className="w-full py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-700 via-purple-600 to-yellow-500 shadow-[0_0_24px_rgba(124,58,237,0.6)] active:scale-95 transition-all">
              運命鑑定を開始する
            </button>
          </div>
        ) : (
          <div className="space-y-6 pb-10">
            <div className="p-6 rounded-3xl text-center border border-yellow-500/30 bg-gradient-to-b from-purple-900/50 to-[#0a0518] animate-in fade-in duration-500">
              {fortuneResult.name && <p className="text-yellow-300 text-xl font-bold mb-1">{fortuneResult.name} 様</p>}
              <p className="text-purple-300 text-[11px] font-bold uppercase tracking-widest">個人運命鑑定書</p>
              <p className="text-gray-500 text-[10px] mt-1">{fortuneResult.dateStr}</p>
            </div>

            <div className={`${cardBg} animate-in fade-in duration-700`}>
              <ScoreGauge score={fortuneResult.score} />
            </div>

            <div className={`${cardBg} animate-in fade-in duration-700`}>
              <h3 className={`text-lg mb-4 text-center border-b border-purple-500/20 pb-3 ${titleColor}`}>総合運命判断</h3>
              <div className="flex justify-center mb-5">{renderStars(fortuneResult.stars.total)}</div>
              <p className={`text-[14px] leading-relaxed font-light mb-4 ${textColor}`}>{fortuneResult.general}</p>
              <div className="bg-purple-950/50 p-4 rounded-xl border border-yellow-500/20 text-center">
                <p className="text-[10px] text-yellow-300 font-bold uppercase mb-1">⚡ 今日の課題</p>
                <p className="text-[12px] text-white font-medium">{fortuneResult.advice}</p>
              </div>
            </div>

            {/* ぼかしなし・全コンテンツ表示 */}
            <div className="space-y-6">
              <div className={`${cardBg}`}>
                <h3 className={`text-sm mb-1 text-center border-b border-purple-500/20 pb-2 ${titleColor}`}>週間バイオリズム</h3>
                <p className="text-[9px] text-gray-500 text-center mb-5">日付が変わると運気の流れも変化します</p>
                <div className="space-y-3">
                  {fortuneResult.weekly.map((w: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-purple-900/40 border border-yellow-500/30' : 'bg-black/20'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold w-10 ${i === 0 ? 'text-yellow-300' : 'text-gray-400'}`}>{w.date}</span>
                        <span className={`text-xs w-4 ${i === 0 ? 'text-white' : 'text-gray-400'}`}>{w.day}</span>
                      </div>
                      <div>{renderStars(w.star)}</div>
                      <span className="text-[9px] text-yellow-500 uppercase w-8">{i === 0 ? 'Today' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${cardBg}`}>
                <h3 className={`text-sm mb-4 text-center border-b border-purple-500/20 pb-2 ${titleColor}`}>月間運気予報</h3>
                <div className="grid grid-cols-3 gap-3">
                  {fortuneResult.monthly.map((m: any, i: number) => (
                    <div key={i} className="bg-black/30 rounded-xl p-3 text-center border border-purple-500/10">
                      <p className="text-gray-400 text-[10px] mb-2">{m.month}</p>
                      <div className="flex justify-center mb-2">{renderStars(m.star)}</div>
                      <p className={`text-[10px] font-bold ${m.color}`}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {[
                { label: '金運', color: 'text-yellow-400', data: fortuneResult.stars.money },
                { label: '健康運', color: 'text-emerald-400', data: fortuneResult.stars.health },
                { label: '恋愛運', color: 'text-pink-400', data: fortuneResult.stars.love },
                { label: '仕事運', color: 'text-cyan-400', data: fortuneResult.stars.work },
              ].map((u, i) => (
                <div key={i} className={`${cardBg}`}>
                  <div className="flex justify-between items-center mb-3">
                    <p className={`font-bold text-sm ${u.color}`}>{u.label}</p>
                    <div className="flex gap-0.5">{renderStars(u.data.s)}</div>
                  </div>
                  <p className={`text-[12px] leading-relaxed font-light ${textColor}`}>{u.data.c}</p>
                </div>
              ))}

              <div className={`${cardBg}`}>
                <h3 className={`text-sm mb-4 text-center border-b border-purple-500/20 pb-2 ${titleColor}`}>本日のラッキー指針</h3>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  {[
                    { label: 'カラー', value: fortuneResult.lucky.color },
                    { label: 'アイテム', value: fortuneResult.lucky.item },
                    { label: '方角', value: fortuneResult.lucky.direction },
                    { label: 'ラッキーナンバー', value: fortuneResult.lucky.number },
                  ].map((l, i) => (
                    <div key={i} className="bg-purple-950/50 p-3 rounded-xl flex flex-col items-center gap-1 border border-purple-500/20">
                      <span className="text-purple-400">{l.label}</span>
                      <span className="text-white font-bold text-center">{l.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => { setPage('INPUT'); window.scrollTo(0, 0); }} className="w-full py-4 rounded-xl bg-white/10 border border-white/20 text-purple-200 text-xs tracking-widest mt-6">
              戻る
            </button>
          </div>
        )}
      </div>

      {showManual && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowManual(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#0a0518] border border-purple-500/30 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-left text-sm text-purple-100 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-yellow-300 mb-5 border-b border-purple-500/20 pb-2 text-center font-serif">鑑定マニュアル</h3>
            <div className="space-y-5 text-[13px] leading-relaxed">
              <div>
                <p className="text-yellow-300 font-bold mb-1">基本的な使い方</p>
                <p>1. 生年月日など、どれか一つでも入力すれば鑑定可能です。</p>
                <p>2. お名前を入力すると、あなた専用の鑑定書が生成されます。</p>
                <p>3. 辛口鑑定で、より的確な本音アドバイスをお届けします。</p>
              </div>
              <div>
                <p className="text-yellow-300 font-bold mb-1">鑑定結果の特徴</p>
                <p>この鑑定結果は、入力された情報をもとに一貫したロジックで生成されています。同じ条件なら同じ結果になり、日付が変わればその日の流れに応じて内容も変化します。</p>
              </div>
              <div>
                <p className="text-yellow-300 font-bold mb-1">プライバシー</p>
                <p>ご入力いただいた情報はクラウド上には保存されず、お使いのスマートフォンやブラウザ内部にのみ保持されます。外部に個人情報を残さない設計のため、プライバシー面でも安心してお使いいただけます。</p>
              </div>
            </div>
            <button onClick={() => setShowManual(false)} className="mt-6 w-full py-3 bg-gradient-to-r from-purple-700 to-yellow-500 rounded-xl font-bold text-white shadow-lg">閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
