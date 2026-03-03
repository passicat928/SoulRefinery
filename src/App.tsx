/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle,
  Sparkles, 
  Send, 
  Coffee, 
  Skull, 
  Ghost, 
  Zap, 
  RefreshCw,
  Quote,
  Loader2,
  Twitter,
  Facebook,
  Instagram,
  AtSign,
  Mail,
  Share2,
  Check,
  Copy,
  Flame,
  Wind,
  Droplets,
  Hammer,
  BookOpen,
  Users,
  Eye,
  HelpCircle,
  Heart,
  Scale,
  Trash2,
  Compass,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Home,
  Dices,
  ExternalLink,
  Utensils,
  Dumbbell,
  Ticket,
  Flower2,
  Cross,
  BookOpen,
  Info,
  Award,
  Palette,
  BarChart3,
  Download,
  Upload,
  History as HistoryIcon,
  Star,
  X,
  Shirt,
  GraduationCap,
  Wand2,
  Crown,
  Glasses,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, db, signInAnon, linkWithGoogle } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ACHIEVEMENTS = [
  { id: 'first_ritual', name: '初入煉金', description: '完成第一次心靈淨化', icon: Sparkles, color: 'text-amber-400' },
  { id: 'word_master', name: '文字修行者', description: '累計淨化超過 1000 個字', icon: BookOpen, color: 'text-blue-400' },
  { id: 'level_10', name: '靈魂覺醒', description: '靈魂等級達到 LV.10', icon: Award, color: 'text-purple-400' },
  { id: 'style_explorer', name: '風格大師', description: '嘗試過所有煉金風格', icon: Compass, color: 'text-emerald-400' },
];

const RANDOM_COMPLAINTS = [
  "老闆在下班前 5 分鐘突然說要開會，而且沒說什麼時候結束。",
  "剛買的咖啡，第一口就灑在白襯衫上，等一下還要見客戶。",
  "同事在辦公室吃韭菜水餃，味道久久不去，還一直找我說話。",
  "電腦更新到一半突然當機，剛寫好的報告沒存檔就消失了。",
  "下雨天好不容易等到公車，結果司機沒看到我直接開走，濺了我一身水。",
  "明明是週末，客戶卻在群組一直標記我，問一些根本不急的小事。",
  "外送等了一個小時，送來的時候發現湯全灑了，主餐還是冷的。",
  "在電梯裡遇到最不想見到的主管，電梯還每一層都停。",
  "薪水才剛入帳，繳完房租、水電、信用卡費後就只剩幾千塊了。",
  "昨晚明明設了三個鬧鐘，結果今天早上一個都沒響，醒來已經遲到半小時。",
  "去健身房發現忘了帶運動鞋，只能穿著皮鞋在旁邊尷尬地看。",
  "便利商店最後一個御飯糰被前面的人拿走了，我明明盯著它看了三秒。",
  "耳機線又纏在一起了，解開它花了我整整十分鐘的人生。",
  "明明沒買什麼，去超市結帳竟然要兩千塊，通膨真的太可怕了。",
  "手機螢幕剛修好，結果一拿出來就手滑，又裂了一道痕跡。"
];

const TRENDING_TOPICS = [
  { id: 'ai', label: 'AI 焦慮', icon: Sparkles, color: 'text-cyan-400' },
  { id: 'monday', label: '週一症候群', icon: Coffee, color: 'text-amber-400' },
  { id: 'inflation', label: '通膨地獄', icon: Scale, color: 'text-red-400' },
  { id: 'burnout', label: '職場倦怠', icon: Flame, color: 'text-orange-400' },
  { id: 'social', label: '社恐日常', icon: Users, color: 'text-indigo-400' }
];

const STYLES = [
  { id: 'soup', name: '心靈雞湯', icon: Coffee, color: 'text-amber-200', prompt: '溫暖、正向、充滿希望的雞湯風格，像是一位溫柔的長輩在安慰你。', gesture: '畫一個愛心', gestureHint: '用愛心化解憂愁', gestureType: 'heart' },
  { id: 'scold', name: '毒舌開示', icon: Zap, color: 'text-red-400', prompt: '辛辣、直接、一針見血的毒舌風格，用最狠的話點醒夢中人。', gesture: '畫一個閃電', gestureHint: '用雷霆擊碎幻象', gestureType: 'lightning' },
  { id: 'black', name: '黑色幽默', icon: Ghost, color: 'text-purple-400', prompt: '荒誕、諷刺、帶點無奈的黑色幽默，融合當前網路迷因與流行梗，讓人在苦笑中看透人生。', gesture: '畫一個漩渦', gestureHint: '在荒謬中起舞', gestureType: 'spiral' },
  { id: 'hell', name: '地獄梗', icon: Skull, color: 'text-zinc-400', prompt: '極端、政治不正確、挑戰道德邊緣的地獄梗，用最地獄的方式消解痛苦。', gesture: '畫一個叉叉', gestureHint: '否定這該死的世界', gestureType: 'x' },
  { id: 'socrates', name: '蘇格拉底', icon: HelpCircle, color: 'text-blue-300', prompt: '蘇格拉底式的反詰法，透過不斷提問引導使用者發現自己思維中的矛盾或邏輯謬誤。', gesture: '畫一個問號', gestureHint: '質疑一切的開端', gestureType: 'question' },
  { id: 'grandma', name: '阿嬤開示', icon: Heart, color: 'text-pink-300', prompt: '充滿慈愛與包容的阿嬤風格，溫暖、囉唆但充滿真誠的關懷，像是在家裡喝一碗熱湯。', gesture: '畫一個圓圈', gestureHint: '畫出圓滿的關懷', gestureType: 'circle' },
  { id: 'realism', name: '現實主義', icon: Scale, color: 'text-emerald-300', prompt: '冷酷且實際的現實主義風格，不給予虛假的安慰，只提供最直白、最殘酷的現況分析與生存建議。', gesture: '畫一條橫線', gestureHint: '劃清現實的界線', gestureType: 'line' },
  { id: 'buddhist', name: '佛系開示', icon: Flower2, color: 'text-orange-300', prompt: '慈悲、平靜、充滿禪意的佛教風格。請以「施主」稱呼使用者，並在回答中加入一段適合當下情境的佛經（如心經、金剛經）或佛家偈語，引導其放下執著。', gesture: '畫一個圓圈', gestureHint: '畫出空性的圓滿', gestureType: 'circle' },
  { id: 'christian', name: '福音指引', icon: Cross, color: 'text-sky-300', prompt: '溫暖、堅定、充滿信心的基督教風格。請以「親愛的弟兄姊妹」稱呼使用者，並在回答中務必引用一段相關的聖經金句（Bible Verse），並清楚標註章節編號（例如：約翰福音 3:16），傳遞上帝的愛與力量。', gesture: '畫一個十字架', gestureHint: '背起你的十字架', gestureType: 'cross' },
  { id: 'musk', name: '馬斯克開示', icon: Zap, color: 'text-cyan-400', prompt: '狂妄、科技感十足、充滿第一性原理的馬斯克風格。語氣要像是正在火星殖民計畫的簡報現場，充滿對未來的野心與對平庸的鄙視。', gesture: '畫一個閃電', gestureHint: '啟動第一性原理', gestureType: 'lightning', minLevel: 5 },
];

const AVATAR_ITEMS = [
  { id: 'apprentice_robe', name: '學徒長袍', type: 'body', icon: Shirt, color: 'text-slate-400', description: '初入煉金之門的標準配備。', requirement: '預設解鎖' },
  { id: 'alchemist_hat', name: '煉金術士帽', type: 'head', icon: GraduationCap, color: 'text-indigo-400', description: '象徵著你已經掌握了基礎的轉化法則。', requirement: '完成 3 次幸運啟示', reqValue: 3 },
  { id: 'mystic_monocle', name: '神秘單片鏡', type: 'face', icon: Glasses, color: 'text-amber-400', description: '能看穿物質表象，直視靈魂深處。', requirement: '完成 5 次幸運啟示', reqValue: 5 },
  { id: 'golden_staff', name: '黃金法杖', type: 'hand', icon: Wand2, color: 'text-yellow-400', description: '凝聚了大量的正面能量，能加速淨化過程。', requirement: '完成 10 次幸運啟示', reqValue: 10 },
  { id: 'phoenix_cloak', name: '鳳凰披風', type: 'body', icon: Ghost, color: 'text-red-500', description: '浴火重生，象徵著靈魂的終極昇華。', requirement: '完成 20 次幸運啟示', reqValue: 20 },
  { id: 'crown_of_wisdom', name: '智慧王冠', type: 'head', icon: Crown, color: 'text-amber-300', description: '只有真正的煉金大師才能配戴的榮耀。', requirement: '靈魂等級達到 LV.15', reqValue: 15, reqType: 'level' },
];

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

