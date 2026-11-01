'use client';
import { useState } from 'react';
export default function ReviewForm() {
  const [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setStatus('Gönderiliyor…');
    try {
      const data = Object.fromEntries(new FormData(form));
      data.consent = form.elements.consent.checked;
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw Error(result.error);
      form.reset();
      setStatus('Teşekkürler. Yorumunuz onay için iletildi.');
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form id="review-form" onSubmit={submit}>
      <h2>Deneyiminizi paylaşın.</h2>
      <label>
        Adınız
        <input name="name" required maxLength={60} autoComplete="given-name" />
      </label>
      <label>
        Puanınız
        <select name="rating">
          <option value="5">5 — Çok iyi</option>
          <option value="4">4 — İyi</option>
          <option value="3">3 — Orta</option>
          <option value="2">2 — Kötü</option>
          <option value="1">1 — Çok kötü</option>
        </select>
      </label>
      <label>
        Yorumunuz
        <textarea name="text" required minLength={10} maxLength={1500} />
      </label>
      <label className="trap" aria-hidden="true">
        Web sitesi
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <p className="muted">
        Onaylanan yorumunuz ve adınız herkese açık görünür. Telefon, adres veya özel bilgi yazmayın.{' '}
        <a href="/gizlilik">Gizlilik bilgilendirmesi</a>
      </p>
      <label className="check">
        <input type="checkbox" name="consent" required />
        Adımın ve yorumumun sitede yayımlanmasını kabul ediyorum.
      </label>
      <button className="button" disabled={busy}>
        {busy ? 'Gönderiliyor…' : 'Yorumu gönder →'}
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
