'use client';
import { useEffect, useState, useRef } from 'react';
import Icon from '../shared/Icon.jsx';
const links = [
  ['/hizmetler', 'Hizmetler'],
  ['/yapilan-isler', 'Yapılan işler'],
  ['/hakkinda', 'Hakkımızda'],
  ['/yorumlar', 'Yorumlar'],
  ['/iletisim', 'İletişim'],
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef(null);
  useEffect(() => {
    if (!open) return;
    function key(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    }
    function outside(e) {
      if (!e.target.closest('header')) setOpen(false);
    }
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);
  return (
    <>
      <div className="header-spacer" aria-hidden="true" />
      <header className={open ? 'site-header menu-open' : 'site-header'}>
        <a className="brand" href="/" aria-label="Rıza Aydın Dekorasyon ana sayfa">
          <img className="brand-logo" src="/logo.svg" alt="" width="56" height="56" />
          <span>
            RIZA AYDIN<small>DEKORASYON & TADİLAT</small>
          </span>
        </a>
        <button
          ref={button}
          className="menu-toggle"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen(!open)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
        <nav id="site-navigation" aria-label="Ana menü">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <Icon name="arrow" />
            </a>
          ))}
        </nav>
        <a className="header-call" href="tel:+905392044342">
          <Icon name="phone" />
          0539 204 43 42
        </a>
      </header>
    </>
  );
}
