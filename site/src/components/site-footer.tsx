import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { AntVLogo } from '@/components/antv-logo';
import { homepageCopy } from '@/components/homepage/content';
import { localizedPath, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import { headingFont } from '@/lib/site-font';

import styles from './site-footer.module.css';

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = homepageCopy[locale].footer;
  const home = localizedPath('/', locale);
  const groups = [
    {
      title: copy.groups[0],
      labels: copy.product,
      hrefs: [`${home}#workflow`, `${home}#scenarios`, localizedPath('/ai', locale)],
    },
    {
      title: copy.groups[1],
      labels: copy.developer,
      hrefs: [
        localizedPath('/docs', locale),
        localizedPath('/docs/getting-started/quick-start', locale),
        localizedPath('/docs/api', locale),
      ],
    },
    {
      title: copy.groups[2],
      labels: copy.community,
      hrefs: [
        siteConfig.repository,
        siteConfig.repository + '/issues',
        localizedPath('/docs/changelog', locale),
      ],
    },
    {
      title: copy.groups[3],
      labels: ['AntV', 'G6', 'AVA'],
      hrefs: [
        'https://antv.antgroup.com/',
        'https://g6.antv.antgroup.com/',
        'https://ava.antv.vision/',
      ],
    },
  ];

  return (
    <footer className={`${styles.footer} ${headingFont.variable}`}>
      <div className={styles.shell}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <span>
              <AntVLogo />
              <i /> G6Lite
            </span>
            <p>{copy.description}</p>
            <Link href={home}>
              {copy.home} <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              {group.labels.map((label, index) => (
                <Link href={group.hrefs[index]} key={label}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