const AvatarDisplay = ({ equippedItems, itemColors, level = 1, size = 'md', className }: { equippedItems: any, itemColors?: Record<string, string>, level?: number, size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const [reaction, setReaction] = useState<'none' | 'jump' | 'spin' | 'shake'>('none');
  const sizes = {
    sm: { container: 'w-12 h-12', base: 'w-8 h-8', head: 'w-5 h-5', face: 'w-3 h-3', body: 'w-6 h-6', hand: 'w-4 h-4', wing: 'w-6 h-6', horn: 'w-2 h-2', ear: 'w-2 h-2' },
    md: { container: 'w-24 h-24', base: 'w-16 h-16', head: 'w-10 h-10', face: 'w-6 h-6', body: 'w-12 h-12', hand: 'w-8 h-8', wing: 'w-12 h-12', horn: 'w-4 h-4', ear: 'w-4 h-4' },
    lg: { container: 'w-48 h-48', base: 'w-32 h-32', head: 'w-20 h-20', face: 'w-12 h-12', body: 'w-24 h-24', hand: 'w-16 h-16', wing: 'w-24 h-24', horn: 'w-8 h-8', ear: 'w-8 h-8' }
  };
  
  const s = sizes[size];
  const evolutionScale = 1 + Math.min(0.3, (level - 1) * 0.02);

  const handleInteraction = () => {
    const reactions: ('jump' | 'spin' | 'shake')[] = ['jump', 'spin', 'shake'];
    const nextReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setReaction(nextReaction);
    setTimeout(() => setReaction('none'), 1000);
  };

  const reactionVariants = {
    none: {},
    jump: { y: [0, -20, 0], transition: { duration: 0.4 } },
    spin: { rotate: [0, 360], transition: { duration: 0.6 } },
    shake: { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } }
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center cursor-pointer group", s.container, className)}
      onClick={handleInteraction}
    >
      {/* Ethereal Glow */}
      <div className={cn("bg-cyan-400/20 rounded-full blur-2xl absolute transition-all duration-500 group-hover:bg-cyan-400/40 group-hover:blur-3xl", s.container)} />
      
      {/* Evolution: Wings (Level 15+) */}
      {level >= 15 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ 
              rotate: [0, -10, 0],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -translate-x-1/2 left-1/4"
          >
            <Wind className={cn(s.wing, "text-cyan-200/40")} />
          </motion.div>
          <motion.div
            animate={{ 
              rotate: [0, 10, 0],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute translate-x-1/2 right-1/4"
          >
            <Wind className={cn(s.wing, "text-cyan-200/40 scale-x-[-1]")} />
          </motion.div>
        </div>
      )}

      {/* Soul Silhouette (Organic Shape) */}
      <motion.div 
        variants={reactionVariants}
        animate={reaction !== 'none' ? reaction : { 
          y: [0, -4, 0],
          scale: [evolutionScale, evolutionScale * 1.02, evolutionScale]
        }}
        transition={reaction === 'none' ? { 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        } : {}}
        className={cn("relative flex flex-col items-center justify-center", s.base)}
      >
        {/* Evolution: Horns (Level 10+) */}
        {level >= 10 && (
          <div className="absolute -top-2 w-full flex justify-center gap-4">
            <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} className="bg-white/40 w-1 h-3 rounded-full blur-[1px] -rotate-12" />
            <motion.div animate={{ rotate: [5, -5, 5] }} transition={{ duration: 2, repeat: Infinity }} className="bg-white/40 w-1 h-3 rounded-full blur-[1px] rotate-12" />
          </div>
        )}

        {/* Evolution: Ears (Level 5+) */}
        {level >= 5 && (
          <div className="absolute top-2 w-full flex justify-between px-2">
            <div className="w-2 h-2 bg-white/20 rounded-full blur-[1px]" />
            <div className="w-2 h-2 bg-white/20 rounded-full blur-[1px]" />
          </div>
        )}

        {/* Head */}
        <div className="w-[45%] h-[45%] bg-white/30 rounded-full backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        {/* Body */}
        <div className="w-[70%] h-[60%] bg-white/30 rounded-t-[40%] rounded-b-[60%] -mt-[15%] backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
      </motion.div>
      
      {equippedItems && AVATAR_ITEMS.map(item => {
        const isEquipped = equippedItems[item.type] === item.id;
        if (!isEquipped) return null;
        
        const customColor = itemColors?.[item.type];
        const itemSize = s[item.type as keyof typeof s] || s.head;
        
        return (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={reaction !== 'none' ? reaction : { 
              scale: evolutionScale, 
              opacity: 1,
              y: [0, -4, 0] // Sync with soul floating
            }}
            variants={reactionVariants}
            transition={reaction === 'none' ? {
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              default: { duration: 0.3 }
            } : {}}
            className={cn(
              "absolute flex items-center justify-center pointer-events-none",
              item.type === 'head' && (size === 'sm' ? "top-0" : size === 'md' ? "top-0" : "top-0"),
              item.type === 'face' && (size === 'sm' ? "top-1.5" : size === 'md' ? "top-3" : "top-6"),
              item.type === 'body' && (size === 'sm' ? "top-4" : size === 'md' ? "top-8" : "top-16"),
              item.type === 'hand' && (size === 'sm' ? "top-4 right-0" : size === 'md' ? "top-8 right-1" : "top-16 right-2")
            )}
          >
            <item.icon 
              className={cn(itemSize, !customColor && item.color)} 
              style={customColor ? { color: customColor } : {}}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

const GestureCanvas = ({ onComplete, styleColor, hint, gestureType }: { onComplete: () => void, styleColor: string, hint: string, gestureType: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw guide pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.beginPath();
    switch (gestureType) {
      case 'heart':
        for (let t = 0; t <= Math.PI * 2; t += 0.01) {
          const x = cx + 10 * 16 * Math.pow(Math.sin(t), 3);
          const y = cy - 10 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
      case 'circle':
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        break;
      case 'cross':
        ctx.moveTo(cx, cy - 100);
        ctx.lineTo(cx, cy + 100);
        ctx.moveTo(cx - 60, cy - 30);
        ctx.lineTo(cx + 60, cy - 30);
        break;
      case 'x':
        ctx.moveTo(cx - 70, cy - 70);
        ctx.lineTo(cx + 70, cy + 70);
        ctx.moveTo(cx + 70, cy - 70);
        ctx.lineTo(cx - 70, cy + 70);
        break;
      case 'line':
        ctx.moveTo(cx - 100, cy);
        ctx.lineTo(cx + 100, cy);
        break;
      case 'lightning':
        ctx.moveTo(cx + 20, cy - 100);
        ctx.lineTo(cx - 40, cy + 10);
        ctx.lineTo(cx + 40, cy - 10);
        ctx.lineTo(cx - 20, cy + 100);
        break;
      case 'question':
        ctx.arc(cx, cy - 30, 50, Math.PI * 0.8, Math.PI * 2.2);
        ctx.lineTo(cx, cy + 50);
        ctx.moveTo(cx, cy + 80);
        ctx.arc(cx, cy + 80, 2, 0, Math.PI * 2);
        break;
      case 'spiral':
        for (let i = 0; i < 100; i++) {
          const angle = 0.2 * i;
          const x = cx + (1 + angle) * Math.cos(angle) * 5;
          const y = cy + (1 + angle) * Math.sin(angle) * 5;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset for user drawing
  }, [gestureType]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSuccess) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    setPoints([{x, y}]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';

    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setPoints(prev => [...prev, {x, y}]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // If they drew enough (e.g. 10 points), consider it a success
    if (points.length > 10) {
      setIsSuccess(true);
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-[10px] font-bold uppercase tracking-[0.4em]", isSuccess ? "text-emerald-400" : styleColor)}
        >
          {isSuccess ? "感應成功" : "儀式感應中"}
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-serif italic text-white/90"
        >
          {isSuccess ? "靈魂已產生共鳴" : hint}
        </motion.h3>
      </div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative group"
      >
        <div className={cn(
          "absolute -inset-8 rounded-[3rem] blur-2xl transition-all duration-700",
          isSuccess ? "bg-emerald-500/20" : "bg-white/5 group-hover:bg-white/10"
        )} />
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            "relative glass rounded-[2.5rem] cursor-crosshair touch-none border-white/20 shadow-2xl transition-all duration-500",
            isSuccess && "border-emerald-500/50 scale-105"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
            ) : (
              <div className="w-56 h-56 border-2 border-dashed border-white/20 rounded-full animate-spin-slow opacity-10" />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={cn(
          "text-[10px] uppercase tracking-[0.2em] transition-colors",
          isSuccess ? "text-emerald-400" : "text-white/30 animate-pulse"
        )}
      >
        {isSuccess ? "即將揭曉煉金結果" : "在上方區域繪製圖案以完成煉金"}
      </motion.p>
    </div>
  );
};

const AdSenseSlot = ({ className, slotId }: { className?: string; slotId?: string }) => {
  const adRef = useRef<HTMLModElement>(null);
  
  useEffect(() => {
    if (!adRef.current) return;
    
    // Check if ad is already initialized
    if (adRef.current.getAttribute('data-adsbygoogle-status') === 'done') return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Silent fail for AdSense errors to avoid console noise
    }
  }, []);

  return (
    <div className={cn(
      "w-full rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col items-center justify-center p-4 min-h-[100px] relative group transition-all hover:bg-white/[0.04]",
      className
    )}>
      <div className="absolute top-2 right-3 flex items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
        <span className="text-[8px] font-bold uppercase tracking-tighter">Advertisement</span>
        <Info className="w-2 h-2" />
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="text-white/10 text-[10px] font-medium tracking-widest uppercase mb-2">
          贊助內容
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />
        
        {/* Google AdSense Tag */}
        <div className="w-full overflow-hidden flex justify-center">
          <ins 
               ref={adRef}
               className="adsbygoogle"
               style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
               data-ad-client="ca-pub-3114056174980682"
               data-ad-slot={slotId || "default"}
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>

        <p className="mt-3 text-white/20 text-[9px] text-center leading-relaxed max-w-[200px] uppercase tracking-widest">
          支持煉金術平台持續運作
        </p>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [hasPremiumKey, setHasPremiumKey] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasPremiumKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and update state
      setHasPremiumKey(true);
    }
  };

  const [input, setInput] = useState(() => localStorage.getItem('alchemy_draft') || '');
  const [selectedStyle, setSelectedStyle] = useState(() => {
    const saved = localStorage.getItem('alchemy_style');
    if (saved) {
      const style = STYLES.find(s => s.id === saved);
      if (style) return style;
    }
    return STYLES[0];
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('alchemy_messages');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState<number | null>(null);
  const [ritualStep, setRitualStep] = useState<'idle' | 'burning' | 'gesture' | 'transforming' | 'completed'>(() => {
    const saved = localStorage.getItem('alchemy_step');
    return (saved as any) || 'idle';
  });
  const [pendingResponse, setPendingResponse] = useState<string | null>(() => localStorage.getItem('alchemy_pending'));
  const [wallThoughts, setWallThoughts] = useState<any[]>(() => {
    const saved = localStorage.getItem('alchemy_wall');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showWall, setShowWall] = useState(false);
  const [selectedWallThought, setSelectedWallThought] = useState<any | null>(null);
  const [showOracle, setShowOracle] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResult, setOracleResult] = useState<{
    title: string;
    description: string;
    searchKeyword: string;
    type: 'food' | 'exercise' | 'shopping' | 'leisure';
    location?: { name: string; url: string };
    isSponsored?: boolean;
  } | null>(() => {
    const saved = localStorage.getItem('alchemy_oracle');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [oracleFeedback, setOracleFeedback] = useState('');

  async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
  }

  useEffect(() => {
    fetchThoughts();
  }, []);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSoulProfile, setShowSoulProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<'level' | 'stats' | 'avatar' | 'aha' | 'report'>('level');
  
  const [soulData, setSoulData] = useState(() => {
    const defaults = {
      level: 1,
      exp: 0,
      totalRituals: 0,
      totalWords: 0,
      favoriteStyle: 'none',
      usedStyles: [] as string[],
      achievements: [] as string[],
      lastRitual: null as string | null,
      createdAt: new Date().toISOString(),
      dailyRitualsCount: 0,
      lastRitualDate: new Date().toDateString(),
      isPremium: false,
      ritualHistory: [] as { input: string; output: string; style: string; date: string }[],
      completedOracles: 0,
      unlockedItems: ['apprentice_robe'],
      equippedItems: { head: null, face: null, body: 'apprentice_robe', hand: null },
      itemColors: { head: '', face: '', body: '', hand: '' } as Record<string, string>,
      oracleFeedbackHistory: [] as { oracleTitle: string; feedback: string; date: string }[],
      ahaMoments: [] as { id: string; text: string; style: string; date: string }[],
      latestWeeklyReport: null as { date: string; content: string } | null
    };
    try {
      const saved = localStorage.getItem('soulData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Deep merge equippedItems to ensure all slots exist
          const equippedItems = { ...defaults.equippedItems, ...(parsed.equippedItems || {}) };
          return { ...defaults, ...parsed, equippedItems };
        }
      }
    } catch (e) {
      console.error('Failed to parse soulData', e);
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('soulData', JSON.stringify(soulData));
  }, [soulData]);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateWeeklyReport = async () => {
    setIsGeneratingReport(true);
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentHistory = soulData.ritualHistory.filter(
        item => new Date(item.date) >= oneWeekAgo
      );

      if (recentHistory.length === 0) {
        alert("過去一週沒有足夠的轉念紀錄來生成週報。");
        setIsGeneratingReport(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/weekly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: recentHistory,
          ahaMoments: soulData.ahaMoments
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      
      setSoulData(prev => ({
        ...prev,
        latestWeeklyReport: {
          date: new Date().toISOString(),
          content: data.text
        }
      }));
    } catch (error) {
      console.error("Error generating weekly report:", error);
      alert("生成週報失敗，請稍後再試。");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Persistence Effects
  useEffect(() => { localStorage.setItem('alchemy_draft', input); }, [input]);
  useEffect(() => { localStorage.setItem('alchemy_style', selectedStyle.id); }, [selectedStyle]);
  useEffect(() => { localStorage.setItem('alchemy_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('alchemy_step', ritualStep); }, [ritualStep]);
  useEffect(() => { 
    if (pendingResponse) localStorage.setItem('alchemy_pending', pendingResponse);
    else localStorage.removeItem('alchemy_pending');
  }, [pendingResponse]);
  useEffect(() => { localStorage.setItem('alchemy_wall', JSON.stringify(wallThoughts)); }, [wallThoughts]);
  useEffect(() => { 
    if (oracleResult) localStorage.setItem('alchemy_oracle', JSON.stringify(oracleResult));
    else localStorage.removeItem('alchemy_oracle');
  }, [oracleResult]);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If no user, sign in anonymously
        const newAnonUser = await signInAnon();
        if (newAnonUser) {
          setUser(newAnonUser);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLinkGoogle = async () => {
    try {
      const linkedUser = await linkWithGoogle();
      if (linkedUser) {
        setUser(linkedUser);
        alert("成功連結 Google 帳號！您的紀錄已永久封存。");
      }
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        alert("這個 Google 帳號已經被使用過了。");
      } else {
        alert("連結帳號時發生錯誤，請稍後再試。");
      }
    }
  };

  const checkDailyLimit = () => {
    const today = new Date().toDateString();
    if (soulData.isPremium) return true;
    if (soulData.lastRitualDate !== today) {
      setSoulData(prev => ({ ...prev, dailyRitualsCount: 0, lastRitualDate: today }));
      return true;
    }
    return soulData.dailyRitualsCount < 3;
  };

  const updateSoulData = (input: string, output: string, styleId: string) => {
    setSoulData(prev => {
      const today = new Date().toDateString();
      const isNewDay = prev.lastRitualDate !== today;
      const newCount = isNewDay ? 1 : prev.dailyRitualsCount + 1;
      
      const newExp = prev.exp + 10 + Math.floor(input.length / 10);
      const levelUpThreshold = prev.level * 100;
      const leveledUp = newExp >= levelUpThreshold;
      
      const newUsedStyles = prev.usedStyles ? [...new Set([...prev.usedStyles, styleId])] : [styleId];
      const newAchievements = [...prev.achievements];
      
      if (prev.totalRituals === 0 && !newAchievements.includes('first_ritual')) {
        newAchievements.push('first_ritual');
      }
      if (prev.totalWords + input.length > 1000 && !newAchievements.includes('word_master')) {
        newAchievements.push('word_master');
      }
      if (leveledUp && prev.level === 9 && !newAchievements.includes('level_10')) {
        newAchievements.push('level_10');
      }
      if (newUsedStyles.length === STYLES.length && !newAchievements.includes('style_explorer')) {
        newAchievements.push('style_explorer');
      }

      // Keep only last 10 rituals in history to save space
      const newHistory = [
        { input, output, style: styleId, date: new Date().toISOString() },
        ...(prev.ritualHistory || [])
      ].slice(0, 10);

      return {
        ...prev,
        level: leveledUp ? prev.level + 1 : prev.level,
        exp: leveledUp ? newExp - levelUpThreshold : newExp,
        totalRituals: prev.totalRituals + 1,
        totalWords: prev.totalWords + input.length,
        favoriteStyle: styleId,
        usedStyles: newUsedStyles,
        achievements: newAchievements,
        lastRitual: new Date().toISOString(),
        dailyRitualsCount: newCount,
        lastRitualDate: today,
        ritualHistory: newHistory
      };
    });
  };

  const restoreDailyLimit = () => {
    // Simulate watching an ad
    alert('正在加載廣告... (模擬中)');
    setTimeout(() => {
      setSoulData(prev => ({ ...prev, dailyRitualsCount: 0 }));
      alert('觀看完成！每日煉金次數已恢復。');
    }, 2000);
  };

  const togglePremium = () => {
    setSoulData(prev => ({ ...prev, isPremium: !prev.isPremium }));
    alert(soulData.isPremium ? '已取消尊榮會員身份。' : '恭喜！你已成為尊榮會員，享有無限次煉金權限。');
  };

  const completeOracle = (feedback: string) => {
    setSoulData(prev => {
      const newCompletedCount = prev.completedOracles + 1;
      const newExp = prev.exp + 50; // Bonus EXP for completing oracle
      const levelUpThreshold = prev.level * 100;
      const leveledUp = newExp >= levelUpThreshold;
      
      const newUnlockedItems = [...prev.unlockedItems];
      AVATAR_ITEMS.forEach(item => {
        if (!newUnlockedItems.includes(item.id)) {
          if (item.reqType === 'level') {
            if (prev.level >= (item.reqValue || 0)) newUnlockedItems.push(item.id);
          } else if (item.reqValue && newCompletedCount >= item.reqValue) {
            newUnlockedItems.push(item.id);
          }
        }
      });

      return {
        ...prev,
        completedOracles: newCompletedCount,
        level: leveledUp ? prev.level + 1 : prev.level,
        exp: leveledUp ? newExp - levelUpThreshold : newExp,
        unlockedItems: newUnlockedItems,
        oracleFeedbackHistory: [
          { oracleTitle: oracleResult?.title || '未知啟示', feedback, date: new Date().toISOString() },
          ...(prev.oracleFeedbackHistory || [])
        ].slice(0, 20)
      };
    });
    setShowOracle(false);
    setOracleFeedback('');
    alert('感謝你的回饋！你獲得了 50 點靈魂經驗值，並解鎖了新的修煉進度。');
  };

  const equipItem = (itemId: string) => {
    const item = AVATAR_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    setSoulData(prev => {
      const equippedItems = prev.equippedItems || { head: null, face: null, body: null, hand: null };
      const current = equippedItems[item.type as keyof typeof equippedItems];
      return {
        ...prev,
        equippedItems: {
          ...equippedItems,
          [item.type]: current === itemId ? null : itemId
        }
      };
    });
  };

  const updateItemColor = (type: string, color: string) => {
    setSoulData(prev => ({
      ...prev,
      itemColors: {
        ...(prev.itemColors || {}),
        [type]: color
      }
    }));
  };

  const randomizeAvatar = () => {
    const categories = ['head', 'face', 'body', 'hand'];
    const newEquippedItems = { ...soulData.equippedItems };
    const newItemColors = { ...soulData.itemColors };

    categories.forEach(type => {
      // Filter items for this category that are unlocked
      const availableItems = AVATAR_ITEMS.filter(item => 
        item.type === type && soulData.unlockedItems.includes(item.id)
      );

      if (availableItems.length > 0) {
        // Randomly pick an item or unequip (50% chance to unequip if not body)
        const shouldEquip = type === 'body' || Math.random() > 0.3;
        if (shouldEquip) {
          const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
          newEquippedItems[type as keyof typeof newEquippedItems] = randomItem.id;
        } else {
          newEquippedItems[type as keyof typeof newEquippedItems] = null;
        }

        // Randomly pick a color
        const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        newItemColors[type] = randomColor.value;
      }
    });

    setSoulData(prev => ({
      ...prev,
      equippedItems: newEquippedItems,
      itemColors: newItemColors
    }));
  };

  const AVATAR_COLORS = [
    { name: '預設', value: '' },
    { name: '星空藍', value: '#6366f1' },
    { name: '翡翠綠', value: '#10b981' },
    { name: '玫瑰紅', value: '#f43f5e' },
    { name: '琥珀金', value: '#f59e0b' },
    { name: '紫羅蘭', value: '#8b5cf6' },
    { name: '純真白', value: '#ffffff' },
    { name: '深淵黑', value: '#1a1a1a' },
    { name: '幻影青', value: '#06b6d4' },
    { name: '櫻花粉', value: '#ec4899' }
  ];
  const exportSoulCode = () => {
    const code = btoa(JSON.stringify(soulData));
    navigator.clipboard.writeText(code);
    alert('靈魂代碼已複製！你可以分享給朋友，或是貼在社群媒體上炫耀你的修煉成果。');
  };

  const importSoulCode = (code: string) => {
    try {
      const decoded = JSON.parse(atob(code));
      if (decoded.level && decoded.totalRituals !== undefined) {
        setSoulData(decoded);
        alert('靈魂同步成功！你的修煉成果已更新。');
      }
    } catch (e) {
      alert('無效的靈魂代碼。');
    }
  };

  const clearCache = () => {
    if (confirm('確定要清除所有本地快取嗎？這將重置你的修煉進度、對話紀錄與草稿。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const saveRefiningLog = async (originalThought: string, refinedResult: string, styleId: string) => {
    if (!db || !user) return;
    try {
      const resilienceScore = 10 + Math.floor(originalThought.length / 10);
      await addDoc(collection(db, 'refining_logs'), {
        userId: user.uid,
        original_thought: originalThought,
        refined_result: refinedResult,
        style: styleId,
        resilience_score: resilienceScore,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  };

  const handleGestureComplete = async () => {
    setRitualStep('transforming');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (pendingResponse) {
      setMessages(prev => [...prev, 
        { role: 'user', text: input },
        { role: 'model', text: pendingResponse }
      ]);
      submitThought(input, selectedStyle.id, soulData.equippedItems, soulData.level);
      updateSoulData(input, pendingResponse, selectedStyle.id);
      saveRefiningLog(input, pendingResponse, selectedStyle.name);
      setPendingResponse(null);
    }
    
    setRitualStep('completed');
    setLoading(false);
    setInput('');
  };

  const resetAlchemy = () => {
    setMessages([]);
    setRitualStep('idle');
    setInput('');
  };

  const handleRandomComplaint = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_COMPLAINTS.length);
    setInput(RANDOM_COMPLAINTS[randomIndex]);
  };

  const fetchThoughts = async () => {
    try {
      const data = await withRetry(async () => {
        const res = await fetch('/api/thoughts');
        if (!res.ok) throw new Error("Fetch failed");
        return await res.json();
      }, 2);
      setWallThoughts(data);
    } catch (err) {
      // Silent fail for static hosts or persistent failures
    }
  };

  const submitThought = async (content: string, style_id: string, avatar_config?: any, level: number = 1) => {
    try {
      await withRetry(async () => {
        const res = await fetch('/api/thoughts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, style_id, avatar_config, level })
        });
        if (!res.ok) throw new Error("Post failed");
        return res;
      }, 2);
      fetchThoughts();
    } catch (err) {
      console.error("Failed to submit thought", err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    twitter: (text: string) => {
      const t = encodeURIComponent(`「${text}」\n\n來自 SoulRefinery 心靈煉金術`);
      window.open(`https://twitter.com/intent/tweet?text=${t}`, '_blank');
    },
    threads: (text: string) => {
      const t = encodeURIComponent(`「${text}」\n\n來自 SoulRefinery 心靈煉金術`);
      window.open(`https://threads.net/intent/post?text=${t}`, '_blank');
    },
    facebook: () => {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    },
    instagram: async (text: string) => {
      const shareText = `「${text}」\n\n來自 SoulRefinery 心靈煉金術`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'SoulRefinery 心靈煉金術',
            text: shareText,
            url: window.location.href
          });
        } catch (err) {
          console.log('Share failed:', err);
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('文字已複製！你可以直接貼上到 Instagram 貼文或限時動態中。');
      }
    },
    email: (text: string) => {
      const subject = encodeURIComponent('分享一段來自 SoulRefinery 的心靈妙語');
      const body = encodeURIComponent(`「${text}」\n\n體驗心靈煉金術：${window.location.href}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleGetOracle = async () => {
    setOracleLoading(true);
    setShowOracle(true);
    try {
      const lastMessage = messages[messages.length - 1]?.text || "";
      
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastMessage,
          ahaMoments: soulData.ahaMoments
        })
      });

      if (!response.ok) throw new Error('Oracle failed');
      const result = await response.json();
      setOracleResult(result);
    } catch (err) {
      console.error(err);
      setError("啟示能量不足，請稍後再試。");
    } finally {
      setOracleLoading(false);
    }
  };

  const handleSaveAhaMoment = (text: string, styleName: string) => {
    setSoulData(prev => {
      const isSaved = prev.ahaMoments?.some(m => m.text === text);
      if (isSaved) {
        return {
          ...prev,
          ahaMoments: prev.ahaMoments.filter(m => m.text !== text)
        };
      } else {
        return {
          ...prev,
          ahaMoments: [
            { id: Date.now().toString(), text, style: styleName, date: new Date().toISOString() },
            ...(prev.ahaMoments || [])
          ]
        };
      }
    });
  };

  const isAhaMomentSaved = (text: string) => {
    return soulData.ahaMoments?.some(m => m.text === text) || false;
  };

  const handlePurify = async () => {
    if (!input.trim()) return;

    if (!checkDailyLimit()) {
      alert('今日煉金次數已達上限 (3/3)。觀看廣告或升級尊榮會員以繼續。');
      setShowSoulProfile(true);
      return;
    }

    const isFirstMessage = messages.length === 0;
    setLoading(true);
    setError(null);
    setOracleResult(null); // Reset oracle
    if (isFirstMessage) {
      setRitualStep('burning');
    }

    try {
      const response = await fetch('/api/alchemy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          style: selectedStyle,
          history: messages,
          ahaMoments: soulData.ahaMoments
        })
      });

      if (!response.ok) throw new Error('Alchemy failed');
      const data = await response.json();
      const generatedText = data.text || "煉金失敗，請再試一次。";
      
      if (isFirstMessage) {
        // Artificial delay for the ritual animation only on first message
        await new Promise(resolve => setTimeout(resolve, 2500));
        setRitualStep('gesture');
        setPendingResponse(generatedText);
      } else {
        setMessages(prev => [...prev, 
          { role: 'user', text: input },
          { role: 'model', text: generatedText }
        ]);
        setInput('');
        setRitualStep('completed');
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("煉金爐能量不穩，請稍後再試。");
      if (isFirstMessage) setRitualStep('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-white/20">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="atmosphere absolute inset-0" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 md:py-24 flex flex-col items-center max-w-3xl">
        {/* Navigation / Home Button */}
        <AnimatePresence>
          {ritualStep !== 'idle' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={resetAlchemy}
              className="fixed top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all group"
            >
              <Home className="w-4 h-4 text-white/60 group-hover:text-white" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60 group-hover:text-white">
                返回首頁
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Daily Vibe Banner */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300 mb-6 animate-pulse">
            <Zap className="w-3 h-3" />
            今日煉金氛圍：{
              ['寂靜週日', '憂鬱週一', '迷茫週二', '小確幸週三', '期待週四', '狂歡週五', '慵懶週六'][new Date().getDay()]
            } - 適合使用「{
              ['佛系開示', '毒舌開示', '現實主義', '心靈雞湯', '蘇格拉底', '地獄梗', '阿嬤開示'][new Date().getDay()]
            }」
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium tracking-widest uppercase text-white/60 mb-4">
            <Sparkles className="w-3 h-3" />
            Soul Refinery
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            心靈煉金術
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-white/50 font-serif italic text-lg">
              將你的煩惱投入爐火，煉成智慧的結晶
            </p>
            <div className="h-4 w-px bg-white/10" />
            <div 
              onClick={() => setShowSoulProfile(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-all relative"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                靈魂等級: LV.{soulData.level}
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-75" />
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {ritualStep === 'idle' ? (
            <motion.div 
              key="input-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className="w-full glass rounded-3xl p-6 md:p-8 mb-8"
            >
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3 ml-1 flex justify-between items-center">
                  <span>輸入你的負能量</span>
                  <button 
                    onClick={handleRandomComplaint}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg glass hover:bg-white/10 text-white/40 hover:text-amber-300 transition-all group"
                    title="想不到抱怨什麼？點我試試"
                  >
                    <Dices className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                    <span className="text-[9px]">隨機靈感</span>
                  </button>
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="例如：老闆又在下班前加派工作，同事還在背後捅刀..."
                  className="w-full bg-transparent border-none focus:ring-0 text-xl font-serif placeholder:text-white/20 min-h-[120px] resize-none"
                />
              </div>

              {/* Trending Topics */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <RefreshCw className="w-3 h-3 text-white/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    當前熱門煉金主題
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setInput(prev => prev ? `${prev}，而且最近${topic.label}讓我很煩` : `最近${topic.label}真的讓我很焦慮`)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-all group"
                    >
                      <topic.icon className={cn("w-3 h-3", topic.color)} />
                      <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                        {topic.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                {STYLES.map((style) => {
                  const isLocked = style.minLevel && soulData.level < style.minLevel;
                  return (
                    <button
                      key={style.id}
                      onClick={() => !isLocked && setSelectedStyle(style)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
                        selectedStyle.id === style.id 
                          ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                          : "glass hover:bg-white/10 text-white/60",
                        isLocked && "opacity-40 cursor-not-allowed grayscale"
                      )}
                    >
                      <style.icon className={cn("w-4 h-4", selectedStyle.id === style.id ? "text-black" : style.color)} />
                      {style.name}
                      {isLocked && (
                        <div className="absolute -top-2 -right-2 bg-indigo-500 text-[8px] px-1.5 py-0.5 rounded-full text-white font-bold">
                          LV.{style.minLevel}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePurify}
                disabled={loading || !input.trim()}
                className="w-full group relative flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 hover:from-white hover:to-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mb-6"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className={cn(
                  "relative z-10 flex items-center gap-2 text-lg font-bold tracking-tight transition-colors duration-500",
                  "group-hover:text-black"
                )}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      啟動儀式...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                      開始淨化
                    </>
                  )}
                </span>
              </button>

              {/* Community Wall Link */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowWall(true)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors group"
                >
                  <Users className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  查看眾人的淨化之路
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              </div>
            </motion.div>
          ) : ritualStep === 'completed' ? (
            <div className="w-full space-y-8">
              {/* Conversation History */}
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "w-full relative",
                      msg.role === 'user' ? "flex justify-end" : "flex justify-start"
                    )}
                  >
                    {msg.role === 'user' ? (
                      <div className="glass rounded-2xl p-4 max-w-[80%] text-white/70 italic font-serif">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="w-full relative">
                        <div className="absolute -top-4 -left-4 text-white/10">
                          <Quote className="w-16 h-16 rotate-180" />
                        </div>
                        <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                          <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 transition-colors duration-1000",
                            selectedStyle.id === 'soup' && "bg-amber-400",
                            selectedStyle.id === 'scold' && "bg-red-500",
                            selectedStyle.id === 'black' && "bg-purple-500",
                            selectedStyle.id === 'hell' && "bg-zinc-400",
                            selectedStyle.id === 'socrates' && "bg-blue-400",
                            selectedStyle.id === 'grandma' && "bg-pink-400",
                            selectedStyle.id === 'realism' && "bg-emerald-400",
                            selectedStyle.id === 'buddhist' && "bg-orange-400",
                            selectedStyle.id === 'christian' && "bg-sky-400",
                          )} />
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 opacity-40">
                              <selectedStyle.icon className={cn("w-4 h-4", selectedStyle.color)} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{selectedStyle.name}</span>
                            </div>
                            <div className="markdown-body text-xl md:text-2xl font-serif leading-relaxed text-white/90">
                              <Markdown>{msg.text}</Markdown>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-end items-center gap-4">
                              <button
                                onClick={() => handleSaveAhaMoment(msg.text, selectedStyle.name)}
                                className={cn(
                                  "p-2 rounded-full glass transition-all",
                                  isAhaMomentSaved(msg.text) 
                                    ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" 
                                    : "hover:bg-white/10 text-white/60 hover:text-white"
                                )}
                                title={isAhaMomentSaved(msg.text) ? "取消收藏阿哈時刻" : "收藏阿哈時刻"}
                              >
                                {isAhaMomentSaved(msg.text) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                              <div className="relative">
                                <button 
                                  onClick={() => setShowShareMenu(showShareMenu === idx ? null : idx)}
                                  className="p-2 rounded-full glass hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                  {showShareMenu === idx && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                      className="absolute bottom-full right-0 mb-4 glass rounded-2xl p-2 flex flex-col gap-1 min-w-[140px] shadow-2xl z-50"
                                    >
                                      <button onClick={() => { shareLinks.twitter(msg.text); setShowShareMenu(null); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-sm text-white/80 transition-colors text-left"><Twitter className="w-4 h-4 text-[#1DA1F2]" />Twitter / X</button>
                                      <button onClick={() => { shareLinks.threads(msg.text); setShowShareMenu(null); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-sm text-white/80 transition-colors text-left"><AtSign className="w-4 h-4 text-white" />Threads</button>
                                      <button onClick={() => { shareLinks.facebook(); setShowShareMenu(null); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-sm text-white/80 transition-colors text-left"><Facebook className="w-4 h-4 text-[#1877F2]" />Facebook</button>
                                      <button onClick={() => { shareLinks.instagram(msg.text); setShowShareMenu(null); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-sm text-white/80 transition-colors text-left"><Instagram className="w-4 h-4 text-[#E1306C]" />Instagram</button>
                                      <button onClick={() => { shareLinks.email(msg.text); setShowShareMenu(null); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-sm text-white/80 transition-colors text-left"><Mail className="w-4 h-4 text-amber-400" />Email</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <button onClick={() => handleCopy(msg.text)} className={cn("flex items-center gap-2 px-3 py-2 rounded-full glass transition-all duration-300", copied ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "hover:bg-white/10 text-white/60 hover:text-white")}>
                                {copied ? <><Check className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">已複製</span></> : <><Copy className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">複製</span></>}
                              </button>
                            </div>
                            
                            {/* 煉金結果下方的廣告位 */}
                            <AdSenseSlot slotId="alchemy-result-bottom" className="mt-6" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Follow-up Input */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass rounded-3xl p-4 flex items-center gap-4"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="繼續對話..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-serif placeholder:text-white/20 min-h-[40px] py-2 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePurify();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={resetAlchemy}
                    className="p-3 rounded-2xl glass hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center gap-2 px-4"
                    title="返回首頁"
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">返回首頁</span>
                  </button>
                  <button
                    onClick={resetAlchemy}
                    className="p-3 rounded-2xl glass hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                    title="重新煉金"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePurify}
                    disabled={loading || !input.trim()}
                    className="p-3 rounded-2xl bg-white text-black hover:bg-white/80 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleGetOracle}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all group relative scale-110 z-10"
                    title="領取今日幸運啟示"
                  >
                    <div className="absolute -inset-1 bg-amber-400/20 blur-lg rounded-2xl animate-pulse" />
                    <Compass className="w-6 h-6 group-hover:rotate-90 transition-transform duration-700 relative z-10" />
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full animate-bounce shadow-lg">NEW</span>
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              key="ritual-ritual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full min-h-[400px] flex flex-col items-center justify-center relative py-12"
            >
              {/* Alchemical Circle */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-64 h-64 border border-white/10 rounded-full flex items-center justify-center"
              >
                <div className="w-full h-full border border-dashed border-white/5 rounded-full scale-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 border border-white/10 rotate-45" />
                  <div className="absolute w-1/2 h-1/2 border border-white/10 -rotate-45" />
                </div>
              </motion.div>

              {/* Ritual Content */}
              <div className="relative z-10 text-center max-w-md">
                <AnimatePresence mode="wait">
                  {ritualStep === 'burning' ? (
                    <motion.div
                      key="burning-text"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                      transition={{ duration: 1.5 }}
                      className="space-y-6"
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-white/40 font-serif italic text-xl px-4"
                      >
                        {input}
                      </motion.div>
                      <div className="flex justify-center gap-4 text-white/20">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Flame className="w-6 h-6 text-orange-500/50" /></motion.div>
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}><Wind className="w-6 h-6 text-blue-400/50" /></motion.div>
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}><Droplets className="w-6 h-6 text-emerald-400/50" /></motion.div>
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}><Hammer className="w-6 h-6 text-zinc-400/50" /></motion.div>
                      </div>
                      <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 animate-pulse">
                        正在焚毀負能量...
                      </p>
                    </motion.div>
                  ) : ritualStep === 'gesture' ? (
                    <motion.div
                      key="gesture-canvas"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                      transition={{ duration: 0.8 }}
                    >
                      <GestureCanvas 
                        onComplete={handleGestureComplete}
                        styleColor={selectedStyle.color}
                        hint={selectedStyle.gestureHint}
                        gestureType={selectedStyle.gestureType}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="transforming-text"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                        <Sparkles className="w-8 h-8 text-black animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white tracking-widest">
                        轉化中
                      </h3>
                      <p className="text-xs text-white/40 tracking-widest uppercase">
                        智慧正在凝聚
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solidarity Wall Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowWall(!showWall)}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full glass hover:bg-white/10 transition-all group"
        >
          <Users className="w-5 h-5 text-white/60 group-hover:text-white" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/60 group-hover:text-white">
            {showWall ? '關閉共感牆' : '集體共感牆'}
          </span>
        </motion.button>

        {/* Oracle Overlay */}
        <AnimatePresence>
          {showOracle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
            >
              <div className="max-w-md w-full relative">
                <button 
                  onClick={() => setShowOracle(false)}
                  className="absolute -top-12 right-0 text-white/40 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>

                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="glass rounded-[2.5rem] p-8 border-amber-500/20 shadow-2xl overflow-hidden relative"
                >
                  {/* Background Glow */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full" />
                  
                  {oracleLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6">
                      <div className="relative">
                        <Compass className="w-16 h-16 text-amber-400 animate-spin-slow" />
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"
                        />
                      </div>
                      <p className="text-amber-200/60 font-serif italic animate-pulse">正在為你觀測命運之輪...</p>
                    </div>
                  ) : oracleResult ? (
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            {oracleResult.type === 'food' && <Utensils className="w-5 h-5 text-amber-400" />}
                            {oracleResult.type === 'exercise' && <Dumbbell className="w-5 h-5 text-amber-400" />}
                            {oracleResult.type === 'shopping' && <ShoppingBag className="w-5 h-5 text-amber-400" />}
                            {oracleResult.type === 'leisure' && <Ticket className="w-5 h-5 text-amber-400" />}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/60">幸運啟示</span>
                        </div>
                        {oracleResult.isSponsored && (
                          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white/40">
                            贊助推薦
                          </span>
                        )}
                      </div>

                      <h3 className="text-3xl font-serif text-white mb-4 leading-tight">{oracleResult.title}</h3>
                      <p className="text-white/70 font-serif leading-relaxed mb-8 italic">
                        「{oracleResult.description}」
                      </p>

                       <div className="space-y-4">
                        <button 
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(oracleResult.searchKeyword)}`, '_blank')}
                          className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-amber-500/30 group"
                        >
                          <ShoppingBag className="w-6 h-6 group-hover:bounce" />
                          立即獲取這份療癒 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <div className="pt-8 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-amber-400 animate-pulse" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">完成啟示並回饋心得 (獎勵 +50 EXP)</p>
                          </div>
                          <textarea 
                            value={oracleFeedback}
                            onChange={(e) => setOracleFeedback(e.target.value)}
                            placeholder="分享你完成啟示後的心情或收穫..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 min-h-[80px] mb-3 focus:ring-1 focus:ring-amber-500/50 transition-all"
                          />
                          <button 
                            onClick={() => completeOracle(oracleFeedback)}
                            disabled={!oracleFeedback.trim()}
                            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            完成修煉並領取獎勵
                          </button>
                        </div>

                        <button 
                          onClick={() => setShowOracle(false)}
                          className="w-full py-3 rounded-xl glass text-white/40 text-xs font-bold hover:text-white/60 transition-all"
                        >
                          暫時收下啟示
                        </button>
                      </div>

                      {oracleResult.isSponsored && (
                        <p className="mt-6 text-[10px] text-center text-white/20 uppercase tracking-widest leading-relaxed">
                          此建議由煉金術合作夥伴提供<br/>
                          點擊探索可支持本站運作
                        </p>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deployment Helper - Removed because API key is handled by backend */}

        {/* Solidarity Wall Overlay */}
        <AnimatePresence>
          {showWall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 glass backdrop-blur-3xl overflow-y-auto pt-24 pb-12 px-4"
            >
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-serif font-bold mb-4">集體共感牆</h2>
                  <p className="text-white/40 font-serif italic">你不孤單，大家都在各自的泥濘裡努力走著</p>
                </div>

                <div className="relative min-h-[600px] w-full">
                  {/* 共感牆頂部廣告 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mb-12">
                    <AdSenseSlot slotId="wall-top" className="bg-black/40 backdrop-blur-md" />
                  </div>

                  {wallThoughts.map((thought, i) => {
                    // Random positions for "sparks"
                    const x = Math.random() * 80 + 10; // 10% to 90%
                    const y = Math.random() * 80 + 10;
                    const style = STYLES.find(s => s.id === thought.style_id) || STYLES[0];
                    
                    return (
                      <motion.div
                        key={thought.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className="absolute group z-10"
                        onClick={() => setSelectedWallThought(thought)}
                      >
                        <div className="relative">
                          {/* The Spark / Avatar */}
                          {thought.avatar_config ? (
                            <div className="cursor-pointer hover:scale-125 transition-transform">
                              <AvatarDisplay equippedItems={thought.avatar_config} level={thought.level || 1} size="sm" />
                            </div>
                          ) : (
                            <motion.div
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                              }}
                              transition={{ 
                                duration: 2 + Math.random() * 2, 
                                repeat: Infinity,
                                delay: Math.random() * 2
                              }}
                              className={cn(
                                "w-4 h-4 rounded-full blur-sm cursor-pointer hover:scale-150 hover:opacity-100 transition-all",
                                style.color.replace('text-', 'bg-')
                              )}
                            />
                          )}
                          
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="glass p-4 rounded-2xl min-w-[200px] max-w-[300px] shadow-2xl border-white/20">
                              <div className="flex items-center gap-2 mb-2 opacity-40">
                                <style.icon className={cn("w-3 h-3", style.color)} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">匿名煩惱</span>
                              </div>
                              <p className="text-xs font-serif text-white/80 leading-relaxed italic line-clamp-2">
                                "{thought.content}"
                              </p>
                              <div className="mt-2 text-[8px] text-white/20 uppercase tracking-widest text-center">點擊展開共鳴</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wall Thought Detail Overlay */}
        <AnimatePresence>
          {selectedWallThought && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedWallThought(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass max-w-md w-full p-8 rounded-[2.5rem] border-white/20 shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background Glow */}
                <div className={cn(
                  "absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full opacity-20",
                  (STYLES.find(s => s.id === selectedWallThought.style_id) || STYLES[0]).color.replace('text-', 'bg-')
                )} />

                <button 
                  onClick={() => setSelectedWallThought(null)}
                  className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 opacity-40">
                      <MessageCircle className="w-5 h-5 text-indigo-400" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">靈魂的共鳴</span>
                    </div>
                    {selectedWallThought.avatar_config && (
                      <AvatarDisplay equippedItems={selectedWallThought.avatar_config} level={selectedWallThought.level || 1} size="sm" className="opacity-80" />
                    )}
                  </div>

                  <div className="relative mb-10">
                    <div className="absolute -top-6 -left-4 text-white/5">
                      <Quote className="w-16 h-16 rotate-180" />
                    </div>
                    <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed italic relative z-10">
                      「{selectedWallThought.content}」
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        handleCopy(selectedWallThought.content);
                      }}
                      className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center gap-3 transition-all group"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-400" />
                          已複製到靈魂深處
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          複製這份共感
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => setSelectedWallThought(null)}
                      className="w-full py-3 rounded-xl glass text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white/60 transition-all"
                    >
                      關閉視窗
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-24 mb-12 text-center flex flex-col items-center gap-4">
          <div className="opacity-20 text-[10px] tracking-[0.3em] uppercase">
            工作沒有標準答案，但幽默是唯一的解藥
          </div>
          <div className="flex gap-6 opacity-40 text-[9px] uppercase tracking-widest font-bold">
            <button 
              onClick={() => setShowAbout(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              關於我們
            </button>
            <button 
              onClick={() => setShowPrivacy(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              隱私權政策
            </button>
          </div>
        </footer>

        {/* Modals */}
        <AnimatePresence>
          {showSoulProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowSoulProfile(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                  <button 
                    onClick={() => setShowSoulProfile(false)}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">返回首頁</span>
                  </button>
                  <button 
                    onClick={() => setShowSoulProfile(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                  <header className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center relative group overflow-hidden">
                        <AvatarDisplay equippedItems={soulData?.equippedItems} itemColors={soulData?.itemColors} level={soulData?.level || 1} size="md" />
                      </div>
                      <div>
                        <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Soul Profile</div>
                        <h2 className="text-3xl font-serif italic text-white mb-2">靈魂修煉手冊</h2>
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                            LV.{Number(soulData?.level || 1)}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono">
                            SINCE {soulData?.createdAt ? new Date(soulData.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>靈魂經驗值</span>
                        <span>{Number(soulData?.exp || 0)} / {Number(soulData?.level || 1) * 100} EXP</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (Number(soulData?.exp || 0) / (Number(soulData?.level || 1) * 100)) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                      </div>
                    </div>
                  </header>

                  <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                    <button 
                      onClick={() => setProfileTab('level')}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                        profileTab === 'level' ? "text-white" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      靈魂層級
                    </button>
                    <button 
                      onClick={() => setProfileTab('stats')}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                        profileTab === 'stats' ? "text-white" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      修煉統計
                    </button>
                    <button 
                      onClick={() => setProfileTab('avatar')}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                        profileTab === 'avatar' ? "text-white" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      靈魂化身
                      {soulData.unlockedItems.length > 1 && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                    <button 
                      onClick={() => setProfileTab('aha')}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                        profileTab === 'aha' ? "text-white" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      阿哈時刻
                      {soulData.ahaMoments?.length > 0 && (
                        <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[8px]">{soulData.ahaMoments.length}</span>
                      )}
                    </button>
                    <button 
                      onClick={() => setProfileTab('report')}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                        profileTab === 'report' ? "text-white" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      心靈週報
                    </button>
                  </div>

                  {profileTab === 'level' ? (
                    <div className="space-y-8 mb-10">
                      {/* Level Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-indigo-500/10 to-transparent">
                          <AvatarDisplay equippedItems={soulData?.equippedItems} itemColors={soulData?.itemColors} level={soulData?.level || 1} size="lg" />
                          <div className="mt-6 text-center">
                            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Current Form</div>
                            <h3 className="text-2xl font-serif text-white">靈魂等級 LV.{Number(soulData?.level || 1)}</h3>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">修煉進度</div>
                                <div className="text-2xl font-serif text-white">{Number(soulData?.exp || 0)} <span className="text-sm text-white/40">/ {Number(soulData?.level || 1) * 100} EXP</span></div>
                              </div>
                              <div className="text-[10px] text-indigo-400 font-bold">
                                距離下一級還差 {Math.max(0, Number(soulData?.level || 1) * 100 - Number(soulData?.exp || 0))} EXP
                              </div>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (Number(soulData?.exp || 0) / (Number(soulData?.level || 1) * 100)) * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="glass p-4 rounded-2xl border-white/5">
                              <div className="text-[10px] text-white/40 uppercase mb-1">成就解鎖</div>
                              <div className="text-xl font-serif text-white">{Number(soulData?.achievements?.length || 0)} <span className="text-xs text-white/20">/ {ACHIEVEMENTS.length}</span></div>
                            </div>
                            <div className="glass p-4 rounded-2xl border-white/5">
                              <div className="text-[10px] text-white/40 uppercase mb-1">裝備收藏</div>
                              <div className="text-xl font-serif text-white">{Number(soulData?.unlockedItems?.length || 0)} <span className="text-xs text-white/20">/ {AVATAR_ITEMS.length}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Achievements Summary */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-white/40" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">近期成就</span>
                          </div>
                          <button onClick={() => setProfileTab('stats')} className="text-[10px] text-indigo-400 hover:underline">查看全部</button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                          {(ACHIEVEMENTS || []).slice(0, 4).map((achievement) => {
                            const isUnlocked = (soulData.achievements || []).includes(achievement.id);
                            return (
                              <div 
                                key={achievement.id}
                                className={cn(
                                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative group transition-all duration-500",
                                  isUnlocked ? "glass bg-white/5" : "bg-white/[0.02] grayscale opacity-30"
                                )}
                              >
                                <achievement.icon className={cn("w-5 h-5", isUnlocked ? achievement.color : "text-white/20")} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 p-2 glass rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center">
                                  <p className="text-[8px] font-bold text-white">{achievement.name}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : profileTab === 'avatar' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      {/* Character Preview */}
                      <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-indigo-500/5 to-transparent">
                        <AvatarDisplay equippedItems={soulData?.equippedItems} itemColors={soulData?.itemColors} level={soulData?.level || 1} size="lg" />
                        <div className="mt-8 text-center">
                          <h3 className="text-xl font-serif text-white mb-2">靈魂形態</h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            已完成 {soulData.completedOracles} 次幸運啟示
                          </p>
                        </div>
                      </div>

                      {/* Item Grid & Color Picker */}
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-white/40" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">靈魂裝備</span>
                            </div>
                            <button 
                              onClick={randomizeAvatar}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full glass hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-indigo-400 transition-all group"
                            >
                              <Dices className="w-3 h-3 group-hover:rotate-12 transition-transform duration-300" />
                              隨機化身
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {AVATAR_ITEMS.map((item) => {
                              const isUnlocked = soulData.unlockedItems.includes(item.id);
                              const isEquipped = soulData.equippedItems[item.type] === item.id;
                              
                              return (
                                <button 
                                  key={item.id}
                                  onClick={() => isUnlocked && equipItem(item.id)}
                                  className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-center relative group transition-all duration-300",
                                    isUnlocked ? (
                                      isEquipped ? "glass bg-indigo-500/20 border-indigo-500/50" : "glass bg-white/5 hover:bg-white/10"
                                    ) : "bg-white/[0.02] grayscale opacity-30 cursor-not-allowed"
                                  )}
                                >
                                  <item.icon 
                                    className={cn("w-6 h-6 mb-1", isUnlocked ? (!soulData.itemColors?.[item.type] || !isEquipped ? item.color : "") : "text-white/20")} 
                                    style={isUnlocked && isEquipped && soulData.itemColors?.[item.type] ? { color: soulData.itemColors[item.type] } : {}}
                                  />
                                  <span className="text-[8px] font-bold text-white/60">{item.name}</span>
                                  
                                  {/* Item Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 glass rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center">
                                    <p className="text-[10px] font-bold text-white mb-1">{item.name}</p>
                                    <p className="text-[8px] text-white/60 leading-tight mb-2">{item.description}</p>
                                    {!isUnlocked && (
                                      <div className="pt-2 border-t border-white/10">
                                        <p className="text-[8px] text-amber-400 font-bold">解鎖條件：</p>
                                        <p className="text-[8px] text-white/40">{item.requirement}</p>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Color Picker Section */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-white/40" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">個性化色彩</span>
                          </div>
                          
                          <div className="space-y-4">
                            {['head', 'face', 'body', 'hand'].map(type => {
                              const equippedId = soulData.equippedItems[type];
                              if (!equippedId) return null;
                              const item = AVATAR_ITEMS.find(i => i.id === equippedId);
                              
                              return (
                                <div key={type} className="space-y-2">
                                  <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest flex justify-between">
                                    <span>{item?.name} 顏色</span>
                                    <span className="text-indigo-400">{AVATAR_COLORS.find(c => c.value === (soulData.itemColors?.[type] || ''))?.name}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {AVATAR_COLORS.map(color => (
                                      <button
                                        key={color.value}
                                        onClick={() => updateItemColor(type, color.value)}
                                        className={cn(
                                          "w-6 h-6 rounded-full border-2 transition-all",
                                          (soulData.itemColors?.[type] || '') === color.value ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent hover:scale-105"
                                        )}
                                        style={{ 
                                          backgroundColor: color.value || '#475569',
                                          backgroundImage: !color.value ? 'linear-gradient(45deg, #475569 25%, #64748b 25%, #64748b 50%, #475569 50%, #475569 75%, #64748b 75%, #64748b 100%)' : 'none',
                                          backgroundSize: '10px 10px'
                                        }}
                                        title={color.name}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            {!Object.values(soulData.equippedItems).some(v => v !== null) && (
                              <p className="text-[10px] text-white/20 italic text-center py-4">
                                裝備靈魂道具後即可調整顏色
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : profileTab === 'aha' ? (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-6">
                        <Star className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xl font-serif text-white">阿哈時刻收藏</h3>
                      </div>
                      
                      {!soulData.ahaMoments || soulData.ahaMoments.length === 0 ? (
                        <div className="glass rounded-3xl p-12 text-center">
                          <Star className="w-12 h-12 text-white/10 mx-auto mb-4" />
                          <p className="text-white/40 text-sm">尚未收藏任何金句。<br/>在煉金過程中，點擊回覆右上角的書籤圖示即可收藏觸動你的話語。</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {soulData.ahaMoments.map(moment => (
                            <div key={moment.id} className="glass p-6 rounded-2xl relative group">
                              <button 
                                onClick={() => handleSaveAhaMoment(moment.text, moment.style)}
                                className="absolute top-4 right-4 p-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-full"
                                title="取消收藏"
                              >
                                <X size={16} />
                              </button>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-white/40 uppercase tracking-wider border border-white/10">
                                  {moment.style}
                                </span>
                                <span className="text-[10px] text-white/20">
                                  {new Date(moment.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {moment.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : profileTab === 'report' ? (
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-xl font-serif text-white">心靈週報</h3>
                        </div>
                        <button
                          onClick={generateWeeklyReport}
                          disabled={isGeneratingReport}
                          className="px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isGeneratingReport ? (
                            <>
                              <div className="w-3 h-3 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              生成本週報告
                            </>
                          )}
                        </button>
                      </div>

                      {soulData.latestWeeklyReport ? (
                        <div className="glass rounded-3xl p-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                          <div className="relative z-10">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-6">
                              報告生成時間：{new Date(soulData.latestWeeklyReport.date).toLocaleString()}
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:font-normal prose-h3:text-indigo-300 prose-h3:text-lg prose-p:text-white/80 prose-p:leading-relaxed prose-li:text-white/80">
                              <Markdown>{soulData.latestWeeklyReport.content}</Markdown>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="glass rounded-3xl p-12 text-center">
                          <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
                          <p className="text-white/40 text-sm mb-6">尚未生成任何週報。<br/>點擊上方按鈕，讓導師為你總結過去一週的煉金旅程。</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Stats */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">修煉統計</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-2xl">
                          <div className="text-[10px] text-white/40 uppercase mb-1">淨化次數</div>
                          <div className="text-2xl font-serif text-white">{soulData.totalRituals}</div>
                        </div>
                        <div className="glass p-4 rounded-2xl">
                          <div className="text-[10px] text-white/40 uppercase mb-1">累計字數</div>
                          <div className="text-2xl font-serif text-white">{soulData.totalWords}</div>
                        </div>
                        <div className="glass p-4 rounded-2xl">
                          <div className="text-[10px] text-white/40 uppercase mb-1">完成啟示</div>
                          <div className="text-2xl font-serif text-white">{soulData.completedOracles || 0}</div>
                        </div>
                        <div className="glass p-4 rounded-2xl col-span-2">
                          <div className="text-[10px] text-white/40 uppercase mb-1">今日剩餘次數</div>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-serif text-white">
                              {soulData.isPremium ? '∞' : Math.max(0, 3 - soulData.dailyRitualsCount)} / 3
                            </div>
                            {!soulData.isPremium && soulData.dailyRitualsCount >= 3 && (
                              <button 
                                onClick={restoreDailyLimit}
                                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> 觀看廣告恢復
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">靈魂成就</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {ACHIEVEMENTS.map((achievement) => {
                          const isUnlocked = soulData.achievements.includes(achievement.id);
                          return (
                            <div 
                              key={achievement.id}
                              className={cn(
                                "aspect-square rounded-xl flex items-center justify-center relative group cursor-help transition-all duration-500",
                                isUnlocked ? "glass bg-white/5" : "bg-white/[0.02] grayscale opacity-30"
                              )}
                            >
                              <achievement.icon className={cn("w-6 h-6", isUnlocked ? achievement.color : "text-white/20")} />
                              
                              {/* Achievement Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 glass rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center">
                                <p className="text-[10px] font-bold text-white mb-1">{achievement.name}</p>
                                <p className="text-[8px] text-white/60 leading-tight">{achievement.description}</p>
                                {!isUnlocked && <p className="text-[8px] text-red-400 mt-1 font-bold">尚未解鎖</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Ritual History (Cached Responses) */}
                  {soulData.ritualHistory && soulData.ritualHistory.length > 0 && (
                    <div className="mb-10 space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <HistoryIcon className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">近期煉金紀錄 (本地存檔)</span>
                      </div>
                      <div className="space-y-4">
                        {soulData.ritualHistory.map((item: any, idx: number) => (
                          <div key={idx} className="glass p-4 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                  {STYLES.find(s => s.id === item.style)?.name || item.style}
                                </span>
                              </div>
                              <span className="text-[8px] text-white/20 font-mono">
                                {new Date(item.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 italic line-clamp-1">「{item.input}」</p>
                            <div className="text-sm text-white/80 font-serif leading-relaxed line-clamp-2">
                              {item.output}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Oracle Feedback History */}
                  {soulData.oracleFeedbackHistory && soulData.oracleFeedbackHistory.length > 0 && (
                    <div className="mb-10 space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">啟示修煉心得</span>
                      </div>
                      <div className="space-y-4">
                        {soulData.oracleFeedbackHistory.map((item: any, idx: number) => (
                          <div key={idx} className="glass p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{item.oracleTitle}</span>
                              <span className="text-[8px] text-white/20 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-white/80 font-serif italic leading-relaxed">
                              「{item.feedback}」
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soul Code & Premium Section */}
                  <div className="pt-8 border-t border-white/10 space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <h4 className="text-white text-sm font-bold mb-1">靈魂代碼 (Soul Code)</h4>
                        <p className="text-xs text-white/40">這是你的修煉憑證。你可以將其導出備份，或導入到其他設備。</p>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-end gap-3">
                        {user && user.isAnonymous && (
                          <button 
                            onClick={handleLinkGoogle}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg shadow-blue-900/20"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            永久封存紀錄 (綁定 Google)
                          </button>
                        )}
                        <button 
                          onClick={handleSelectApiKey}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg",
                            hasPremiumKey 
                              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20"
                          )}
                        >
                          <Crown className="w-4 h-4" />
                          {hasPremiumKey ? "付費版 API 已啟用" : "啟用付費版 API (Blaze)"}
                        </button>
                        <button 
                          onClick={exportSoulCode}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 text-xs font-bold text-white transition-all"
                        >
                          <Download className="w-4 h-4" />
                          導出代碼
                        </button>
                        <button 
                          onClick={() => {
                            const code = prompt('請貼入你的靈魂代碼：');
                            if (code) importSoulCode(code);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 text-xs font-bold text-white transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          導入代碼
                        </button>
                        <button 
                          onClick={clearCache}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-red-500/20 text-xs font-bold text-red-400 transition-all border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          清除快取
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                      <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                          <Star className="w-4 h-4 text-amber-400" />
                          <h4 className="text-white text-sm font-bold">尊榮靈魂 (Premium)</h4>
                        </div>
                        <p className="text-xs text-white/40">解鎖無限次煉金、專屬名流風格，並移除所有廣告。</p>
                      </div>
                      <button 
                        onClick={togglePremium}
                        className={cn(
                          "px-6 py-2 rounded-xl font-bold text-xs transition-all",
                          soulData.isPremium 
                            ? "bg-white/10 text-white/60 hover:bg-white/20" 
                            : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        )}
                      >
                        {soulData.isPremium ? '管理訂閱' : '立即升級'}
                      </button>
                    </div>

                    <div className="flex justify-center pt-4 pb-8">
                      <button 
                        onClick={() => setShowSoulProfile(false)}
                        className="px-10 py-3 rounded-2xl glass hover:bg-white/10 text-white/60 text-sm font-bold transition-all"
                      >
                        關閉並返回首頁
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showPrivacy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowPrivacy(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 md:p-12 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="space-y-8">
                  <header>
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Legal & Privacy</div>
                    <h2 className="text-3xl font-serif italic text-white">隱私權政策</h2>
                  </header>

                  <div className="space-y-6 text-white/60 text-sm leading-relaxed font-serif">
                    <section className="space-y-3">
                      <h3 className="text-white font-sans text-xs uppercase tracking-widest font-bold">1. 資訊收集與使用</h3>
                      <p>
                        「心靈煉金術」(Soul Refinery) 是一個旨在提供情緒抒發與心靈支持的平台。我們收集您在「負能量輸入框」中輸入的文字內容，用於生成 AI 回覆以及展示於「集體共感牆」。
                      </p>
                      <p className="text-emerald-400/80 italic">
                        * 重要聲明：所有提交至共感牆的內容皆為匿名處理，我們不會主動收集您的姓名、電子郵件、IP 地址或其他可識別個人身份的資訊。
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-white font-sans text-xs uppercase tracking-widest font-bold">2. Google AdSense 與 Cookie</h3>
                      <p>
                        本網站使用 Google AdSense 投放廣告。Google 作為第三方供應商，會使用 Cookie 根據使用者先前造訪本網站或其他網站的紀錄來投放廣告。
                      </p>
                      <p>
                        Google 使用廣告 Cookie，讓 Google 及其合作夥伴能夠根據使用者對本站及/或網際網路上其他網站的造訪紀錄，向使用者投放廣告。
                      </p>
                      <p>
                        您可以前往 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-4">廣告設定</a> 頁面，停用個人化廣告。
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-white font-sans text-xs uppercase tracking-widest font-bold">3. 資料安全</h3>
                      <p>
                        我們採取合理的安全措施來保護您的匿名數據。然而，請注意，網際網路上的傳輸或電子儲存方法並非 100% 安全。
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-white font-sans text-xs uppercase tracking-widest font-bold">4. 政策變更</h3>
                      <p>
                        我們可能會不時更新隱私權政策。建議您定期查看本頁面以獲取最新資訊。
                      </p>
                    </section>

                    <footer className="pt-8 border-t border-white/10 text-[10px] opacity-40">
                      最後更新日期：2024年3月
                    </footer>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAbout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowAbout(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass max-w-2xl w-full p-8 md:p-12 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowAbout(false)}
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="space-y-8">
                  <header>
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Our Vision</div>
                    <h2 className="text-3xl font-serif italic text-white">關於心靈煉金術</h2>
                  </header>

                  <div className="space-y-6 text-white/70 text-base leading-relaxed font-serif">
                    <p>
                      在這個快節奏的時代，每個人心中都堆積著無處安放的「負能量」。
                    </p>
                    <p>
                      我們相信，負能量並非廢棄物，而是未經提煉的智慧原礦。透過「心靈煉金術」，我們利用 AI 的智慧，將您的煩惱、憤怒與無奈，轉化為幽默、哲理或療癒的結晶。
                    </p>
                    <p className="italic text-amber-400/80">
                      「將你的煩惱投入爐火，煉成智慧的結晶。」
                    </p>
                    <p>
                      這是一個讓靈魂喘息的角落，一個讓共鳴發生的空間。在這裡，你並不孤單。
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
