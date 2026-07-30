export type FaqItem = { q: string; a: string };

export type SiteContent = {
  home: {
    hero: {
      eyebrow: string;
      headline1: string;
      headline2Italic: string;
      description: string;
      ctaPrimary: string;
      ctaSecondary: string;
      stat1Value: string;
      stat1Label: string;
      stat2Value: string;
      stat2Label: string;
      stat3Value: string;
      stat3Label: string;
    };
    features: {
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
    };
    treatmentsEyebrow: string;
    treatmentsHeading: string;
    shopEyebrow: string;
    shopHeading: string;
    promise: {
      eyebrow: string;
      heading: string;
      body: string;
      linkLabel: string;
    };
    testimonials: {
      eyebrow: string;
      heading: string;
    };
    cta: {
      heading: string;
      body: string;
      buttonLabel: string;
    };
  };
  about: {
    eyebrow: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    successTitle: string;
    successBody: string;
  };
  pageHeaders: {
    treatments: { eyebrow: string; title: string; description: string };
    shop: { eyebrow: string; title: string; description: string };
    gallery: { eyebrow: string; title: string; description: string };
    book: { eyebrow: string; title: string };
  };
  whatsappBooking: {
    heading: string;
    body: string;
    buttonLabel: string;
    noNumberMessage: string;
    chooserHeading: string;
  };
  whatsappCheckout: {
    heading: string;
    body: string;
    buttonLabel: string;
    noNumberMessage: string;
    chooserHeading: string;
  };
  footer: {
    tagline: string;
  };
};

export const DEFAULT_CONTENT: SiteContent = {
  home: {
    hero: {
      eyebrow: 'Body Contouring · Skincare',
      headline1: 'Sculpted softly.',
      headline2Italic: 'Glow loudly.',
      description:
        "Non-invasive treatments designed for melanin-rich skin. Quiet rooms, considered technique, results that look like you — rested.",
      ctaPrimary: 'Book your session ↗',
      ctaSecondary: 'See treatments',
      stat1Value: '10%',
      stat1Label: 'refundable deposit',
      stat2Value: '4.9★',
      stat2Label: 'client reviews',
      stat3Value: '6',
      stat3Label: 'signature services',
    },
    features: {
      feature1Title: 'Tech-led results',
      feature1Desc: 'Cavitation, RF & microneedling tuned to your goals.',
      feature2Title: 'Hands that listen',
      feature2Desc: 'Wood therapy and lymphatic work, never rushed.',
      feature3Title: 'Skin-first',
      feature3Desc: 'Products and protocols built for deeper skin tones.',
    },
    treatmentsEyebrow: 'The Menu',
    treatmentsHeading: 'Signature treatments',
    shopEyebrow: 'Shop',
    shopHeading: 'Take the studio home',
    promise: {
      eyebrow: 'Our Promise',
      heading: 'Results without disappearing acts.',
      body: "No needles, no downtime, no theatrics — just consistent, expert work with tools and hands that respect your skin and your time.",
      linkLabel: 'About the studio ↗',
    },
    testimonials: {
      eyebrow: 'Kind Words',
      heading: 'Said by people we love.',
    },
    cta: {
      heading: 'Your appointment is waiting.',
      body: 'Reserve with a 10% refundable deposit. Pay the balance when you arrive.',
      buttonLabel: 'Book now',
    },
  },
  about: {
    eyebrow: 'About Magic Body',
    title: 'Care that starts with listening',
    paragraph1:
      "Magic Body was founded on a simple idea: that non-invasive body contouring should feel considered, not clinical. Every treatment plan starts with a conversation about your goals, your body, and your timeline — not a one-size-fits-all package.",
    paragraph2:
      "Our studio combines advanced radiofrequency and cavitation technology with hands-on therapeutic techniques, supported by a skincare line formulated to extend your results long after you leave the treatment room.",
    paragraph3:
      "We're proud to serve a community that hasn't always seen itself reflected in this industry — and we built Magic Body to change that, one appointment at a time.",
    stat1Value: '8+',
    stat1Label: 'Years in practice',
    stat2Value: '3,200+',
    stat2Label: 'Treatments delivered',
    stat3Value: '4.9/5',
    stat3Label: 'Average client rating',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    items: [
      {
        q: 'How do I book an appointment?',
        a: 'Head to our Book Appointment page, choose a treatment, then a date and time from our published availability. A deposit secures your slot instantly.',
      },
      {
        q: 'How much deposit do I need to pay?',
        a: 'Most treatments require a 10% deposit, though this can vary by service — the exact amount is always shown before you confirm your booking.',
      },
      {
        q: 'What happens to my deposit if I need to reschedule?',
        a: "Contact us as soon as possible and we'll do our best to move your appointment to another available slot.",
      },
      {
        q: 'Are your treatments painful?',
        a: 'Our non-invasive treatments are designed to be comfortable. Most clients describe sensations as warm or tingling rather than painful.',
      },
      {
        q: 'How many sessions will I need?',
        a: "This depends on your goals and treatment plan. We'll discuss a realistic timeline during your consultation.",
      },
      {
        q: 'Do you ship products internationally?',
        a: 'Yes — we ship to a wide range of countries and display pricing in your local currency at checkout.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Get in touch',
    description: "Questions about a treatment, an order, or anything else? We usually reply within one business day.",
    successTitle: 'Thank you for reaching out',
    successBody: 'We usually reply within one business day.',
  },
  pageHeaders: {
    treatments: {
      eyebrow: 'Treatments & Pricing',
      title: 'Every treatment, clearly priced',
      description: "A transparent look at what we offer, what it costs, and what's due today to secure your appointment.",
    },
    shop: {
      eyebrow: 'The Shop',
      title: 'Extend your results at home',
      description: 'A curated collection of skincare and body care, formulated to support what happens in the studio.',
    },
    gallery: {
      eyebrow: 'Results Gallery',
      title: 'Before and after, honestly told',
      description: 'A gallery of real client results across our most requested treatments.',
    },
    book: {
      eyebrow: 'Book an Appointment',
      title: 'Reserve your session',
    },
  },
  whatsappBooking: {
    heading: 'One last step — confirm on WhatsApp',
    body: 'Your slot is held for now. Send us your receipt on WhatsApp to finalise the appointment.',
    buttonLabel: 'Complete Booking on WhatsApp',
    noNumberMessage: "Please contact the studio directly to finalise this booking — a WhatsApp number hasn't been set up yet.",
    chooserHeading: 'How would you like to finalise?',
  },
  whatsappCheckout: {
    heading: 'One last step — confirm on WhatsApp',
    body: 'Send us your receipt on WhatsApp to finalise payment and delivery for your order.',
    buttonLabel: 'Complete Order on WhatsApp',
    noNumberMessage: "Please contact the studio directly to finalise this order — a WhatsApp number hasn't been set up yet.",
    chooserHeading: 'How would you like to finalise?',
  },
  footer: {
    tagline: 'Non-invasive body contouring & skincare. Considered, calm, and inclusive by design.',
  },
};

function deepMerge<T>(base: T, override: any): T {
  if (typeof override !== 'object' || override === null || Array.isArray(override)) {
    return (override ?? base) as T;
  }
  const result: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const key of Object.keys(base as any)) {
    result[key] = deepMerge((base as any)[key], override?.[key]);
  }
  return result;
}

export function mergeContent(fetched: any): SiteContent {
  return deepMerge(DEFAULT_CONTENT, fetched ?? {});
}
