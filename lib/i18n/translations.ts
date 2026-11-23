export const SUPPORTED_LANGS = [
  'en',
  'es',
  'pt',
  'hi',
  'id',
  'tr',
  'ru',
  'de',
  'fr',
  'it',
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export interface LanguageInfo {
  code: SupportedLang;
  name: string;
  flag: string;
}

export const LANGUAGES: Record<SupportedLang, LanguageInfo> = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  pt: { code: 'pt', name: 'Português', flag: '🇧🇷' },
  hi: { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  id: { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
};

export interface PageContent {
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  searchPlaceholder: string;
}

export interface LangTranslations {
  home: PageContent;
  stories: PageContent;
  reels: PageContent;
  storySaver: PageContent;
  instagramToMp4: PageContent;
}

export const TRANSLATIONS: Record<SupportedLang, LangTranslations> = {
  en: {
    home: {
      metaTitle: 'Anonymous Instagram Story Viewer & Downloader — InstaView',
      metaDescription:
        'Watch Instagram stories, highlights, reels, and posts anonymously without an account or login. Download HD media securely with 100% privacy and zero trace.',
      heroBadge: '100% Anonymous & Secure — No Login Required',
      heroTitle: 'Watch Instagram Stories ',
      heroHighlight: 'Anonymously',
      heroDescription:
        'View public Instagram stories, highlights, reels, and posts without an account or login. Save high-definition photos and MP4 videos with 100% privacy and zero digital footprint.',
      searchPlaceholder: 'Enter username or instagram.com/profile...',
    },
    stories: {
      metaTitle: 'Anonymous Instagram Story Viewer — Watch Stories Without Login',
      metaDescription:
        'Watch public Instagram stories 100% anonymously. View active 24-hour stories, photo updates, and video slides without being seen or leaving a trace.',
      heroBadge: 'Stealth Story Viewer & Archiver',
      heroTitle: 'Watch Instagram Stories ',
      heroHighlight: 'Without Leaving a Trace',
      heroDescription:
        'Stream public stories in crisp high definition without appearing on their view history. Download story photos and videos before they expire in 24 hours.',
      searchPlaceholder: 'Enter username to view active stories...',
    },
    reels: {
      metaTitle: 'Anonymous Instagram Reels Viewer & Downloader — InstaView',
      metaDescription:
        'Watch and download Instagram reels in full audio and HD MP4 quality anonymously. No login or app installation required.',
      heroBadge: 'High-Bitrate MP4 Video Downloader',
      heroTitle: 'Watch & Download ',
      heroHighlight: 'Instagram Reels Anonymously',
      heroDescription:
        'Stream public Instagram reels in crisp HD with full audio track playback. Save original high-bitrate MP4 videos without watermarks to your gallery.',
      searchPlaceholder: 'Enter username or reel link to view and download...',
    },
    storySaver: {
      metaTitle: 'Story Saver — Free Anonymous Instagram Story Saver & Downloader',
      metaDescription:
        'Save and download Instagram stories anonymously with Story Saver by InstaView. Watch active 24-hour stories and permanent highlights without an account.',
      heroBadge: 'The #1 Free Instagram Story Saver',
      heroTitle: 'Story Saver — Save Instagram Stories ',
      heroHighlight: '100% Anonymously',
      heroDescription:
        'Save active 24-hour stories, photo updates, and permanent highlight reels in full original resolution without leaving a trace. No login required.',
      searchPlaceholder: 'Enter username to save stories anonymously...',
    },
    instagramToMp4: {
      metaTitle: 'Instagram to MP4 Converter & Downloader in HD 1080p — InstaView',
      metaDescription:
        'Convert and download Instagram Reels, Stories, and Videos to original high-bitrate MP4 with crystal-clear audio. 100% free and anonymous.',
      heroBadge: 'Direct 1080p / 4K MP4 Video Converter',
      heroTitle: 'Convert Instagram to ',
      heroHighlight: 'MP4 in Original HD',
      heroDescription:
        'Extract and download Instagram Reels, Stories, and video posts directly to original high-bitrate MP4 files with crystal-clear audio. 100% free, zero compression.',
      searchPlaceholder: 'Enter username or paste Instagram link to convert to MP4...',
    },
  },

  es: {
    home: {
      metaTitle: 'Ver Historias de Instagram Anónimamente — InstaView',
      metaDescription:
        'Mira historias, reels, destacados y publicaciones de Instagram de forma 100% anónima sin cuenta ni registro. Descarga fotos y videos en calidad original HD.',
      heroBadge: '100% Anónimo y Seguro — Sin Registro',
      heroTitle: 'Ver Historias de Instagram ',
      heroHighlight: 'de Forma Anónima',
      heroDescription:
        'Accede a historias públicas, reels, fotos y destacados sin dejar rastro y sin iniciar sesión. Guarda fotos y videos MP4 en alta definición.',
      searchPlaceholder: 'Ingresa nombre de usuario o enlace de perfil...',
    },
    stories: {
      metaTitle: 'Visor Anónimo de Historias de Instagram — InstaView',
      metaDescription:
        'Mira historias de Instagram anónimamente. Disfruta de historias activas de 24 horas y destacados sin aparecer en la lista de vistos.',
      heroBadge: 'Visor Oculto de Historias',
      heroTitle: 'Ver Historias de Instagram ',
      heroHighlight: 'Sin Ser Visto',
      heroDescription:
        'Reproduce historias públicas en alta resolución sin alertar al usuario. Descarga fotos y videos antes de que caduquen en 24 horas.',
      searchPlaceholder: 'Ingresa usuario para ver historias activas...',
    },
    reels: {
      metaTitle: 'Descargar Reels de Instagram Gratis en HD — InstaView',
      metaDescription:
        'Mira y descarga Reels de Instagram en video MP4 de alta calidad con audio original de forma anónima y gratuita.',
      heroBadge: 'Descargador de Reels en MP4',
      heroTitle: 'Ver y Descargar ',
      heroHighlight: 'Reels de Instagram en HD',
      heroDescription:
        'Guarda reels de Instagram con audio completo en formato MP4 de alta resolución directamente en tu teléfono o PC.',
      searchPlaceholder: 'Ingresa usuario para ver y descargar reels...',
    },
    storySaver: {
      metaTitle: 'Story Saver en Español — Guardar Historias de Instagram',
      metaDescription:
        'Descarga y guarda historias de Instagram anónimamente con Story Saver. Guarda historias de 24 horas y álbumes destacados gratis.',
      heroBadge: 'El Story Saver #1 en Español',
      heroTitle: 'Story Saver — Guardar Historias ',
      heroHighlight: '100% Gratis y Anónimo',
      heroDescription:
        'Guarda historias de 24 horas y destacados de Instagram en calidad original sin que nadie lo sepa. Sin necesidad de descargar aplicaciones.',
      searchPlaceholder: 'Ingresa usuario para guardar historias...',
    },
    instagramToMp4: {
      metaTitle: 'Convertidor de Instagram a MP4 en HD — InstaView',
      metaDescription:
        'Convierte y descarga Reels y videos de Instagram a formato MP4 en calidad 1080p con audio limpio. Sin límite y anónimo.',
      heroBadge: 'Convertidor Directo a MP4',
      heroTitle: 'Convertir Instagram a ',
      heroHighlight: 'MP4 en Calidad Original',
      heroDescription:
        'Extrae videos y reels de Instagram a archivos MP4 de alta tasa de bits con audio original. Totalmente gratis y sin marcas de agua.',
      searchPlaceholder: 'Ingresa usuario o enlace para convertir a MP4...',
    },
  },

  pt: {
    home: {
      metaTitle: 'Ver Stories do Instagram Anonimamente — InstaView',
      metaDescription:
        'Assista stories, destaques, reels e posts do Instagram 100% anônimo sem login. Baixe fotos e vídeos em alta resolução HD com total privacidade.',
      heroBadge: '100% Anônimo e Seguro — Sem Login',
      heroTitle: 'Ver Stories do Instagram ',
      heroHighlight: 'Anonimamente',
      heroDescription:
        'Visualize stories públicos, destaques, reels e publicações sem que ninguém saiba e sem precisar de conta. Baixe fotos e vídeos em qualidade original.',
      searchPlaceholder: 'Digite o nome de usuário ou link do perfil...',
    },
    stories: {
      metaTitle: 'Visualizador Anônimo de Stories do Instagram — InstaView',
      metaDescription:
        'Veja stories do Instagram anonimamente. Assista stories de 24 horas e destaques sem aparecer na lista de visualizações.',
      heroBadge: 'Visualizador Furtivo de Stories',
      heroTitle: 'Ver Stories do Instagram ',
      heroHighlight: 'Sem Deixar Rastros',
      heroDescription:
        'Assista stories públicos em alta definição sem ser visto. Baixe fotos e vídeos antes de expirarem em 24 horas.',
      searchPlaceholder: 'Digite o usuário para ver stories ativos...',
    },
    reels: {
      metaTitle: 'Baixar Reels do Instagram Grátis em HD — InstaView',
      metaDescription:
        'Assista e baixe reels do Instagram em MP4 de alta qualidade com áudio original de forma 100% anônima e gratuita.',
      heroBadge: 'Download de Reels em MP4',
      heroTitle: 'Assistir e Baixar ',
      heroHighlight: 'Reels do Instagram em HD',
      heroDescription:
        'Baixe vídeos de reels com áudio completo e sem marca d’água em alta definição direto para o seu celular ou computador.',
      searchPlaceholder: 'Digite o usuário para baixar reels...',
    },
    storySaver: {
      metaTitle: 'Story Saver em Português — Baixar Stories do Instagram',
      metaDescription:
        'Salve stories do Instagram anonimamente com o Story Saver da InstaView. Baixe stories de 24 horas e destaques sem conta.',
      heroBadge: 'O Story Saver #1 do Brasil',
      heroTitle: 'Story Saver — Salvar Stories ',
      heroHighlight: '100% Grátis e Anônimo',
      heroDescription:
        'Salve stories de 24 horas e álbuns de destaques em resolução original sem deixar rastros. Sem login ou aplicativos.',
      searchPlaceholder: 'Digite o usuário para salvar stories...',
    },
    instagramToMp4: {
      metaTitle: 'Converter Instagram para MP4 em HD — InstaView',
      metaDescription:
        'Converta e baixe Reels, Stories e Vídeos do Instagram para MP4 original com áudio nítido. Grátis e anônimo.',
      heroBadge: 'Conversor Direto para MP4',
      heroTitle: 'Converter Instagram para ',
      heroHighlight: 'MP4 em Alta Definição',
      heroDescription:
        'Extraia vídeos e reels do Instagram em arquivos MP4 sem compressão com áudio original. 100% gratuito e seguro.',
      searchPlaceholder: 'Digite o usuário ou cole o link para converter para MP4...',
    },
  },

  hi: {
    home: {
      metaTitle: 'इंस्टाग्राम स्टोरी चुपके से देखें — InstaView',
      metaDescription:
        'बिना किसी खाते या लॉगिन के इंस्टाग्राम स्टोरीज़, रील्स और पोस्ट्स 100% गुप्त रूप से देखें और एचडी वीडियो डाउनलोड करें।',
      heroBadge: '100% सुरक्षित और गुप्त — कोई लॉगिन नहीं',
      heroTitle: 'इंस्टाग्राम स्टोरी देखें ',
      heroHighlight: 'बिल्कुल चुपके से',
      heroDescription:
        'सार्वजनिक इंस्टाग्राम स्टोरीज़, रील्स और फ़ोटो बिना अपना नाम दिखाए देखें। मूल एचडी गुणवत्ता में वीडियो और फ़ोटो सीधे डाउनलोड करें।',
      searchPlaceholder: 'यूज़रनेम या प्रोफ़ाइल लिंक दर्ज करें...',
    },
    stories: {
      metaTitle: 'सीक्रेट इंस्टाग्राम स्टोरी व्यूअर — InstaView',
      metaDescription:
        'इंस्टाग्राम स्टोरीज़ बिना देखे जाने के डर के देखें। 24-घंटे की स्टोरीज़ और हाइलाइट्स पूरी गोपनीयता के साथ डाउनलोड करें।',
      heroBadge: 'सीक्रेट स्टोरी व्यूअर',
      heroTitle: 'इंस्टाग्राम स्टोरी देखें ',
      heroHighlight: 'बिना किसी सबूत के',
      heroDescription:
        'व्यू लिस्ट में अपना नाम दिखाए बिना किसी भी सार्वजनिक प्रोफ़ाइल की स्टोरी देखें और 24 घंटे समाप्त होने से पहले सेव करें।',
      searchPlaceholder: 'स्टोरी देखने के लिए यूज़रनेम दर्ज करें...',
    },
    reels: {
      metaTitle: 'इंस्टाग्राम रील्स डाउनलोड करें एचडी में — InstaView',
      metaDescription:
        'इंस्टाग्राम रील्स वीडियो मूल ऑडियो के साथ एचडी एमपी4 फ़ॉर्मेट में मुफ़्त और बिना वॉटरमार्क डाउनलोड करें।',
      heroBadge: 'एचडी रील्स वीडियो डाउनलोडर',
      heroTitle: 'देखें और डाउनलोड करें ',
      heroHighlight: 'इंस्टाग्राम रील्स एचडी में',
      heroDescription:
        'इंस्टाग्राम रील्स को बिना वॉटरमार्क के अपने फोन में सीधे सेव करें। मूल ऑडियो और 1080p गुणवत्ता के साथ।',
      searchPlaceholder: 'रील्स डाउनलोड करने के लिए यूज़रनेम दर्ज करें...',
    },
    storySaver: {
      metaTitle: 'स्टोरी सेवर — इंस्टाग्राम स्टोरी डाउनलोडर',
      metaDescription:
        'इंस्टाग्राम स्टोरीज़ और हाइलाइट्स को आसानी से डाउनलोड करने के लिए सबसे तेज़ और सुरक्षित स्टोरी सेवर टूल।',
      heroBadge: 'सर्वश्रेष्ठ मुफ़्त स्टोरी सेवर',
      heroTitle: 'स्टोरी सेवर — इंस्टाग्राम स्टोरीज़ ',
      heroHighlight: '100% मुफ़्त में सेव करें',
      heroDescription:
        '24 घंटे की स्टोरीज़ और हाइलाइट्स को मूल एचडी गुणवत्ता में बिना किसी लॉगिन के अपने फ़ोन में सहेजें।',
      searchPlaceholder: 'स्टोरी सेव करने के लिए यूज़रनेम लिखें...',
    },
    instagramToMp4: {
      metaTitle: 'इंस्टाग्राम वीडियो को MP4 में बदलें — InstaView',
      metaDescription:
        'इंस्टाग्राम रील्स और वीडियो को सीधे MP4 फ़ॉर्मेट में बदलें और डाउनलोड करें। पूर्ण ऑडियो और 1080p गुणवत्ता।',
      heroBadge: 'डायरेक्ट MP4 कन्वर्टर',
      heroTitle: 'इंस्टाग्राम वीडियो को ',
      heroHighlight: 'MP4 में बदलें',
      heroDescription:
        'इंस्टाग्राम रील्स और वीडियो को बिना किसी कंप्रेशन के ओरिजिनल MP4 फ़ाइल के रूप में मुफ़्त में डाउनलोड करें।',
      searchPlaceholder: 'MP4 में बदलने के लिए लिंक या यूज़रनेम दर्ज करें...',
    },
  },

  id: {
    home: {
      metaTitle: 'Lihat Story Instagram Secara Anonim — InstaView',
      metaDescription:
        'Tonton story, reels, dan postingan Instagram secara 100% anonim tanpa akun atau login. Unduh video dan foto kualitas HD asli.',
      heroBadge: '100% Anonim & Aman — Tanpa Login',
      heroTitle: 'Lihat Story Instagram ',
      heroHighlight: 'Secara Anonim',
      heroDescription:
        'Lihat story, sorotan, reels, dan postingan publik tanpa ketahuan dan tanpa akun. Simpan foto dan video MP4 berkualitas tinggi.',
      searchPlaceholder: 'Masukkan username atau link profil...',
    },
    stories: {
      metaTitle: 'Viewer Story Instagram Anonim — InstaView',
      metaDescription:
        'Lihat story Instagram tanpa ketahuan pemiliknya. Tonton story 24 jam dan sorotan secara rahasia dan unduh dalam kualitas HD.',
      heroBadge: 'Viewer Story Tersembunyi',
      heroTitle: 'Tonton Story Instagram ',
      heroHighlight: 'Tanpa Meninggalkan Jejak',
      heroDescription:
        'Streaming story publik dalam kualitas jernih tanpa nama Anda muncul di daftar penonton. Unduh sebelum 24 jam berakhir.',
      searchPlaceholder: 'Masukkan username untuk melihat story aktif...',
    },
    reels: {
      metaTitle: 'Download Reels Instagram Kualitas HD Gratis — InstaView',
      metaDescription:
        'Tonton dan download reels Instagram dalam format MP4 HD dengan audio asli tanpa watermark secara anonim dan gratis.',
      heroBadge: 'Downloader Reels MP4',
      heroTitle: 'Tonton & Download ',
      heroHighlight: 'Reels Instagram HD',
      heroDescription:
        'Simpan video reels Instagram dengan audio lengkap tanpa watermark langsung ke galeri ponsel atau laptop Anda.',
      searchPlaceholder: 'Masukkan username untuk download reels...',
    },
    storySaver: {
      metaTitle: 'Story Saver Indonesia — Simpan Story Instagram',
      metaDescription:
        'Simpan story Instagram tanpa login dengan Story Saver. Unduh story 24 jam dan sorotan foto/video dalam kualitas asli.',
      heroBadge: 'Story Saver Gratis #1',
      heroTitle: 'Story Saver — Simpan Story ',
      heroHighlight: '100% Gratis & Anonim',
      heroDescription:
        'Simpan story 24 jam dan album sorotan dalam resolusi asli tanpa jejak digital. Tanpa perlu download aplikasi.',
      searchPlaceholder: 'Masukkan username untuk simpan story...',
    },
    instagramToMp4: {
      metaTitle: 'Konverter Instagram ke MP4 HD — InstaView',
      metaDescription:
        'Ubah dan download Reels serta Video Instagram ke format MP4 jernih dengan audio asli. 100% gratis dan anonim.',
      heroBadge: 'Konverter Langsung ke MP4',
      heroTitle: 'Konversi Instagram ke ',
      heroHighlight: 'MP4 Kualitas HD',
      heroDescription:
        'Ekstrak video reels dan story Instagram langsung ke file MP4 tanpa kompresi dengan audio jernih.',
      searchPlaceholder: 'Masukkan username atau link untuk konversi ke MP4...',
    },
  },

  tr: {
    home: {
      metaTitle: 'Anonim Instagram Hikaye İzleme ve İndirme — InstaView',
      metaDescription:
        'Instagram hikayelerini, öne çıkanları, reels ve gönderileri hesap olmadan %100 gizli izleyin. HD video ve fotoğrafları güvenle indirin.',
      heroBadge: '%100 Anonim ve Güvenli — Giriş Yok',
      heroTitle: 'Instagram Hikayelerini ',
      heroHighlight: 'Gizlice İzleyin',
      heroDescription:
        'Herkese açık hikayeleri, öne çıkanları ve reels videolarını adınız görünmeden izleyin. Yüksek çözünürlüklü MP4 videoları indirin.',
      searchPlaceholder: 'Kullanıcı adı veya profil bağlantısı girin...',
    },
    stories: {
      metaTitle: 'Gizli Instagram Hikaye İzleyici — InstaView',
      metaDescription:
        'Instagram hikayelerini gizlice izleyin. Görülme listesinde yer almadan 24 saatlik hikayeleri ve öne çıkanları görüntüleyin.',
      heroBadge: 'Gizli Hikaye İzleyici',
      heroTitle: 'Instagram Hikayelerini ',
      heroHighlight: 'İz Bırakmadan İzleyin',
      heroDescription:
        'Görüntüleme geçmişinde adınız çıkmadan hikayeleri HD izleyin. 24 saat dolmadan fotoğraf ve videoları indirin.',
      searchPlaceholder: 'Aktif hikayeleri görmek için kullanıcı adı girin...',
    },
    reels: {
      metaTitle: 'Instagram Reels İndirme HD Kalitede — InstaView',
      metaDescription:
        'Instagram reels videolarını orijinal ses kalitesiyle filigransız MP4 formatında anonim ve ücretsiz olarak indirin.',
      heroBadge: 'HD Reels Video İndirici',
      heroTitle: 'İzle ve İndir: ',
      heroHighlight: 'Instagram Reels HD',
      heroDescription:
        'Reels videolarını orijinal sesleri ve yüksek çözünürlükleriyle doğrudan galerinize filigransız olarak kaydedin.',
      searchPlaceholder: 'Reels indirmek için kullanıcı adı girin...',
    },
    storySaver: {
      metaTitle: 'Story Saver Türkçe — Instagram Hikaye Kaydedici',
      metaDescription:
        'Instagram hikayelerini Story Saver ile anonim olarak kaydedin. 24 saatlik hikayeleri ve öne çıkanları ücretsiz indirin.',
      heroBadge: '1 Numaralı Story Saver',
      heroTitle: 'Story Saver — Hikayeleri ',
      heroHighlight: '%100 Anonim Kaydet',
      heroDescription:
        '24 saatlik hikayeleri ve öne çıkan albümleri hesap açmadan orijinal kalitede indirin. Giriş veya uygulama gerektirmez.',
      searchPlaceholder: 'Hikaye kaydetmek için kullanıcı adı girin...',
    },
    instagramToMp4: {
      metaTitle: 'Instagram MP4 Dönüştürücü ve İndirici — InstaView',
      metaDescription:
        'Instagram reels ve videolarını net ses kalitesiyle 1080p MP4 formatına dönüştürüp indirin. %100 ücretsiz ve anonim.',
      heroBadge: 'Doğrudan MP4 Dönüştürücü',
      heroTitle: 'Instagram Videolarını ',
      heroHighlight: 'MP4 Formatına Dönüştür',
      heroDescription:
        'Reels ve video gönderilerini sıkıştırma olmadan orijinal MP4 dosyaları olarak indirin.',
      searchPlaceholder: 'MP4 dönüştürmek için link veya kullanıcı adı girin...',
    },
  },

  ru: {
    home: {
      metaTitle: 'Анонимный просмотр сторис Инстаграм — InstaView',
      metaDescription:
        'Смотрите истории, рилс, хайлайтс и посты Инстаграм анонимно без входа в аккаунт. Скачивайте фото и видео в оригинальном HD качестве.',
      heroBadge: '100% Анонимно и Безопасно — Без Логина',
      heroTitle: 'Смотрите истории Инстаграм ',
      heroHighlight: 'Анонимно',
      heroDescription:
        'Просматривайте публичные сторис, актуальное, рилс и посты без регистрации и без следов. Сохраняйте фото и видео в высоком разрешении.',
      searchPlaceholder: 'Введите имя пользователя или ссылку...',
    },
    stories: {
      metaTitle: 'Скрытый просмотр историй Инстаграм — InstaView',
      metaDescription:
        'Смотрите сторис Инстаграм инкогнито. 24-часовые истории и вечные хайлайтс без отображения в списке просмотров.',
      heroBadge: 'Скрытый просмотр историй',
      heroTitle: 'Смотреть сторис Инстаграм ',
      heroHighlight: 'Не оставляя следов',
      heroDescription:
        'Просматривайте публичные сторис в отличном качестве без уведомления автора. Скачивайте фото и видео до истечения 24 часов.',
      searchPlaceholder: 'Введите username для просмотра сторис...',
    },
    reels: {
      metaTitle: 'Скачать Рилс из Инстаграм в HD — InstaView',
      metaDescription:
        'Смотрите и скачивайте Reels из Instagram в формате MP4 с оригинальным звуком бесплатно и без водяных знаков.',
      heroBadge: 'Загрузчик Рилс в MP4',
      heroTitle: 'Смотреть и скачать ',
      heroHighlight: 'Instagram Reels в HD',
      heroDescription:
        'Сохраняйте видео рилс с чистым звуком без водяных знаков прямо на телефон или компьютер.',
      searchPlaceholder: 'Введите username для скачивания рилс...',
    },
    storySaver: {
      metaTitle: 'Story Saver на русском — Скачать сторис Инстаграм',
      metaDescription:
        'Сохраняйте истории Инстаграм анонимно с помощью Story Saver. Скачивайте 24-часовые сторис и альбомы без входа.',
      heroBadge: 'Лучший Story Saver',
      heroTitle: 'Story Saver — Сохраняйте сторис ',
      heroHighlight: '100% Бесплатно и Анонимно',
      heroDescription:
        'Сохраняйте 24-часовые истории и актуальные альбомы в оригинальном качестве без следов и без приложений.',
      searchPlaceholder: 'Введите username для сохранения сторис...',
    },
    instagramToMp4: {
      metaTitle: 'Конвертер Инстаграм в MP4 в HD 1080p — InstaView',
      metaDescription:
        'Конвертируйте и скачивайте рилс и видео из Инстаграм в формат MP4 с чистым звуком. Быстро, бесплатно и анонимно.',
      heroBadge: 'Прямой конвертер в MP4',
      heroTitle: 'Конвертировать Инстаграм в ',
      heroHighlight: 'MP4 в оригинальном HD',
      heroDescription:
        'Извлекайте видео и рилс прямо в оригинальные MP4 файлы без сжатия и без ограничений.',
      searchPlaceholder: 'Введите username или ссылку для конвертации в MP4...',
    },
  },

  de: {
    home: {
      metaTitle: 'Instagram Stories Anonym Anschauen & Downloaden — InstaView',
      metaDescription:
        'Schaue Instagram Stories, Highlights, Reels und Posts 100% anonym ohne Account oder Login. Lade HD-Videos und Fotos sicher herunter.',
      heroBadge: '100% Anonym & Sicher — Kein Login Nötig',
      heroTitle: 'Instagram Stories Anonym ',
      heroHighlight: 'Anschauen',
      heroDescription:
        'Öffentliche Instagram Stories, Highlights, Reels und Beiträge ansehen, ohne Spuren zu hinterlassen. Fotos und MP4-Videos in Originalqualität downloaden.',
      searchPlaceholder: 'Benutzername oder Profillink eingeben...',
    },
    stories: {
      metaTitle: 'Anonymer Instagram Story Viewer — InstaView',
      metaDescription:
        'Instagram Stories anonym ansehen. Betrachte 24-Stunden-Stories und Highlights, ohne in der Gesehen-Liste aufzutauchen.',
      heroBadge: 'Unsichtbarer Story Viewer',
      heroTitle: 'Instagram Stories Anschauen ',
      heroHighlight: 'Ohne Spuren zu Hinterlassen',
      heroDescription:
        'Streame öffentliche Stories in HD, ohne dass der Ersteller es merkt. Speichere Fotos und Videos vor Ablauf der 24 Stunden.',
      searchPlaceholder: 'Benutzername eingeben, um Stories zu sehen...',
    },
    reels: {
      metaTitle: 'Instagram Reels Downloaden in HD — InstaView',
      metaDescription:
        'Instagram Reels mit Originalton in bester MP4-Qualität anonym und kostenlos herunterladen. Ohne Wasserzeichen.',
      heroBadge: 'MP4 Reels Video Downloader',
      heroTitle: 'Anschauen & Downloaden: ',
      heroHighlight: 'Instagram Reels in HD',
      heroDescription:
        'Speichere Reels-Videos mit vollem Ton ohne Wasserzeichen direkt auf dein Smartphone oder deinen PC.',
      searchPlaceholder: 'Benutzername eingeben, um Reels zu laden...',
    },
    storySaver: {
      metaTitle: 'Story Saver Deutsch — Instagram Stories Speichern',
      metaDescription:
        'Speichere Instagram Stories anonym mit dem Story Saver von InstaView. 24-Stunden-Stories und Highlights kostenlos sichern.',
      heroBadge: 'Der #1 Story Saver',
      heroTitle: 'Story Saver — Stories Sichern ',
      heroHighlight: '100% Gratis & Anonym',
      heroDescription:
        'Sichere 24-Stunden-Stories und Highlight-Alben in Originalauflösung, ohne Spuren zu hinterlassen.',
      searchPlaceholder: 'Benutzername eingeben zum Speichern...',
    },
    instagramToMp4: {
      metaTitle: 'Instagram zu MP4 Konverter in 1080p — InstaView',
      metaDescription:
        'Konvertiere und lade Instagram Reels und Videos direkt als MP4-Datei mit Ton herunter. Schnell, gratis und anonym.',
      heroBadge: 'Direkter MP4 Konverter',
      heroTitle: 'Instagram Konvertieren in ',
      heroHighlight: 'MP4 in Original-HD',
      heroDescription:
        'Extrahiere Reels und Videobeiträge ohne Qualitätsverlust direkt in hochwertige MP4-Dateien.',
      searchPlaceholder: 'Link oder Benutzername eingeben für MP4-Download...',
    },
  },

  fr: {
    home: {
      metaTitle: 'Voir les Stories Instagram Anonymement — InstaView',
      metaDescription:
        'Regardez les stories, reels, highlights et publications Instagram de façon 100% anonyme sans compte ni connexion. Téléchargez en haute définition.',
      heroBadge: '100% Anonyme & Sécurisé — Sans Connexion',
      heroTitle: 'Regarder les Stories Instagram ',
      heroHighlight: 'Anonymement',
      heroDescription:
        'Consultez les stories publiques, reels, photos et à la une sans laisser de trace et sans compte. Téléchargez des photos et vidéos MP4 en HD.',
      searchPlaceholder: 'Entrez un nom d’utilisateur ou lien de profil...',
    },
    stories: {
      metaTitle: 'Visionneuse Anonyme de Stories Instagram — InstaView',
      metaDescription:
        'Regardez des stories Instagram en toute discrétion. Consultez les stories de 24 heures et les réels sans apparaître dans les vues.',
      heroBadge: 'Visionneuse Invisible de Stories',
      heroTitle: 'Voir les Stories Instagram ',
      heroHighlight: 'Sans Laisser de Trace',
      heroDescription:
        'Regardez les stories publiques en haute définition sans que l’auteur ne le sache. Téléchargez avant l’expiration de 24h.',
      searchPlaceholder: 'Entrez un nom d’utilisateur pour voir les stories...',
    },
    reels: {
      metaTitle: 'Télécharger Reels Instagram en HD Gratuit — InstaView',
      metaDescription:
        'Regardez et téléchargez des reels Instagram en format vidéo MP4 avec audio d’origine, sans filigrane et gratuitement.',
      heroBadge: 'Téléchargeur de Reels en MP4',
      heroTitle: 'Regarder & Télécharger ',
      heroHighlight: 'Reels Instagram en HD',
      heroDescription:
        'Enregistrez des vidéos reels avec audio complet sans filigrane directement sur votre téléphone ou ordinateur.',
      searchPlaceholder: 'Entrez un nom d’utilisateur pour télécharger des reels...',
    },
    storySaver: {
      metaTitle: 'Story Saver Français — Enregistrer Stories Instagram',
      metaDescription:
        'Enregistrez des stories Instagram anonymement avec Story Saver. Téléchargez des stories de 24 heures et des temps forts gratuitement.',
      heroBadge: 'Le Story Saver #1 Gratuit',
      heroTitle: 'Story Saver — Enregistrer Stories ',
      heroHighlight: '100% Gratuit et Anonyme',
      heroDescription:
        'Enregistrez les stories de 24 heures et les albums à la une en résolution d’origine sans laisser de trace.',
      searchPlaceholder: 'Entrez un utilisateur pour enregistrer des stories...',
    },
    instagramToMp4: {
      metaTitle: 'Convertisseur Instagram en MP4 en HD — InstaView',
      metaDescription:
        'Convertissez et téléchargez des reels et vidéos Instagram en MP4 avec audio limpide. 100% gratuit et anonyme.',
      heroBadge: 'Convertisseur Direct MP4',
      heroTitle: 'Convertir Instagram en ',
      heroHighlight: 'MP4 en Qualité HD',
      heroDescription:
        'Extrayez des vidéos et des reels directement en fichiers MP4 sans compression avec un son de qualité.',
      searchPlaceholder: 'Entrez un nom ou collez un lien pour convertir en MP4...',
    },
  },

  it: {
    home: {
      metaTitle: 'Visualizza Storie Instagram in Anonimo — InstaView',
      metaDescription:
        'Guarda storie, reel, contenuti in evidenza e post di Instagram al 100% anonimo senza account né login. Scarica video e foto in HD.',
      heroBadge: '100% Anonimo e Sicuro — Nessun Login Richiesto',
      heroTitle: 'Guarda Storie Instagram ',
      heroHighlight: 'in Modo Anonimo',
      heroDescription:
        'Visualizza storie pubbliche, reel e post senza che nessuno lo sappia e senza effettuare l’accesso. Salva foto e video MP4 in qualità originale.',
      searchPlaceholder: 'Inserisci nome utente o link del profilo...',
    },
    stories: {
      metaTitle: 'Visualizzatore Anonimo di Storie Instagram — InstaView',
      metaDescription:
        'Guarda storie di Instagram anonimamente. Visualizza storie di 24 ore e contenuti in evidenza senza comparire nell’elenco visualizzazioni.',
      heroBadge: 'Visualizzatore Invisibile di Storie',
      heroTitle: 'Guarda Storie Instagram ',
      heroHighlight: 'Senza Lasciare Tracce',
      heroDescription:
        'Guarda storie pubbliche in alta definizione senza farti notare. Scarica foto e video prima che scadano in 24 ore.',
      searchPlaceholder: 'Inserisci nome utente per vedere le storie...',
    },
    reels: {
      metaTitle: 'Scarica Reel Instagram in HD Gratis — InstaView',
      metaDescription:
        'Guarda e scarica i Reel di Instagram in formato video MP4 con audio originale in modo anonimo e gratuito.',
      heroBadge: 'Scaricatore di Reel in MP4',
      heroTitle: 'Guarda e Scarica ',
      heroHighlight: 'Reel Instagram in HD',
      heroDescription:
        'Salva i video dei reel con audio completo e senza watermark direttamente sulla tua galleria o sul computer.',
      searchPlaceholder: 'Inserisci nome utente per scaricare reel...',
    },
    storySaver: {
      metaTitle: 'Story Saver Italiano — Salva Storie Instagram',
      metaDescription:
        'Salva storie Instagram anonimamente con Story Saver di InstaView. Scarica storie di 24 ore e contenuti in evidenza gratis.',
      heroBadge: 'Lo Story Saver #1 Gratis',
      heroTitle: 'Story Saver — Salva Storie ',
      heroHighlight: '100% Gratis e Anonimo',
      heroDescription:
        'Salva le storie di 24 ore e gli album in evidenza in risoluzione originale senza lasciare tracce digitali.',
      searchPlaceholder: 'Inserisci nome utente per salvare storie...',
    },
    instagramToMp4: {
      metaTitle: 'Convertitore Instagram in MP4 in HD — InstaView',
      metaDescription:
        'Converti e scarica Reel e video di Instagram in formato MP4 con audio pulito. Veloce, gratis e anonimo.',
      heroBadge: 'Convertitore Diretto MP4',
      heroTitle: 'Converti Instagram in ',
      heroHighlight: 'MP4 in Qualità HD',
      heroDescription:
        'Estrai video e reel direttamente in file MP4 ad alto bitrate senza compressione e con audio originale.',
      searchPlaceholder: 'Inserisci nome utente o link per convertire in MP4...',
    },
  },
};

export function getLanguage(code: string): LanguageInfo {
  return LANGUAGES[code as SupportedLang] || LANGUAGES.en;
}

export function isSupportedLang(code: string): code is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(code);
}

export function getTranslations(code: string): LangTranslations {
  if (isSupportedLang(code)) {
    return TRANSLATIONS[code];
  }
  return TRANSLATIONS.en;
}
