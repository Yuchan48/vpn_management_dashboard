const Impressum = () => {
  return (
    <div className="min-h-screen w-full bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl text-gray-800">
        <h1 className="text-4xl font-bold mb-10">Impressum</h1>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Angaben gemäß § 5 DDG</h2>

          <p className="leading-8">
            Yu Iizuka
            <br />
            Borner Str. 15
            <br />
            13051 Berlin
            <br />
            Deutschland
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>

          <p className="leading-8">
            Telefon: +49 152 2372 1160
            <br />
            E-Mail:{" "}
            <a
              href="mailto:yuchan.iizuka@gmail.com"
              className="text-blue-700 hover:underline"
            >
              yuchan.iizuka@gmail.com
            </a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Zweck der Website</h2>

          <p className="leading-8">
            Diese Website dient ausschließlich als Bewerbungsportfolio zur
            Präsentation von Arbeitsproben gegenüber potenziellen Arbeitgebern
            und Recruitern.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Urheberrecht</h2>

          <p className="leading-8">
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Impressum;
