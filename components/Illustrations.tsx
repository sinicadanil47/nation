"use client";

import { useId, type CSSProperties } from "react";
import { motion } from "framer-motion";

export type IllustrationVariant = "industry" | "security" | "medical" | "government" | "projects" | "economy" | "energy" | "regions" | "parliament" | "media" | "education" | "defense" | "president" | "health";

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
  economy: { title: "Экономический штаб", subtitle: "БЮДЖЕТ · ИНВЕСТИЦИИ", accent: "#e9bd68" },
  energy: { title: "Энергетическая сеть", subtitle: "ГЕНЕРАЦИЯ · МОЩНОСТЬ", accent: "#f2d36b" },
  regions: { title: "Региональное развитие", subtitle: "ТЕРРИТОРИИ · ИНФРАСТРУКТУРА", accent: "#72d6a3" },
  parliament: { title: "Парламентский зал", subtitle: "ЗАКОНОДАТЕЛЬСТВО · КОНСЕНСУС", accent: "#b7a0f2" },
  media: { title: "Информационный центр", subtitle: "СВЯЗЬ · ОБЩЕСТВЕННОЕ МНЕНИЕ", accent: "#72c7ed" },
  education: { title: "Образовательный контур", subtitle: "НАУКА · КАДРЫ", accent: "#a4a0f5" },
  defense: { title: "Оборонный комплекс", subtitle: "ГОТОВНОСТЬ · СТРАТЕГИЯ", accent: "#75a9f4" },
  president: { title: "Офис Президента", subtitle: "УПРАВЛЕНИЕ · СТРАТЕГИЯ", accent: "#d9bd83" },
  health: { title: "Медицинская система", subtitle: "ЗДОРОВЬЕ · КЛИНИКИ", accent: "#f08fba" },
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
        {variant === "economy" && (<g><path d="M30 76H150M42 76V51H65V76M75 76V37H98V76M108 76V24H131V76" stroke={item.accent} strokeWidth="2" fill={`url(#${id}-glass)`}/><path d="M37 43L66 34L88 40L121 18L145 25" stroke={item.accent} strokeWidth="2.5" strokeLinecap="round"/><path d="M137 18L145 25L134 28" stroke={item.accent} strokeWidth="2"/><circle cx="54" cy="22" r="10" stroke={item.accent}/><path d="M54 16V28M58 19H52C48 19 49 24 53 24H56C60 24 60 29 55 29H49" stroke={item.accent}/></g>)}
        {variant === "energy" && (<g><path d="M28 81V51L47 39L66 51V81M35 57H59M35 66H59" stroke="#B9CFDC" strokeWidth="2"/><path d="M92 15L65 55H88L78 83L123 39H99L110 15H92Z" fill={gradient} stroke={item.accent} strokeWidth="2"/><path d="M132 81V47H157V81M137 47V34H152V47M144 34V24" stroke={item.accent} strokeWidth="2"/></g>)}
        {variant === "regions" && (<g><path d="M27 35L66 20L93 35L129 19L161 34V74L126 86L91 72L59 86L27 70V35Z" fill={`url(#${id}-glass)`} stroke={item.accent} strokeWidth="2"/><path d="M66 20V60L91 72M93 35V72M129 19V60L161 74M27 52L59 65L93 51L129 60L161 48" stroke={item.accent} strokeOpacity=".8"/><circle cx="59" cy="48" r="4" fill={item.accent}/><circle cx="129" cy="43" r="4" fill={item.accent}/></g>)}
        {variant === "parliament" && (<g><path d="M27 42L94 16L161 42H27Z" fill={`url(#${id}-metal)`} stroke={item.accent} strokeWidth="2"/><path d="M35 47H153V53H35ZM40 57V76M62 57V76M84 57V76M106 57V76M128 57V76M150 57V76M29 81H159" stroke={item.accent} strokeWidth="3" strokeLinecap="round"/><circle cx="94" cy="34" r="5" fill={item.accent}/></g>)}
        {variant === "media" && (<g><path d="M47 35L137 35L151 49V78H39V43L47 35Z" fill={`url(#${id}-glass)`} stroke={item.accent} strokeWidth="2"/><path d="M55 49H111M55 59H132M55 69H99" stroke={item.accent} strokeWidth="2" strokeLinecap="round"/><path d="M30 27L94 10L158 27M94 10V35" stroke="#B9CFDC" strokeWidth="2"/><circle cx="94" cy="10" r="4" fill={item.accent}/></g>)}
        {variant === "education" && (<g><path d="M24 40L94 13L164 40L94 68L24 40Z" fill={`url(#${id}-glass)`} stroke={item.accent} strokeWidth="2"/><path d="M53 52V70C77 88 111 88 135 70V52M164 40V69" stroke={item.accent} strokeWidth="2"/><path d="M84 34H104V51H84Z" stroke="#D8E8F5" strokeWidth="2"/><path d="M94 34V51" stroke={item.accent} strokeWidth="2"/></g>)}
        {variant === "defense" && (<g><path d="M94 12L145 30V54C145 70 123 82 94 89C65 82 43 70 43 54V30L94 12Z" fill={`url(#${id}-glass)`} stroke={item.accent} strokeWidth="2"/><path d="M94 26L129 38V54C129 65 112 74 94 80C76 74 59 65 59 54V38L94 26Z" stroke="#D8E8F5" strokeOpacity=".65"/><path d="M94 34V67M78 50H110M83 40L105 62M105 40L83 62" stroke={item.accent} strokeWidth="2"/></g>)}
        {variant === "president" && (
          <g>
            <path d="M24 42L88 14L152 42H24Z" fill={`url(#${id}-metal)`} stroke={item.accent} strokeWidth="2" />
            <path d="M34 47H142M42 48V78M65 48V78M88 48V78M111 48V78M134 48V78M27 82H149" stroke="#D9E8F2" strokeWidth="2.5" />
            <path d="M88 14V6M83 10H93M155 25L165 15" stroke={item.accent} strokeWidth="2" />
          </g>
        )}
        {variant === "health" && (
          <g>
            <path d="M34 80V35H145V80Z" fill={`url(#${id}-glass)`} stroke={item.accent} strokeWidth="2" />
            <path d="M77 43H102M89 31V56" stroke={item.accent} strokeWidth="6" strokeLinecap="round" />
            <path d="M43 66H62L70 55L79 72L88 61H111L120 50L128 66H147" stroke="#D9E8F2" strokeWidth="2" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
