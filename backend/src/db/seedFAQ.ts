import pool from './client';

// FAQ categories data
const FAQ_CATEGORIES = [
  { id: "microcement", name: "Microcement & Applied Finishes", nameId: "Microcement & Finishing Diterapkan", displayOrder: 1 },
  { id: "panels", name: "Architectural Panels", nameId: "Panel Arsitektural", displayOrder: 2 },
  { id: "3d-tiles", name: "3D Tiles", nameId: "Ubin 3D", displayOrder: 3 },
  { id: "installation", name: "Installation", nameId: "Instalasi", displayOrder: 4 },
  { id: "performance", name: "Performance & Specifications", nameId: "Kinerja & Spesifikasi", displayOrder: 5 },
  { id: "shipping", name: "Shipping & Delivery", nameId: "Pengiriman & Pengantaran", displayOrder: 6 },
];

// FAQ data - extracted from PublicFAQ.tsx
const FAQ_DATA: Record<string, Array<{q: string, qId: string, a: string, aId: string}>> = {
  microcement: [
    {
      q: "What are seamless microcement finishes used for?",
      qId: "Untuk apa finishing microcement tanpa sambungan digunakan?",
      a: "Seamless microcement finishes are thin, continuous coatings applied directly to floors, walls, and furniture surfaces. They create joint-free, monolithic surfaces ideal for residential homes, hotels, restaurants, retail spaces, and commercial buildings. Perfect for bathrooms, kitchens, feature walls, and outdoor terraces where a seamless aesthetic is desired.",
      aId: "Finishing microcement tanpa sambungan adalah lapisan tipis dan kontinyu yang diterapkan langsung pada lantai, dinding, dan permukaan furnitur. Mereka menciptakan permukaan tanpa sambungan dan monolitik yang ideal untuk rumah residensial, hotel, restoran, ruang ritel, dan bangunan komersial. Sempurna untuk kamar mandi, dapur, dinding feature, dan teras luar ruangan di mana estetika tanpa sambungan diinginkan.",
    },
    {
      q: "What are the benefits of seamless microcement finishes?",
      qId: "Apa keuntungan finishing microcement tanpa sambungan?",
      a: "• Seamless application — no joints or grout lines\n• 2–3 mm applied thickness on existing substrates\n• 60+ curated color palettes with custom pigmentation available\n• Waterproof and UV-resistant sealants for interior and exterior use\n• Moisture-resistant for bathrooms and wet areas\n• Easy maintenance and cleaning\n• Can be applied over tiles, concrete, wood, and other stable substrates",
      aId: "• Aplikasi tanpa sambungan — tidak ada sambungan atau garis nat\n• Ketebalan diterapkan 2–3 mm pada substrat yang ada\n• Lebih dari 60 palet warna kurasi dengan pigmen khusus tersedia\n• Sealant tahan air dan UV untuk penggunaan interior dan eksterior\n• Tahan kelembaban untuk kamar mandi dan area basah\n• Perawatan dan pembersihan mudah\n• Dapat diterapkan di atas ubin, beton, kayu, dan substrat stabil lainnya",
    },
    {
      q: "What surfaces can microcement be applied to?",
      qId: "Permukaan apa yang bisa diaplikasikan microcement?",
      a: "• Concrete floors and walls\n• Ceramic or porcelain tiles\n• Wooden floors and panels\n• Plastered or rendered surfaces\n• Gypsum board or drywall (with proper preparation)\n• Existing terrazzo or polished concrete\n• Metal surfaces (with primer)\n• Most stable, clean substrates",
      aId: "• Lantai dan dinding beton\n• Ubin keramik atau porselen\n• Lantai dan panel kayu\n• Permukaan plester atau render\n• Papan gypsum atau drywall (dengan persiapan yang tepat)\n• Terrazzo atau beton poles yang ada\n• Permukaan logam (dengan primer)\n• Sebagian besar substrat stabil dan bersih",
    },
    {
      q: "Are microcement finishes waterproof and suitable for bathrooms?",
      qId: "Apakah finishing microcement tahan air dan cocok untuk kamar mandi?",
      a: "Yes. Our microcement systems include waterproof sealants that penetrate deep into the surface, making them fully waterproof and suitable for bathrooms, wet rooms, kitchens, and exterior applications. The seamless application eliminates joints where water could penetrate.",
      aId: "Ya. Sistem microcement kami mencakup sealant tahan air yang menembus jauh ke dalam permukaan, membuatnya sepenuhnya tahan air dan cocok untuk kamar mandi, ruang basah, dapur, dan aplikasi eksterior. Aplikasi tanpa sambungan menghilangkan sambungan di mana air bisa masuk.",
    },
    {
      q: "What thickness is microcement applied at?",
      qId: "Berapa ketebalan microcement yang diterapkan?",
      a: "Standard microcement finishes are applied at 2–3 mm thickness. For high-traffic commercial areas, we offer enhanced systems with 3–5 mm thickness for increased durability and impact resistance.",
      aId: "Finishing microcement standar diterapkan pada ketebalan 2–3 mm. Untuk area komersial lalu lintas tinggi, kami menawarkan sistem yang ditingkatkan dengan ketebalan 3–5 mm untuk meningkatkan daya tahan dan ketahanan benturan.",
    },
    {
      q: "What colors and finishes are available for microcement?",
      qId: "Warna dan finishing apa yang tersedia untuk microcement?",
      a: "We offer 60+ curated color palettes including natural greys, earthy tones, warm beiges, and contemporary shades. Custom colors can be created to match your design vision. Finishes include smooth, brushed, textured, and metallic effect options.",
      aId: "Kami menawarkan lebih dari 60 palet warna kurasi termasuk abu-abu alami, nada earthy, beige hangat, dan nuansa kontemporer. Warna khusus dapat dibuat untuk mencocokkan visi desain Anda. Finishing mencakup opsi halus, brushed, bertekstur, dan efek logam.",
    },
    {
      q: "Does microcement fade over time?",
      qId: "Apakah microcement memudar seiring waktu?",
      a: "Our microcement systems use UV-stable pigments and penetrating sealants that resist fading. The finish develops a natural patina over time while maintaining its color integrity. Regular maintenance with recommended products helps preserve the appearance.",
      aId: "Sistem microcement kami menggunakan pigmen stabil UV dan sealant penetrasi yang tahan memudar. Finishing berkembang menjadi patina alami seiring waktu sambil mempertahankan integritas warnanya. Perawatan rutin dengan produk yang direkomendasikan membantu menjaga penampilan.",
    },
  ],
  panels: [
    {
      q: "What are architectural concrete panels used for?",
      qId: "Untuk apa panel beton arsitektural digunakan?",
      a: "Architectural concrete panels are precast cladding panels designed to bring the authentic look and performance of concrete without the heavy weight. They are used for wall cladding in residential homes, luxury apartments, hotels, commercial buildings, and facades as a superior alternative to traditional materials.",
      aId: "Panel beton arsitektural adalah panel cladding precast yang dirancang untuk membawa tampilan dan kinerja beton yang autentik tanpa bobot yang berat. Mereka digunakan untuk cladding dinding di rumah residensial, apartemen mewah, hotel, bangunan komersial, dan fasad sebagai alternatif yang lebih unggul dari bahan tradisional.",
    },
    {
      q: "What are the benefits of architectural concrete panels?",
      qId: "Apa keuntungan panel beton arsitektural?",
      a: "• Lightweight yet strong — easier installation than traditional concrete\n• Fireproof and non-combustible\n• Weather-resistant for exterior applications\n• Custom sizes, textures, and finishes available\n• Precast precision manufacturing ensures consistent quality\n• Faster installation compared to cast-in-place concrete\n• Durable and low-maintenance",
      aId: "• Ringan namun kuat — instalasi lebih mudah daripada beton tradisional\n• Tahan api dan tidak mudah terbakar\n• Tahan cuaca untuk aplikasi eksterior\n• Ukuran, tekstur, dan finishing khusus tersedia\n• Manufaktur presisi precast memastikan kualitas konsisten\n• Instalasi lebih cepat dibandingkan beton cast-in-place\n• Tahan lama dan perawatan rendah",
    },
    {
      q: "What surfaces can architectural panels be installed on?",
      qId: "Permukaan apa yang bisa dipasang panel arsitektural?",
      a: "• Concrete walls\n• Brickwork\n• Steel frames\n• Timber frames or OSB\n• Gypsum board or drywall (with proper support)\n• Cement board\n• ICF (Insulated Concrete Forms)\n• Most stable structural substrates",
      aId: "• Dinding beton\n• Pekerjaan bata\n• Rangka baja\n• Rangka kayu atau OSB\n• Papan gypsum atau drywall (dengan dukungan yang tepat)\n• Papan semen\n• ICF (Insulated Concrete Forms)\n• Sebagian besar substrat struktural yang stabil",
    },
    {
      q: "Are architectural panels fireproof?",
      qId: "Apakah panel arsitektural tahan api?",
      a: "Yes, our architectural concrete panels are completely non-combustible. They will not ignite, spread flames, or emit toxic smoke, making them ideal for fire-rated applications and building codes requiring non-combustible materials.",
      aId: "Ya, panel beton arsitektural kami sepenuhnya tidak mudah terbakar. Mereka tidak akan menyala, menyebarkan api, atau mengeluarkan asap beracun, membuatnya ideal untuk aplikasi fire-rated dan kode bangunan yang memerlukan bahan tidak mudah terbakar.",
    },
    {
      q: "What are the standard sizes of architectural panels?",
      qId: "Apa ukuran standar panel arsitektural?",
      a: "Standard sizes include:\n• 1200×600 mm (47.24\"×23.62\")\n• 1300×530 mm (51.18\"×20.86\")\n• 1000×500 mm (39.37\"×19.68\")\n• Custom sizes available on request",
      aId: "Ukuran standar meliputi:\n• 1200×600 mm (47.24\"×23.62\")\n• 1300×530 mm (51.18\"×20.86\")\n• 1000×500 mm (39.37\"×19.68\")\n• Ukuran khusus tersedia atas permintaan",
    },
    {
      q: "How much do architectural panels weigh?",
      qId: "Berapa berat panel arsitektural?",
      a: "Our lightweight architectural panels weigh approximately 15–20 kg/m² depending on thickness and design, making them significantly lighter than traditional concrete while maintaining structural integrity.",
      aId: "Panel arsitektural ringan kami memiliki berat sekitar 15–20 kg/m² tergantung pada ketebalan dan desain, membuatnya jauh lebih ringan daripada beton tradisional sambil mempertahankan integritas struktural.",
    },
    {
      q: "What finishes are available for architectural panels?",
      qId: "Finishing apa yang tersedia untuk panel arsitektural?",
      a: "We offer natural textured finishes, smooth refined surfaces, custom textures, and various surface treatments. Custom finishes including exposed aggregates, patterns, and pigmentation can be created to match your design vision.",
      aId: "Kami menawarkan finishing bertekstur alami, permukaan halus yang disempurnakan, tekstur khusus, dan berbagai perawatan permukaan. Finishing khusus termasuk agregat ekspos, pola, dan pigmentasi dapat dibuat untuk mencocokkan visi desain Anda.",
    },
  ],
  "3d-tiles": [
    {
      q: "What are 3D concrete tiles used for?",
      qId: "Untuk apa ubin beton 3D digunakan?",
      a: "3D concrete tiles create unique feature walls with depth, texture, and shadow play. They are popular in contemporary homes, restaurants, hotels, retail spaces, and commercial interiors where visual impact and acoustic performance are important.",
      aId: "Ubin beton 3D menciptakan dinding feature yang unik dengan kedalaman, tekstur, dan permainan bayangan. Mereka populer di rumah kontemporer, restoran, hotel, ruang ritel, dan interior komersial di mana dampak visual dan kinerja akustik penting.",
    },
    {
      q: "Can 3D tiles be used in bathrooms or kitchens?",
      qId: "Bisakah ubin 3D digunakan di kamar mandi atau dapur?",
      a: "Yes. Our 3D concrete tiles are sealed front and back, making them waterproof and suitable for bathrooms and kitchens. The grout-free installation system requires a properly prepared, waterproof substrate to ensure long-lasting performance.",
      aId: "Ya. Ubin beton 3D kami disegel di depan dan belakang, membuatnya tahan air dan cocok untuk kamar mandi dan dapur. Sistem instalasi tanpa nat memerlukan substrat yang disiapkan dengan baik dan tahan air untuk memastikan kinerja jangka panjang.",
    },
    {
      q: "Can 3D tiles be used outdoors?",
      qId: "Bisakah ubin 3D digunakan di luar ruangan?",
      a: "Absolutely. Our 3D concrete tiles are fully sealed and weather-resistant, making them suitable for exterior applications including facades, outdoor feature walls, and landscape elements. Proper substrate preparation and waterproofing are essential for outdoor installations.",
      aId: "Tentu saja. Ubin beton 3D kami sepenuhnya disegel dan tahan cuaca, membuatnya cocok untuk aplikasi eksterior termasuk fasad, dinding feature luar ruangan, dan elemen lanskap. Persiapan substrat dan waterproofing yang tepat sangat penting untuk instalasi luar ruangan.",
    },
    {
      q: "Do 3D tiles improve acoustics?",
      qId: "Apakah ubin 3D meningkatkan akustik?",
      a: "Yes. 3D wall tiles improve acoustics by scattering sound waves across their angled and curved surfaces. This reduces echo and reverberation, creating a softer and more comfortable sound environment in open interiors, restaurants, and commercial spaces.",
      aId: "Ya. Ubin dinding 3D meningkatkan akustik dengan menyebarkan gelombang suara di permukaan miring dan melengkung mereka. Ini mengurangi gema dan reverberasi, menciptakan lingkungan suara yang lebih lembut dan nyaman di interior terbuka, restoran, dan ruang komersial.",
    },
    {
      q: "What patterns are available for 3D tiles?",
      qId: "Pola apa yang tersedia untuk ubin 3D?",
      a: "We offer multiple 3D patterns including geometric designs, organic forms, wave patterns, and custom designs. Each pattern creates unique light and shadow effects. Custom patterns can be developed to match your specific design requirements.",
      aId: "Kami menawarkan beberapa pola 3D termasuk desain geometris, bentuk organik, pola gelombang, dan desain khusus. Setiap pola menciptakan efek cahaya dan bayangan yang unik. Pola khusus dapat dikembangkan untuk mencocokkan kebutuhan desain spesifik Anda.",
    },
    {
      q: "How are 3D tiles installed?",
      qId: "Bagaimana ubin 3D dipasang?",
      a: "3D tiles are mounted with high-tack polymer adhesives on prepared substrates. Installation is grout-free with tight spacing to maintain the clean visual effect. For larger walls, we recommend using a laser level for precise alignment. Professional installation is recommended for best results.",
      aId: "Ubin 3D dipasang dengan perekat polimer high-tack pada substrat yang disiapkan. Instalasi tanpa nat dengan jarak ketat untuk mempertahankan efek visual yang bersih. Untuk dinding yang lebih besar, kami merekomendasikan menggunakan laser level untuk penyelarasan yang tepat. Instalasi profesional direkomendasikan untuk hasil terbaik.",
    },
  ],
  installation: [
    {
      q: "How do you install seamless microcement?",
      qId: "Bagaimana cara memasang microcement tanpa sambungan?",
      a: "Microcement is applied in multiple layers:\n1. Substrate preparation — clean, stable, and primed surface\n2. Base coat application\n3. Color coat application\n4. Protective sealer application\nEach layer is applied by trained applicators using specialized tools to ensure seamless, uniform coverage.",
      aId: "Microcement diterapkan dalam beberapa lapisan:\n1. Persiapan substrat — permukaan bersih, stabil, dan di-primer\n2. Aplikasi base coat\n3. Aplikasi color coat\n4. Aplikasi sealant pelindung\nSetiap lapisan diterapkan oleh aplikator terlatih menggunakan alat khusus untuk memastikan cakupan tanpa sambungan dan seragam.",
    },
    {
      q: "How do you install architectural panels?",
      qId: "Bagaimana cara memasang panel arsitektural?",
      a: "Architectural panels can be installed using:\n• High-tack polymer adhesive — fast and economical bonding\n• Mechanical fixing with brackets or clips — concealed, removable option\n• Anchor hole fixing — screws with caps for visible or service areas\n• Frame mounting — for steel or timber frame structures\nOur installation guide provides detailed instructions for each method.",
      aId: "Panel arsitektural dapat dipasang menggunakan:\n• Perekat polimer high-tack — ikatan cepat dan ekonomis\n• Pemasangan mekanis dengan bracket atau klip — opsi tersembunyi, dapat dilepas\n• Pemasangan lubang anchor — sekrup dengan tutup untuk area terlihat atau servis\n• Pemasangan rangka — untuk struktur rangka baja atau kayu\nPanduan instalasi kami memberikan instruksi detail untuk setiap metode.",
    },
    {
      q: "Can I install microcement or panels myself?",
      qId: "Bisakah saya memasang microcement atau panel sendiri?",
      a: "Small interior microcement applications can be DIY-friendly with proper preparation and following our guidelines. However, for best results and long-term performance, we strongly recommend professional installation by our certified applicators. Architectural panels and large-scale projects should always be installed by professionals.",
      aId: "Aplikasi microcement interior kecil dapat dilakukan sendiri dengan persiapan yang tepat dan mengikuti pedoman kami. Namun, untuk hasil terbaik dan kinerja jangka panjang, kami sangat merekomendasikan instalasi profesional oleh aplikator bersertifikat kami. Panel arsitektural dan proyek skala besar harus selalu dipasang oleh profesional.",
    },
    {
      q: "What surfaces need to be prepared before installation?",
      qId: "Permukaan apa yang perlu dipersiapkan sebelum instalasi?",
      a: "All surfaces must be:\n• Clean and free of dust, debris, oil, or moisture\n• Stable and structurally sound\n• Level and smooth (for microcement)\n• Primed with appropriate primer (as specified)\n• Dry and at proper temperature\nProper substrate preparation is critical for long-lasting results.",
      aId: "Semua permukaan harus:\n• Bersih dan bebas dari debu, puing, minyak, atau kelembaban\n• Stabil dan struktural sound\n• Rata dan halus (untuk microcement)\n• Di-primer dengan primer yang sesuai (seperti yang ditentukan)\n• Kering dan pada suhu yang tepat\nPersiapan substrat yang tepat sangat penting untuk hasil yang tahan lama.",
    },
    {
      q: "How do I cut panels or tiles during installation?",
      qId: "Bagaimana cara memotong panel atau ubin selama instalasi?",
      a: "Panels and tiles should be cut using a quality non-serrated diamond blade on either a circular saw or hand grinder. Cut slowly with proper dust control measures for safety. Always wear protective equipment and follow manufacturer guidelines for cutting.",
      aId: "Panel dan ubin harus dipotong menggunakan mata gergaji berlian non-serrated berkualitas pada gergaji bundar atau gerinda tangan. Potong perlahan dengan langkah-langkah kontrol debu yang tepat untuk keselamatan. Selalu kenakan peralatan pelindung dan ikuti pedoman produsen untuk pemotongan.",
    },
    {
      q: "What common mistakes should be avoided during installation?",
      qId: "Kesalahan umum apa yang harus dihindari selama instalasi?",
      a: "Common mistakes to avoid:\n• Not following manufacturer specifications\n• Using incorrect adhesives or sealants\n• Insufficient substrate preparation\n• Ignoring temperature and humidity requirements\n• Rushing the application process\n• Not performing pull-off tests (for panels)\n• Over-tightening mechanical fixings\nAlways follow our installation guidelines for best results.",
      aId: "Kesalahan umum yang harus dihindari:\n• Tidak mengikuti spesifikasi produsen\n• Menggunakan perekat atau sealant yang salah\n• Persiapan substrat tidak cukup\n• Mengabaikan persyaratan suhu dan kelembaban\n• Terburu-buru dalam proses aplikasi\n• Tidak melakukan pull-off test (untuk panel)\n• Terlalu mengencangkan pemasangan mekanis\nSelalu ikuti pedoman instalasi kami untuk hasil terbaik.",
    },
  ],
  performance: [
    {
      q: "How strong are your concrete products?",
      qId: "Seberapa kuat produk beton Anda?",
      a: "Our architectural panels achieve compressive strengths of 45–55 MPa and flexural strength of 17–21 MPa, outperforming fibre cement and plasterboard. Microcement systems provide excellent adhesion and durability. All products resist impact, bending, and vibration without cracking.",
      aId: "Panel arsitektural kami mencapai kekuatan tekan 45–55 MPa dan kekuatan lentur 17–21 MPa, mengungguli fibre cement dan plasterboard. Sistem microcement memberikan adhesi dan daya tahan yang sangat baik. Semua produk tahan benturan, lentur, dan getaran tanpa retak.",
    },
    {
      q: "Are your products eco-friendly?",
      qId: "Apakah produk Anda ramah lingkungan?",
      a: "Yes. Our products use reduced embodied CO₂, integrate recycled aggregates where possible, and are produced with efficient manufacturing processes. Their long life cycle means fewer replacements compared to cheaper alternatives. Lightweight transport further cuts emissions. We continuously work to improve our environmental impact.",
      aId: "Ya. Produk kami menggunakan CO₂ tertanam yang berkurang, mengintegrasikan agregat daur ulang jika memungkinkan, dan diproduksi dengan proses manufaktur yang efisien. Siklus hidup panjang mereka berarti lebih sedikit penggantian dibandingkan alternatif yang lebih murah. Transportasi ringan lebih lanjut mengurangi emisi. Kami terus bekerja untuk meningkatkan dampak lingkungan kami.",
    },
    {
      q: "How durable are your products in severe weather?",
      qId: "Seberapa tahan lama produk Anda dalam cuaca ekstrem?",
      a: "Our products withstand rain, humidity, frost, UV exposure, and salt exposure—ideal for exterior applications in all climates including tropical, coastal, and desert environments. Proper installation and maintenance ensure long-term performance.",
      aId: "Produk kami tahan hujan, kelembaban, embun beku, paparan UV, dan paparan garam—ideal untuk aplikasi eksterior di semua iklim termasuk lingkungan tropis, pesisir, dan gurun. Instalasi dan perawatan yang tepat memastikan kinerja jangka panjang.",
    },
    {
      q: "Are products suitable for coastal areas with salt exposure?",
      qId: "Apakah produk cocok untuk area pesisir dengan paparan garam?",
      a: "Yes. Our products are engineered with dense, high-performance mixes that resist salt, moisture, and corrosion. Penetrating sealers provide additional protection, making them well-suited for coastal environments where salt exposure is common.",
      aId: "Ya. Produk kami dirancang dengan campuran padat dan berkinerja tinggi yang tahan garam, kelembaban, dan korosi. Sealant penetrasi memberikan perlindungan tambahan, membuatnya cocok untuk lingkungan pesisir di mana paparan garam umum terjadi.",
    },
    {
      q: "Do your products help with thermal insulation?",
      qId: "Apakah produk Anda membantu dengan insulasi termal?",
      a: "Our architectural panels provide improved thermal insulation compared to traditional concrete, helping to reduce heat flow through walls and improve energy efficiency. This contributes to better year-round comfort in residential and commercial interiors.",
      aId: "Panel arsitektural kami memberikan insulasi termal yang lebih baik dibandingkan beton tradisional, membantu mengurangi aliran panas melalui dinding dan meningkatkan efisiensi energi. Ini berkontribusi pada kenyamanan sepanjang tahun yang lebih baik di interior residensial dan komersial.",
    },
    {
      q: "What maintenance do your products require?",
      qId: "Perawatan apa yang diperlukan produk Anda?",
      a: "Our products are low-maintenance. Regular cleaning with recommended products is usually sufficient. Microcement may require periodic resealing depending on traffic and exposure. Architectural panels require minimal maintenance. We provide maintenance guidelines with each product.",
      aId: "Produk kami berperawatan rendah. Pembersihan rutin dengan produk yang direkomendasikan biasanya sudah cukup. Microcement mungkin memerlukan resealing berkala tergantung pada lalu lintas dan paparan. Panel arsitektural memerlukan perawatan minimal. Kami menyediakan pedoman perawatan dengan setiap produk.",
    },
  ],
  shipping: [
    {
      q: "Do you offer international shipping?",
      qId: "Apakah Anda menawarkan pengiriman internasional?",
      a: "Yes. We offer shipping throughout Southeast Asia and internationally. All products are carefully packed in reinforced crates with protective materials to ensure safe, reliable delivery. Contact us for shipping options to your location.",
      aId: "Ya. Kami menawarkan pengiriman ke seluruh Asia Tenggara dan internasional. Semua produk dikemas dengan hati-hati dalam peti yang diperkuat dengan bahan pelindung untuk memastikan pengiriman yang aman dan dapat diandalkan. Hubungi kami untuk opsi pengiriman ke lokasi Anda.",
    },
    {
      q: "What is the lead time for delivery?",
      qId: "Berapa waktu tunggu untuk pengiriman?",
      a: "Lead times vary depending on product type, quantity, and customization requirements. Standard products typically ship within 1–2 weeks. Custom orders and large projects may require 3–6 weeks. Please contact us for an accurate delivery timeline for your specific project.",
      aId: "Waktu tunggu bervariasi tergantung pada jenis produk, kuantitas, dan persyaratan kustomisasi. Produk standar biasanya dikirim dalam 1–2 minggu. Pesanan khusus dan proyek besar mungkin memerlukan 3–6 minggu. Silakan hubungi kami untuk timeline pengiriman yang akurat untuk proyek spesifik Anda.",
    },
    {
      q: "How much does shipping cost?",
      qId: "Berapa biaya pengiriman?",
      a: "Shipping costs vary by destination, order size, and product type. We provide detailed shipping quotes based on your specific requirements. Contact us with your project details for an accurate shipping estimate.",
      aId: "Biaya pengiriman bervariasi berdasarkan tujuan, ukuran pesanan, dan jenis produk. Kami menyediakan penawaran pengiriman detail berdasarkan persyaratan spesifik Anda. Hubungi kami dengan detail proyek Anda untuk perkiraan pengiriman yang akurat.",
    },
    {
      q: "How are products packaged for shipping?",
      qId: "Bagaimana produk dikemas untuk pengiriman?",
      a: "All products are carefully packaged in reinforced wooden crates with protective interleaves and foam impact protection to prevent damage during transit. Panels are individually wrapped and secured. We take great care to ensure products arrive in perfect condition.",
      aId: "Semua produk dikemas dengan hati-hati dalam peti kayu yang diperkuat dengan interleaves pelindung dan perlindungan benturan busa untuk mencegah kerusakan selama transit. Panel dibungkus secara individual dan diamankan. Kami sangat berhati-hati untuk memastikan produk tiba dalam kondisi sempurna.",
    },
    {
      q: "Do you offer samples?",
      qId: "Apakah Anda menawarkan sampel?",
      a: "Yes, we offer samples of our products so you can see and feel the quality, texture, and colors before making a decision. Contact us to request samples for your project.",
      aId: "Ya, kami menawarkan sampel produk kami sehingga Anda dapat melihat dan merasakan kualitas, tekstur, dan warna sebelum membuat keputusan. Hubungi kami untuk meminta sampel untuk proyek Anda.",
    },
  ],
};

