import type { Locale } from '@/lib/i18n';
import styles from './graph-lifecycle-flow.module.css';

const copy = {
  zh: {
    title: 'Graph 使用时序',
    stages: [
      { title: '创建实例', method: 'new Graph()', detail: '容器已挂载，准备画布' },
      { title: '首次渲染', method: 'await graph.render()', detail: '等待初始化完成' },
      { title: '运行中', method: '更新数据 / 重新布局', detail: '↻ 复用实例，按需更新' },
      { title: '销毁', method: 'graph.destroy()', detail: '释放实例资源' },
    ],
    caption: '运行阶段可以反复更新或布局；页面退出、组件卸载时，即使初始化仍在进行，也应销毁实例。',
  },
  en: {
    title: 'Graph usage sequence',
    stages: [
      { title: 'Create', method: 'new Graph()', detail: 'Mounted container, canvas setup' },
      { title: 'First render', method: 'await graph.render()', detail: 'Wait for initialization' },
      { title: 'Use', method: 'Update / relayout', detail: '↻ Reuse the instance' },
      { title: 'Destroy', method: 'graph.destroy()', detail: 'Release instance resources' },
    ],
    caption:
      'Updates and layouts can repeat during use. Destroy the instance when leaving the page or unmounting, even if initialization is still in progress.',
  },
};

export function GraphLifecycleFlow({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <figure className={`${styles.figure} not-prose`} aria-label={text.title}>
      <ol className={styles.stages}>
        {text.stages.map((stage) => (
          <li className={styles.stage} key={stage.title}>
            <strong>{stage.title}</strong>
            <span className={styles.method}>{stage.method}</span>
            <span className={styles.detail}>{stage.detail}</span>
          </li>
        ))}
      </ol>
      <figcaption className={styles.caption}>{text.caption}</figcaption>
    </figure>
  );
}
