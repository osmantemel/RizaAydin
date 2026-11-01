export default function manifest() {
  return {
    name: 'Rıza Aydın Dekorasyon',
    short_name: 'Rıza Dekorasyon',
    description: 'İstanbul ve Kocaeli’de fayans, boya ve tadilat.',
    start_url: '/',
    display: 'browser',
    background_color: '#f6f3ec',
    theme_color: '#203b31',
    lang: 'tr',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
