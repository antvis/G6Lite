'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = {
  /** 目标数值(用于 count-up;非数值如 ~0 取 0) */
  to: number;
  /** 数值前缀,如 ~ */
  prefix?: string;
  /** 单位,如 ms / KB */
  unit: string;
  /** 大数显示后缀,如 k */
  suffix?: string;
  label: string;
  /** 是否高亮“实时”脉冲(性能项) */
  live?: boolean;
};

const STATS: Stat[] = [
  { to: 0, prefix: '~', unit: 'ms', label: '高亮 / 状态变更开销', live: true },
  { to: 28, prefix: '~', unit: 'KB', label: '核心引擎 (brotli)' },
  { to: 14, unit: '种', label: '内置布局算法' },
  { to: 10, suffix: 'k', unit: '+', label: '可流畅渲染节点' },
];

/** 进入视口时触发一次 count-up,缓动到目标值 */
function useCountUp(target: number, run: boolean, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (target === 0) {
      return;
    }
    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

function StatValue({ stat, run }: { stat: Stat; run: boolean }) {
  const v = useCountUp(stat.to, run);
  const display = stat.to === 0 ? '0' : Math.round(v).toString();
  return (
    <div className="flex items-baseline justify-center font-mono leading-none [font-variant-numeric:tabular-nums]">
      {stat.prefix && <span className="mr-0.5 text-xl font-semibold text-[var(--brand-accent)]/70 sm:text-2xl">{stat.prefix}</span>}
      <span className="text-4xl font-semibold text-fd-foreground sm:text-5xl">{display}</span>
      {stat.suffix && <span className="text-3xl font-semibold text-fd-foreground sm:text-4xl">{stat.suffix}</span>}
      <span className="ml-1 text-lg font-semibold text-[var(--brand-accent)] sm:text-xl">{stat.unit}</span>
    </div>
  );
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-y border-fd-border bg-fd-background py-16 sm:py-20">
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 lg:grid-cols-4"
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="home-panel flex flex-col items-center px-4 py-7 text-center transition-all duration-700"
            style={{
              transform: run ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: `${i * 90}ms`,
            }}
          >
            <StatValue stat={s} run={run} />

            <div className="mt-4 flex items-center gap-2 text-sm text-fd-muted-foreground">
              {s.live && (
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--brand-accent)] opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[var(--brand-accent)]" />
                </span>
              )}
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
