// app/fonts.js
import localFont from 'next/font/local';

export const ibmArabic = localFont({
  src: [
    {
      path: '../public/fonts/IBMPlexSansArabic/IBMPlexSansArabic-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBMPlexSansArabic/IBMPlexSansArabic-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBMPlexSansArabic/IBMPlexSansArabic-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBMPlexSansArabic/IBMPlexSansArabic-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBMPlexSansArabic/IBMPlexSansArabic-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ibm-arabic',
  display: 'swap',
});
