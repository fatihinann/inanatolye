import React from "react";
import ProductList from "../components/ProductList";

function Home() {
  return (
    <>
      <section className="about-us">
        <div>
          <div>
            <div className="image">
              <img src="images/fi2.jpg" alt="fatih inan" />
            </div>
            <div>
              <h3>Hakkımızda</h3>
              <p>
                Merhaba, ben Fatih ve babam Murat İNAN. Babam, yıllardır mobilya
                ve marangozluk alanında çalışan tecrübeli bir usta. Ben ise web
                geliştiriciyim. Geleneksel el işçiliğiyle modern teknolojiyi
                birleştirerek, ahşap tutkusunu dijital dünyaya taşımaya karar
                verdik. Babamın ekibi ve ustalığıyla, benim tasarım ve yazılım
                bilgimi bir araya getirerek bu projeye başladık.
              </p>
            </div>
          </div>
          <div>
            <div>
              <div>
                <h3>Neden Bu Siteyi Kurdum?</h3>
                <p>
                  Ahşap işçiliğine olan ilgimi, doğaya duyduğum merakla
                  birleştirerek hem bir portfolyo oluşturmak hem de yaptığımız
                  işleri paylaşmak istedim. Babamın yıllara dayanan marangozluk
                  tecrübesi ve benim dijital dünyadaki yetkinliklerimle bu
                  siteyi kurarak, el yapımı ahşap ürünleri herkesle buluşturmayı
                  amaçladık.
                </p>
              </div>
            </div>
            <div className="image">
              <img src="images/kamp.jpg" alt="fatih inan" />
            </div>
          </div>
        </div>
      </section>

      <ProductList />

      <section className="vision-mission">
        <div>
          <h3>Vizyonumuz</h3>
          <div>
            <p>
              Vizyonumuz, doğanın büyüsünü modern tasarımlarla birleştirerek,
              her bir ahşap ürünün özgün bir hikayesini yaşatmak. Ahşabın
              sıcaklığını ve doğallığını yaşam alanlarınıza taşıyarak
              hissettirmek, insanlarla doğa arasında bir köprü kurmak istiyoruz.
            </p>
          </div>
        </div>
        <div>
          <h3>Misyonumuz</h3>
          <div>
            <p>
              Misyonumuz, el yapımı ahşap ürünler ve mobilyalarla, hem
              geleneksel el işçiliğini hem de modern tasarımları bir araya
              getirmek. Babamın marangozluk deneyimi ve benim tasarım
              yeteneğimle, her bir ürünü özenle hazırlıyor ve sizlerle
              buluşturuyoruz. Amacım, doğayı yaşam alanlarınıza taşımak ve her
              bir ürünle sıcak bir dokunuş sunmak.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
