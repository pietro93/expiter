/**
 * SEO Builder Utility
 * Generates SEO meta tags, descriptions, and structured data
 * Supports all 5 languages
 */

class SEOBuilder {
  constructor(baseUrl = 'https://expiter.com', language = 'en') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.language = language;
    this.translations = this.loadTranslations();
  }

  /**
   * Load translation strings for SEO content
   * @returns {Object} Translations object
   */
  loadTranslations() {
    return {
      en: {
        quality: 'Quality of Life',
        costOfLiving: 'Cost of Living',
        safety: 'Safety',
        healthcare: 'Healthcare',
        climate: 'Climate',
        explore: 'Explore',
        discover: 'Discover everything about',
        inItaly: 'in Italy',
        viewMore: 'View more details',
      },
      it: {
        quality: 'Qualità della Vita',
        costOfLiving: 'Costo della Vita',
        safety: 'Sicurezza',
        healthcare: 'Sanità',
        climate: 'Clima',
        explore: 'Esplora',
        discover: 'Scopri tutto su',
        inItaly: 'in Italia',
        viewMore: 'Visualizza più dettagli',
      },
      de: {
        quality: 'Lebensqualität',
        costOfLiving: 'Lebenshaltungskosten',
        safety: 'Sicherheit',
        healthcare: 'Gesundheitswesen',
        climate: 'Klima',
        explore: 'Erkunden',
        discover: 'Entdecke alles über',
        inItaly: 'in Italien',
        viewMore: 'Weitere Details anzeigen',
      },
      es: {
        quality: 'Calidad de Vida',
        costOfLiving: 'Costo de Vida',
        safety: 'Seguridad',
        healthcare: 'Salud',
        climate: 'Clima',
        explore: 'Explorar',
        discover: 'Descubre todo sobre',
        inItaly: 'en Italia',
        viewMore: 'Ver más detalles',
      },
      fr: {
        quality: 'Qualité de Vie',
        costOfLiving: 'Coût de la Vie',
        safety: 'Sécurité',
        healthcare: 'Santé',
        climate: 'Climat',
        explore: 'Explorer',
        discover: 'Découvrez tout sur',
        inItaly: 'en Italie',
        viewMore: 'Voir plus de détails',
      },
    };
  }

  /**
   * Get translation string
   * @param {string} key - Translation key
   * @param {string} lang - Language code
   * @returns {string} Translated string
   */
  t(key, lang = null) {
    const language = lang || this.language;
    return this.translations[language]?.[key] || this.translations.en[key] || key;
  }

  /**
   * Build meta tags for a province
   * @param {Object} province - Province object with name, region, quality metrics
   * @returns {Object} Meta tags object
   */
  buildMetaTags(province) {
    if (!province || !province.name) {
      return this.buildDefaultMetaTags();
    }

    const title = this.buildProvinceTitle(province);
    const description = this.buildProvinceDescription(province);
    const keywords = this.buildProvinceKeywords(province);
    const image = this.buildOGImage(province);
    const canonical = `${this.baseUrl}/province/${province.slug || this.toSlug(province.name)}`;
    const url = canonical;

    return {
      title,
      description,
      keywords,
      image,
      canonical,
      url,
      type: 'article',
      lang: this.language,
      author: 'Expiter',
      publishedTime: new Date().toISOString(),
      modifiedTime: province.lastUpdated || new Date().toISOString(),
      // Open Graph
      og: {
        title,
        description,
        image,
        url,
        type: 'article',
      },
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image,
      },
    };
  }

  /**
   * Build province title for SEO
   * @param {Object} province - Province object
   * @returns {string} SEO-optimized title
   */
  buildProvinceTitle(province) {
    const translate = (key) => this.t(key);

    if (this.language === 'en') {
      return `${province.name}, ${province.region} Province in Italy - ${translate('quality')}, ${translate('costOfLiving')} & More`;
    }
    if (this.language === 'it') {
      return `${province.name} - ${translate('quality')}, ${translate('costOfLiving')} e Sicurezza in ${province.region}`;
    }
    if (this.language === 'de') {
      return `${province.name} - ${translate('quality')} und ${translate('costOfLiving')} in ${province.region}`;
    }
    if (this.language === 'es') {
      return `${province.name} - ${translate('quality')} y ${translate('costOfLiving')} en ${province.region}`;
    }
    if (this.language === 'fr') {
      return `${province.name} - ${translate('quality')} et ${translate('costOfLiving')} en ${province.region}`;
    }

    return `${province.name}, Italy`;
  }

  /**
   * Build province description for SEO
   * @param {Object} province - Province object
   * @returns {string} Meta description
   */
  buildProvinceDescription(province) {
    const translate = (key) => this.t(key);
    const healthcare = province.quality?.healthcare || province.healthcare || 7;
    const safety = province.quality?.safety || province.safety || 7;
    const cost = province.costOfLiving?.singlePerson || province.cost?.singlePerson || 0;

    let desc = translate('discover') + ` ${province.name}`;

    if (province.region) {
      desc += ` ${province.region}`;
    }

    desc += `. ${translate('quality')}: ${healthcare}/10, ${translate('safety')}: ${safety}/10`;

    if (cost > 0) {
      desc += `. €${Math.round(cost)}/month living costs.`;
    }

    desc += ` ${translate('viewMore')}`;

    return desc.substring(0, 160); // Google's limit
  }

  /**
   * Build keywords for province
   * @param {Object} province - Province object
   * @returns {string} Comma-separated keywords
   */
  buildProvinceKeywords(province) {
    const keywords = [
      province.name,
      province.region,
      'Italy',
      this.t('quality'),
      this.t('costOfLiving'),
      this.t('safety'),
      this.t('healthcare'),
      this.t('climate'),
      'expat',
      'digital nomad',
      'living guide',
    ];

    return keywords.join(', ');
  }

  /**
   * Build Open Graph image URL
   * @param {Object} province - Province object
   * @returns {string} Image URL
   */
  buildOGImage(province) {
    const slug = province.slug || this.toSlug(province.name);
    return `${this.baseUrl}/og-images/province/${slug}.jpg`;
  }

  /**
   * Build meta tags for comparison page
   * @param {Array<Object>} provinces - Array of provinces being compared
   * @returns {Object} Meta tags object
   */
  buildComparisonMetaTags(provinces) {
    if (!Array.isArray(provinces) || provinces.length === 0) {
      return this.buildDefaultMetaTags();
    }

    const names = provinces.map(p => p.name).join(' vs ');
    const title = `Compare ${names} - ${this.t('quality')}, ${this.t('costOfLiving')} & Safety`;
    const description = `Compare ${provinces.length} Italian provinces: ${this.t('quality')}, costs, safety, climate, and more. Make the best choice for your move or relocation.`.substring(0, 160);
    const keywords = `${provinces.map(p => p.name).join(', ')}, province comparison, Italy, ${this.t('costOfLiving')}, ${this.t('quality')}`;
    const url = `${this.baseUrl}/compare/${provinces.map(p => p.slug || this.toSlug(p.name)).join('-vs-')}`;

    return {
      title,
      description,
      keywords,
      image: `${this.baseUrl}/og-images/comparison.jpg`,
      canonical: url,
      url,
      type: 'article',
      lang: this.language,
    };
  }

  /**
   * Build structured data (JSON-LD) for schema.org
   * @param {Object} province - Province object
   * @returns {string} JSON-LD script tag content
   */
  buildStructuredData(province) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: province.name,
      address: {
        '@type': 'PostalAddress',
        addressRegion: province.region,
        addressCountry: 'IT',
      },
      url: `${this.baseUrl}/province/${province.slug}`,
      description: province.description || '',
    };

    if (province.population) {
      structuredData.population = province.population;
    }

    if (province.area) {
      structuredData.areaServed = `${province.area} km²`;
    }

    return JSON.stringify(structuredData, null, 2);
  }

  /**
   * Build meta tags for homepage
   * @returns {Object} Homepage meta tags
   */
  buildHomepage() {
    const translate = (key) => this.t(key);
    let title, description;

    if (this.language === 'en') {
      title = `Expiter - Find Your Perfect Italian Province | Quality, Safety & Cost of Living`;
      description = `Explore 107 Italian provinces with detailed insights on quality of life, cost of living, safety, healthcare, and climate. Perfect for expats and digital nomads.`;
    } else if (this.language === 'it') {
      title = `Expiter - Scopri la Provincia Italiana Perfetta | Qualità della Vita e Costi`;
      description = `Esplora 107 province italiane con informazioni dettagliate su qualità della vita, costo della vita, sicurezza, sanità e clima. Perfetto per stranieri e nomadi digitali.`;
    } else if (this.language === 'de') {
      title = `Expiter - Finde deine perfekte italienische Provinz | Lebensqualität & Kosten`;
      description = `Erkunde 107 italienische Provinzen mit detaillierten Informationen zu Lebensqualität, Lebenshaltungskosten, Sicherheit, Gesundheitswesen und Klima.`;
    } else if (this.language === 'es') {
      title = `Expiter - Encuentra tu Provincia Italiana Perfecta | Calidad de Vida y Costos`;
      description = `Explora 107 provincias italianas con información detallada sobre calidad de vida, costo de vida, seguridad, sanidad y clima.`;
    } else if (this.language === 'fr') {
      title = `Expiter - Trouvez votre Province Italienne Parfaite | Qualité de Vie et Coûts`;
      description = `Explorez 107 provinces italiennes avec des informations détaillées sur la qualité de vie, le coût de la vie, la sécurité, la santé et le climat.`;
    } else {
      title = `Expiter - Find Your Perfect Italian Province`;
      description = `Explore Italian provinces with detailed insights on quality of life, cost of living, safety, and more.`;
    }

    const keywords = `Italian provinces, quality of life, cost of living, Italy expat guides, digital nomad, relocation, safety, healthcare, climate`;
    const canonical = this.baseUrl;

    return {
      title,
      description,
      keywords,
      image: `${this.baseUrl}/og-images/homepage.jpg`,
      canonical,
      url: canonical,
      type: 'website',
      lang: this.language,
      author: 'Expiter',
      og: {
        title,
        description,
        image: `${this.baseUrl}/og-images/homepage.jpg`,
        url: canonical,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: `${this.baseUrl}/og-images/homepage.jpg`,
      },
    };
  }

  /**
   * Build default meta tags for fallback
   * @returns {Object} Default meta tags
   */
  buildDefaultMetaTags() {
    return {
      title: `Expiter - ${this.t('discover')} Italian ${this.t('quality')}`,
      description: 'Find the best Italian province for you. Compare quality of life, cost of living, safety, healthcare, and climate across all Italian regions.',
      keywords: 'Italy provinces, quality of life, cost of living, expat guides, relocation, digital nomad',
      image: `${this.baseUrl}/og-images/default.jpg`,
      canonical: this.baseUrl,
      url: this.baseUrl,
      type: 'website',
      lang: this.language,
    };
  }

  /**
   * Generate canonical URL
   * @param {string} path - Page path
   * @returns {string} Full canonical URL
   */
  buildCanonicalUrl(path) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  /**
   * Convert string to URL slug
   * @param {string} text - Text to slugify
   * @returns {string} URL-safe slug
   */
  toSlug(text) {
    if (!text) return '';

    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get alternate language links
   * @param {string} path - Current page path
   * @param {Array<string>} languages - Available languages
   * @returns {Array<Object>} Alternate links
   */
  getAlternateLinks(path, languages = ['en', 'it', 'de', 'es', 'fr']) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return languages.map(lang => ({
      hrefLang: lang,
      href: `${this.baseUrl}${lang !== 'en' ? `/${lang}` : ''}${cleanPath}`,
    }));
  }
}

export default SEOBuilder;
