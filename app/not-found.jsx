import { Shell, Heading } from '../components/site/Site.jsx';
export default function NotFound() {
  return (
    <Shell>
      <Heading
        label="404"
        title="Bu sayfayı bulamadık."
        text="Hizmetlerimize ana sayfadan ulaşabilirsiniz."
      />
      <section className="reading">
        <a className="button" href="/">
          Ana sayfaya dön
        </a>
      </section>
    </Shell>
  );
}
