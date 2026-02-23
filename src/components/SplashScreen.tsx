import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, Music, Zap, Disc, Waves, Mic } from 'lucide-react';
import { useAppIdentity } from '../context/IdentityContext';

const LOGO_ICONS: Record<string, any> = {
  sparkles: Sparkles,
  music: Music,
  zap: Zap,
  disc: Disc,
  waves: Waves,
  mic: Mic,
};

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { logoDesign, currentLogoColor, syncEnabled } = useAppIdentity();
  const SelectedIcon = LOGO_ICONS[logoDesign] || Sparkles;
  const logoColor = syncEnabled ? 'var(--accent-primary)' : currentLogoColor;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-cyber-black)] noise-overlay"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <div 
          className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-[var(--accent-dim)] border border-[var(--accent-primary)]/30 shadow-[0_0_60px_var(--accent-dim)]"
          style={{ color: logoColor }}
        >
          <SelectedIcon size={64} />
          
          {/* Scanning Line Animation */}
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]"
          />
        </div>

        <div className="text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-[var(--color-text-primary)] tracking-widest uppercase mb-2 font-display italic"
          >
            Moto Studio
          </motion.h1>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-[var(--accent-primary)]"
          >
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-mono uppercase tracking-[0.2em]">Neural Processing...</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
