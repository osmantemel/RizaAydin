'use client';
export default function ErrorPage({ reset }) {
  return (
    <main className="reading">
      <h1>Sayfa yüklenemedi.</h1>
      <p>Lütfen yeniden deneyin veya 0539 204 43 42 numarasından ulaşın.</p>
      <button className="button" onClick={reset}>
        Tekrar dene
      </button>
    </main>
  );
}
