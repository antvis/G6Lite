import localFont from 'next/font/local';

/** Source Han Sans SC Medium, subset to the characters used across the site. */
export const headingFont = localFont({
  src: '../components/homepage/fonts/heading-medium.woff2',
  weight: '500',
  display: 'swap',
  variable: '--font-homepage-heading',
  adjustFontFallback: false,
});
