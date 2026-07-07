/**
 * FAQ content — answer-first (the first sentence answers the question), 40–60
 * words each, written to match real search/AI queries. Tags let pages pull
 * relevant subsets (home accordion, town pages, service pages).
 */

export type Faq = {
  q: string;
  a: string;
  tags: ("home" | "pricing" | "travel" | "booking" | "practical")[];
};

export const faqs: Faq[] = [
  {
    q: "How much does a car valet cost in Roscommon?",
    a: "A full valet with Jake's Car Care costs €100–€120 depending on your car's size and condition. Interior-only is €70–€90, exterior-only is €50, and optional add-ons like protector wax (+€25) or iron fallout removal (+€20) can be added at booking. Prices are agreed up front — no surprises on the day.",
    tags: ["home", "pricing"],
  },
  {
    q: "Do you come to my house to valet the car?",
    a: "Yes — Jake's Car Care is fully mobile. Jake drives to your home or workplace anywhere within a 45 km drive of Strokestown, Co. Roscommon, and valets the car right where it's parked. Call-out is free within about 15 minutes' drive; beyond that a small fee is shown up front when you book.",
    tags: ["home", "travel"],
  },
  {
    q: "Do I need to provide water or electricity?",
    a: "Yes — access to an outdoor tap and a standard socket is all that's needed. Jake brings everything else: pressure washer, vacuum, steamer, products and cloths. If you're not sure your outdoor setup will work, text 087 766 5058 before booking and Jake will talk it through.",
    tags: ["home", "practical"],
  },
  {
    q: "When can I book a valet?",
    a: "Weekends only: Saturday and Sunday, 9:00 am to 6:00 pm. The booking form on this site shows live availability — pick a slot and you'll get confirmation within 24 hours. For anything else, text Jake on 087 766 5058 and he'll see what's possible.",
    tags: ["home", "booking"],
  },
  {
    q: "What areas do you cover?",
    a: "Everywhere within a 45 km drive of Strokestown: Roscommon Town, Longford Town, Castlerea, Boyle, Carrick-on-Shannon, Ballymahon, Edgeworthstown and all the villages between. Call-out is free within 12 km or 15 minutes' drive. Athlone and further afield are possible by arrangement for bigger jobs.",
    tags: ["home", "travel"],
  },
  {
    q: "How is the call-out fee worked out?",
    a: "It's free if you're within 15 minutes' drive or 12 km of Strokestown. Beyond that it's €1 per kilometre after the first 12 km, rounded up to the nearest €5 — most of Roscommon works out at €5–€25. The booking form shows your exact fee on a map the moment you enter your Eircode.",
    tags: ["home", "pricing", "travel"],
  },
  {
    q: "How long does a car valet take?",
    a: "A full valet takes around 4 hours. Interior-only is about 3 hours and exterior-only about 2, depending on the car's size and condition. Jake works on one car at a time and doesn't rush — the booking system reserves the full slot so the job is finished properly.",
    tags: ["practical", "booking"],
  },
  {
    q: "What happens if it rains on the day?",
    a: "Your call. Light rain doesn't affect an interior valet at all, and exteriors can still be washed and protected. If the forecast is bad, Jake will give you the choice: go ahead as planned or reschedule to another slot free of charge. Just reply to your confirmation or text 087 766 5058.",
    tags: ["practical"],
  },
  {
    q: "How should I prepare the car before a valet?",
    a: "Just remove personal belongings, valuables and anything private from the cabin and boot, and park where all four doors can open fully. That's it — Jake handles everything else, including taking away the rubbish he clears out of the car.",
    tags: ["practical"],
  },
  {
    q: "How do I pay, and can I cancel?",
    a: "Payment is on the day, after you've looked over the finished car — cash or Revolut. Cancelling or rescheduling is free with reasonable notice: text or call 087 766 5058 before your slot and Jake will sort it, no cancellation fee.",
    tags: ["home", "booking", "pricing"],
  },
];

/** The six shown in the home-page accordion. */
export const homeFaqs = faqs.filter((f) => f.tags.includes("home"));