export async function seedFAQ() {
  const client = await pool.connect();
  try {
    // Clear existing data (outside transaction)
    try {
      await client.query('DELETE FROM faq_items');
    } catch (e: any) {
      if (e.code !== '42P01') {
        console.warn('Warning clearing FAQ items:', e.message);
      }
    }
    try {
      await client.query('DELETE FROM faq_categories');
    } catch (e: any) {
      if (e.code !== '42P01') {
        console.warn('Warning clearing FAQ categories:', e.message);
      }
    }

    await client.query('BEGIN');

    // Insert categories
    console.log('🌱 Seeding FAQ categories...');
    for (const category of FAQ_CATEGORIES) {
      await client.query(
        `INSERT INTO faq_categories (id, name, name_id, display_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = $2,
           name_id = $3,
           display_order = $4,
           updated_at = CURRENT_TIMESTAMP`,
        [category.id, category.name, category.nameId, category.displayOrder]
      );
    }
    console.log(`✅ Seeded ${FAQ_CATEGORIES.length} FAQ categories`);

    // Insert FAQ items
    console.log('🌱 Seeding FAQ items...');
    let itemCount = 0;
    for (const [categoryId, items] of Object.entries(FAQ_DATA)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          `INSERT INTO faq_items (category_id, question, question_id, answer, answer_id, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [categoryId, item.q, item.qId, item.a, item.aId, i + 1]
        );
        itemCount++;
      }
    }
    console.log(`✅ Seeded ${itemCount} FAQ items`);

    await client.query('COMMIT');
    console.log('🎉 FAQ data seeding completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ FAQ seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedFAQ()
    .then(() => {
      console.log('✅ FAQ seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ FAQ seeding error:', error);
      process.exit(1);
    });
}

