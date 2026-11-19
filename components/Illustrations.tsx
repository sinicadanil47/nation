"use client";

import { useId, type CSSProperties } from "react";
import { motion } from "framer-motion";

export type IllustrationVariant = "industry" | "security" | "medical" | "government" | "projects";

interface Props {
  variant: IllustrationVariant;
  className?: string;
  compact?: boolean;
}

const labels: Record<IllustrationVariant, { title: string; subtitle: string; accent: string }> = {
  industry: { title: "Промышленный контур", subtitle: "ПРОИЗВОДСТВО · ИНФРАСТРУКТУРА", accent: "#5dd6c0" },
  security: { title: "Контур безопасности", subtitle: "ЗАЩИТА · ПРАВОПОРЯДОК", accent: "#78b9ff" },
  medical: { title: "Медицинская сеть", subtitle: "ЗДОРОВЬЕ · СОЦИАЛЬНАЯ СФЕРА", accent: "#f08fba" },
  government: { title: "Государственный центр", subtitle: "УПРАВЛЕНИЕ · ИНСТИТУТЫ", accent: "#d9bd83" },
  projects: { title: "Национальные проекты", subtitle: "РАЗВИТИЕ · СТРОИТЕЛЬСТВО", accent: "#86d6a8" },
};

export default function NationIllustration({ variant, className = "", compact = false }: Props) {
  const id = useId().replace(/:/g, "");
  const item = labels[variant];
  const gradient = `url(#${id}-accent)`;
  return (
    <motion.div
      className={`nation-illustration nation-illustration--${variant} relative isolate flex min-w-0 items-center overflow-hidden rounded-xl ${className}`}
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="img"
      aria-label={item.title}
      style={{ "--illustration-accent": item.accent } as CSSProperties}
    >
      <div className="relative z-10 min-w-0 flex-1 px-3 py-2">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[.16em] text-white/85">{item.title}</p>
        {!compact ? <p className="mt-1 truncate text-[7px] font-semibold tracking-[.12em] text-slate-400">{item.subtitle}</p> : null}
        <span className="illustration-signal mt-2 inline-flex items-center gap-1.5 text-[8px] font-bold tracking-wider text-white/65">
          <i className="h-1.5 w-1.5 rounded-full bg-current" /> SYSTEM ONLINE
        </span>
      </div>
      <svg className="nation-illustration__art relative z-0 h-full w-[46%] min-w-[116px] max-w-[190px] shrink-0" viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#D7E7F2" stopOpacity=".8" /><stop offset="1" stopColor="#66839B" stopOpacity=".2" />
          </linearGradient>
          <linearGradient id={`${id}-accent`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={item.accent} /><stop offset="1" stopColor={item.accent} stopOpacity=".12" />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#B7D8EA" stopOpacity=".28" /><stop offset="1" stopColor="#7FA7C4" stopOpacity=".04" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M8 83H182M20 88H168" stroke="#A9C2D5" strokeOpacity=".2" />
        <circle cx="150" cy="18" r="23" fill={gradient} opacity=".12" />
        <circle cx="150" cy="18" r="15" stroke={item.accent} strokeOpacity=".24" strokeDasharray="2 4" />
        {variant === "industry" && (
          <g>
            <path d="M28 81V49L53 34V48L78 33V81H28Z" fill={`url(#${id}-glass)`} stroke="#91B2C8" strokeOpacity=".65" />
            <path d="M38 81V61H49V81M58 59H69V68H58V59Z" fill="#0C1824" stroke={item.accent} strokeOpacity=".65" />
            <path d="M83 81V43H101V81M87 43V25H97V43" fill={`url(#${id}-metal)`} fillOpacity=".55" stroke="#B4C9D7" strokeOpacity=".6" />
            <path d="M90 24C83 18 92 15 88 9M96 24C103 18 94 15 99 9" stroke={item.accent} strokeWidth="2" strokeLinecap="round" />
            <path d="M108 81V56L130 44V81M115 61H124M115 69H124" stroke={item.accent} strokeOpacity=".8" />
            <path d="M24 81H138" stroke="#D2E4EF" strokeOpacity=".55" />
            <circle cx="145" cy="67" r="7" stroke={item.accent} strokeOpacity=".7" /><path d="M145 60V74M138 67H152" stroke={item.accent} />
          </g>
        )}
        {variant === "security" && (
          <g>
            <path d="M89 15L126 28V52C126 69 110 81 89 88C68 81 52 69 52 52V28L89 15Z" fill={`url(#${id}-glass)`} stroke={gradient} strokeWidth="2" />
            <path d="M89 25L116 34V52C116 64 104 73 89 79C74 73 62 64 62 52V34L89 25Z" stroke="#D8E8F5" strokeOpacity=".4" />
            <path d="M76 51L85 60L103 42" stroke={item.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-glow)`} />
            <path d="M25 68H44L51 57L59 76L67 66H79M126 70H144L151 58L158 70H174" stroke="#8AB8D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="37" cy="26" r="3" fill={item.accent} /><circle cx="151" cy="30" r="2" fill="#D7E7F2" />
          </g>
        )}
        {variant === "medical" && (
          <g>
            <path d="M43 81V42L68 28L93 42V81H43Z" fill={`url(#${id}-glass)`} stroke="#B7C9D9" strokeOpacity=".7" />
            <path d="M55 81V60H81V81" fill="#0B1723" stroke="#A8C4D6" strokeOpacity=".5" />
            <path d="M63 45H73M68 40V50" stroke={item.accent} strokeWidth="4" strokeLinecap="round" filter={`url(#${id}-glow)`} />
            <path d="M100 81V50H128V81" fill={`url(#${id}-glass)`} stroke="#B7C9D9" strokeOpacity=".6" />
            <path d="M105 57H123M105 65H123" stroke="#B7C9D9" strokeOpacity=".5" />
            <path d="M25 67H42L49 58L57 75L65 65H81L88 54L96 67H111L118 61L124 67H151" stroke={item.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-glow)`} />
            <path d="M136 81V47H157V81M142 55H151M142 62H151" stroke="#B9CFDC" strokeOpacity=".7" />
          </g>
        )}
        {variant === "government" && (
          <g>
            <path d="M28 42L89 13L150 42H28Z" fill={`url(#${id}-metal)`} fillOpacity=".65" stroke="#D7C8A8" strokeOpacity=".75" />
            <path d="M38 43H140V49H38Z" fill="#AABBC8" fillOpacity=".18" stroke="#D7C8A8" strokeOpacity=".55" />
            {[48, 68, 88, 108, 128].map((x) => <path key={x} d={`M${x} 50V77M${x - 4} 50H${x + 4}M${x - 5} 77H${x + 5}`} stroke="#D7C8A8" strokeWidth="3" strokeLinecap="round" opacity=".78" />)}
            <path d="M34 80H144V85H34Z" fill="#BDA77E" fillOpacity=".5" /><path d="M89 13V5M85 8H93M22 32H34M144 32H156" stroke={item.accent} strokeWidth="2" strokeLinecap="round" />
            <circle cx="161" cy="21" r="4" fill={item.accent} />
          </g>
        )}
        {variant === "projects" && (
          <g>
            <path d="M24 81H163" stroke="#B9CFDC" strokeOpacity=".5" />
            <path d="M35 81V48H57V81M39 55H53M39 64H53" fill={`url(#${id}-glass)`} stroke="#9CB8CA" strokeOpacity=".65" />
            <path d="M66 81V36H78V81M62 36H82M72 22V36M72 22H139M72 22L87 31M139 22L128 30M130 22V37M126 37H134" stroke="#B9C8D5" strokeWidth="2" strokeLinecap="round" />
            <path d="M91 81V57L113 45L135 57V81M102 81V65H124V81M145 81V58H158V81M147 58L151 51L156 58" fill={`url(#${id}-glass)`} stroke={item.accent} strokeOpacity=".7" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
