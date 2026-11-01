'use client';
import { useState, useEffect, useRef } from 'react';
import Icon from '../shared/Icon.jsx';
const emptyPost = {
  id: '',
  title: '',
  kind: 'Yapılan iş',
  district: '',
  text: '',
  image: '',
  published: false,
};
async function api(path, data) {
  const r = await fetch('/api/' + path, {
    ...(data
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      : {}),
    cache: 'no-store',
  });
  let result;
  try {
    result = await r.json();
  } catch {
    throw Error('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
  }
  if (!r.ok) {
    const error = Error(result.error || 'İşlem tamamlanamadı.');
    error.status = r.status;
    throw error;
  }
  return result;
}
export default function AdminPanel() {
  const [content, setContent] = useState(null),
    [tab, setTab] = useState('settings'),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [checking, setChecking] = useState(true),
    [post, setPost] = useState(emptyPost);
  const fileInput = useRef(null),
    editor = useRef(null);
  async function refresh() {
    try {
      setContent(await api('admin'));
    } catch (e) {
      if (e.status === 401) setContent(null);
      else setStatus(e.message);
      throw e;
    }
  }
  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  async function action(data, message) {
    setBusy(true);
    setStatus('Kaydediliyor…');
    try {
      await api('admin', data);
      await refresh();
      setStatus(message);
      return true;
    } catch (e) {
      setStatus(e.message);
      if (e.status === 401) setContent(null);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function login(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await api('login', { password: form.elements.password.value });
      form.reset();
      await refresh();
      setStatus('Giriş yapıldı.');
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  function resetPost() {
    setPost({ ...emptyPost });
    if (fileInput.current) fileInput.current.value = '';
  }
  async function upload(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setStatus('En fazla 4 MB boyutunda JPEG, PNG veya WebP seçin.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    setStatus('Fotoğraf yükleniyor…');
    try {
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': f.type },
        body: f,
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error);
      setPost((p) => ({ ...p, image: result.url }));
      setStatus('Fotoğraf hazır. Paylaşımı kaydederek tamamlayın.');
    } catch (e) {
      setStatus(e.message);
    } finally {
      setUploading(false);
    }
  }
  const field = (key, value) => setPost((p) => ({ ...p, [key]: value }));
  return (
    <>
      <div className="notice">RIZA AYDIN DEKORASYON · YÖNETİM</div>
      <main className="admin-wrap">
        <div className="admin-top">
          <h1>Merhaba, Rıza Usta.</h1>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Siteyi görüntüle ↗
          </a>
          {content && (
            <button
              className="small-button"
              disabled={busy}
              onClick={async () => {
                try {
                  await api('logout', {});
                  setContent(null);
                  setStatus('Çıkış yapıldı.');
                  resetPost();
                } catch (e) {
                  setStatus(e.message);
                }
              }}
            >
              Çıkış yap
            </button>
          )}
        </div>
        <p className="status" role="status">
          {status}
        </p>
        {checking ? (
          <p>Panel yükleniyor…</p>
        ) : !content ? (
          <section id="login" className="panel">
            <h2>Yönetim paneline giriş</h2>
            <p>İçeriklerinizi ve müşteri yorumlarını buradan yönetin.</p>
            <form onSubmit={login}>
              <label>
                Yönetici şifresi
                <input
                  type="password"
                  name="password"
                  required
                  maxLength={256}
                  autoComplete="current-password"
                />
              </label>
              <button className="button" disabled={busy}>
                {busy ? 'Giriş yapılıyor…' : 'Giriş yap →'}
              </button>
            </form>
          </section>
        ) : (
          <>
            <div className="admin-note">
              İçeriklerinizi buradan yönetebilirsiniz. Hazır paylaşımlarınızı “Sitede yayımla”
              seçeneğiyle ziyaretçilere açın.
            </div>
            <nav className="admin-tabs" aria-label="Panel bölümleri">
              {[
                ['settings', 'Site metinleri'],
                ['services', 'Hizmet metinleri'],
                ['posts', 'İşler & gönderiler'],
                [
                  'reviews',
                  `Yorumlar (${content.reviews.filter((r) => !r.approved).length} bekleyen)`,
                ],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={tab === key ? 'active' : ''}
                  aria-pressed={tab === key}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </nav>
            {tab === 'settings' && (
              <section className="panel">
                <h2>Site metinleri</h2>
                <form
                  key={JSON.stringify([
                    content.headline,
                    content.intro,
                    content.about,
                    content.hours,
                  ])}
                  onSubmit={(e) => {
                    e.preventDefault();
                    action(
                      { action: 'settings', ...Object.fromEntries(new FormData(e.currentTarget)) },
                      'Site metinleri kaydedildi.',
                    );
                  }}
                >
                  <label>
                    Ana sayfa başlığı
                    <textarea
                      name="headline"
                      required
                      maxLength={150}
                      defaultValue={content.headline}
                    />
                  </label>
                  <label>
                    Tanıtım metni
                    <textarea name="intro" required maxLength={1000} defaultValue={content.intro} />
                  </label>
                  <label>
                    Hakkımızda
                    <textarea name="about" required maxLength={3000} defaultValue={content.about} />
                  </label>
                  <label>
                    Çalışma saatleri
                    <input name="hours" maxLength={200} defaultValue={content.hours} />
                  </label>
                  <button className="button" disabled={busy}>
                    Değişiklikleri kaydet
                  </button>
                </form>
              </section>
            )}
            {tab === 'services' && (
              <section className="panel">
                <h2>Hizmet metinleri</h2>
                <form
                  key={JSON.stringify(content.serviceTexts)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const services = {};
                    for (const slug of Object.keys(content.serviceTexts)) {
                      services[slug] = {};
                      for (const key of ['title', 'summary', 'text'])
                        services[slug][key] = data.get(slug + '-' + key);
                    }
                    action({ action: 'services', services }, 'Hizmet metinleri kaydedildi.');
                  }}
                >
                  {Object.entries(content.serviceTexts).map(([slug, s]) => (
                    <fieldset key={slug}>
                      <legend>{s.title}</legend>
                      <label>
                        Hizmet adı
                        <input
                          name={slug + '-title'}
                          defaultValue={s.title}
                          required
                          maxLength={100}
                        />
                      </label>
                      <label>
                        Kısa açıklama
                        <input
                          name={slug + '-summary'}
                          defaultValue={s.summary}
                          required
                          maxLength={250}
                        />
                      </label>
                      <label>
                        Hizmet açıklaması
                        <textarea
                          name={slug + '-text'}
                          defaultValue={s.text}
                          required
                          maxLength={5000}
                        />
                      </label>
                    </fieldset>
                  ))}
                  <button className="button" disabled={busy}>
                    Hizmetleri kaydet
                  </button>
                </form>
              </section>
            )}
            {tab === 'posts' && (
              <section className="admin-grid">
                <div className="panel" ref={editor}>
                  <h2>{post.id ? 'Paylaşımı düzenle' : 'Yeni paylaşım'}</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (
                        await action(
                          { action: 'post', ...post },
                          post.published ? 'Paylaşım yayımlandı.' : 'Taslak kaydedildi.',
                        )
                      )
                        resetPost();
                    }}
                  >
                    <label>
                      Başlık
                      <input
                        value={post.title}
                        onChange={(e) => field('title', e.target.value)}
                        required
                        maxLength={150}
                      />
                    </label>
                    <label>
                      Tür
                      <select value={post.kind} onChange={(e) => field('kind', e.target.value)}>
                        <option>Yapılan iş</option>
                        <option>Ustadan notlar</option>
                      </select>
                    </label>
                    <label>
                      İlçe / bölge
                      <input
                        value={post.district}
                        onChange={(e) => field('district', e.target.value)}
                        maxLength={100}
                        placeholder="Örn. Çayırova"
                      />
                    </label>
                    <label>
                      Açıklama
                      <textarea
                        value={post.text}
                        onChange={(e) => field('text', e.target.value)}
                        required
                        maxLength={15000}
                      />
                    </label>
                    <label>
                      Fotoğraf (JPEG, PNG, WebP · en fazla 4 MB)
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={upload}
                        disabled={uploading || busy}
                      />
                    </label>
                    {post.image && (
                      <>
                        <img className="preview-upload" src={post.image} alt="Paylaşım fotoğrafı" />
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => {
                            field('image', '');
                            if (fileInput.current) fileInput.current.value = '';
                          }}
                        >
                          Fotoğrafı kaldır
                        </button>
                      </>
                    )}
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={post.published}
                        onChange={(e) => field('published', e.target.checked)}
                      />
                      Sitede yayımla
                    </label>
                    <div className="admin-actions">
                      <button className="button" disabled={busy || uploading}>
                        {uploading ? 'Fotoğraf yükleniyor…' : 'Kaydet'}
                      </button>
                      <button
                        type="button"
                        className="small-button"
                        disabled={busy || uploading}
                        onClick={resetPost}
                      >
                        Yeni gönderi
                      </button>
                    </div>
                  </form>
                </div>
                <div className="panel">
                  <h2>Paylaşımlarınız</h2>
                  {content.posts.length ? (
                    content.posts.map((p) => (
                      <div className="admin-item" key={p.id}>
                        <h3>{p.title}</h3>
                        <p>
                          {p.published ? 'Yayında' : 'Taslak'} · {p.district}
                        </p>
                        <button
                          className="small-button"
                          disabled={busy || uploading}
                          onClick={() => {
                            setPost({ ...p });
                            editor.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Düzenle
                        </button>
                        {p.published && (
                          <a
                            className="small-button"
                            href={'/gonderi/' + p.id}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Görüntüle
                          </a>
                        )}
                        <button
                          className="small-button danger"
                          disabled={busy}
                          onClick={async () => {
                            if (confirm('Bu paylaşım silinsin mi?')) {
                              if (
                                await action(
                                  { action: 'delete-post', id: p.id },
                                  'Paylaşım silindi.',
                                )
                              )
                                if (post.id === p.id) resetPost();
                            }
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>Henüz gönderi yok.</p>
                  )}
                </div>
              </section>
            )}
            {tab === 'reviews' && (
              <section className="panel">
                <h2>Yorumları yönetin</h2>
                <p>Yalnızca onayladığınız yorumlar sitede görünür.</p>
                {content.reviews.length ? (
                  content.reviews.map((r) => (
                    <div className="admin-item" key={r.id}>
                      <strong>
                        {r.name} · {r.rating}/5
                      </strong>
                      <p>{r.text}</p>
                      <p>{r.approved ? 'Yayında' : 'Onay bekliyor'}</p>
                      <button
                        className="small-button"
                        disabled={busy}
                        onClick={() =>
                          action(
                            { action: 'review', id: r.id, approved: !r.approved },
                            'Yorum güncellendi.',
                          )
                        }
                      >
                        {r.approved ? 'Yayından kaldır' : 'Onayla'}
                      </button>
                      <button
                        className="small-button danger"
                        disabled={busy}
                        onClick={() => {
                          if (confirm('Yorum kalıcı olarak silinsin mi?'))
                            action({ action: 'delete-review', id: r.id }, 'Yorum silindi.');
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Henüz yorum yok.</p>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
