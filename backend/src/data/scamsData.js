export const CITY_SCAMS_DATABASE = {
  rome: [
    {
      title: "The Friendship Bracelet / String Trap",
      hotspot: "Colosseum, Spanish Steps, Piazza Navona",
      severity: "High Frequency",
      howItWorks: "Friendly individuals approach complimenting your shoes or origin and swiftly tie a braided string/bracelet around your wrist. Once tied, they aggressively demand €20 to €50 as a 'gift' and will cause a scene if you decline.",
      avoidance: "Keep hands in pockets or maintain a firm 'No, grazie' without stopping or making eye contact. Never allow anyone to place items on your body."
    },
    {
      title: "Centurion Gladiator Photo Extortion",
      hotspot: "Surrounding the Colosseum perimeter",
      severity: "High Cost",
      howItWorks: "Men dressed as Roman gladiators offer to pose for a quick photo using your phone. Afterward, they corner you and demand €30 to €100 per person for the photograph.",
      avoidance: "Costumed gladiators are technically prohibited by municipal law. Decline all photo invitations or agree on zero payment beforehand in writing."
    },
    {
      title: "Airport Taxi Fixed-Rate Fraud",
      hotspot: "Fiumicino (FCO) & Ciampino (CIA) Terminals",
      severity: "Medium Cost",
      howItWorks: "Official city ordinance sets a flat rate of €50 from FCO to central Rome. Unscrupulous drivers will turn on the meter, claim luggage fees, or take indirect ring roads to charge €90+.",
      avoidance: "Only board official white licensed city taxis at the marked rank. Confirm: 'Tariffa fissa cinquanta euro, giusto?' before getting in."
    }
  ],
  paris: [
    {
      title: "The Deaf Petition / Clipboard Distraction",
      hotspot: "Eiffel Tower, Louvre Courtyard, Notre-Dame",
      severity: "High Frequency",
      howItWorks: "Young people holding clipboards approach asking you to sign an English petition for a deaf or children's charity. While you are reading or signing, an accomplice pickpockets your phone or wallet from your bag.",
      avoidance: "Never stop for clipboard holders in tourist hubs. Say a firm 'Non, merci' and continue walking."
    },
    {
      title: "The 'Found' Gold Ring Trick",
      hotspot: "Seine River Walkways, Tuileries Garden",
      severity: "Moderate",
      howItWorks: "A stranger bends down and pretends to pick up a shiny 'gold' ring off the ground, asking if you dropped it. When you say no, they insist you keep it for good luck, then demand cash for finding it.",
      avoidance: "Keep walking. The ring is cheap brass worth 50 cents."
    },
    {
      title: "Sacré-Cœur Funicular String Weavers",
      hotspot: "Steps leading up to Sacré-Cœur (Montmartre)",
      severity: "High Frequency",
      howItWorks: "Groups of men block the staircase steps and grab tourists' fingers to weave yarn friendship bracelets, physically preventing you from walking past until you pay cash.",
      avoidance: "Take the Funicular tram using your standard metro ticket, or walk up the alternate side streets (Rue Foyatier) to bypass the main stairs entirely."
    }
  ],
  bangkok: [
    {
      title: "The 'Grand Palace is Closed' Tuk-Tuk Scam",
      hotspot: "Near Grand Palace, Wat Pho, Sanam Luang",
      severity: "Very Common",
      howItWorks: "A well-dressed local or tuk-tuk driver claims the Grand Palace or temple is 'closed today for a royal ceremony/Buddhist holiday'. They offer to take you on a 40-Baht tour of 'special open temples' and instead divert you to scam gem stores and tailors where high-pressure sales occur.",
      avoidance: "The Grand Palace is rarely closed. Always walk directly to the official gate and ticket booth yourself to verify hours."
    },
    {
      title: "Jet Ski Damage Claim",
      hotspot: "Pattaya & Phuket Beachfronts",
      severity: "High Cost / Intimidation",
      howItWorks: "When you return a rented jet ski, the operator points out existing scratches underneath the hull (which were painted over with water-soluble paint) and aggressively demands $500 - $1,500 for repairs, threatening police.",
      avoidance: "Take high-definition timestamped photos/video of every square inch of the watercraft with the rental agent watching before signing anything."
    }
  ],
  tokyo: [
    {
      title: "Roppongi & Kabukicho Touting Overcharge",
      hotspot: "Shinjuku Kabukicho, Roppongi Nightlife Alleys",
      severity: "High Danger / Financial",
      howItWorks: "Friendly English-speaking street promoters promise 'all-you-can-drink for 3,000 yen' or attractive hostesses. Once inside, drinks are spiked or inflated bills of 150,000 to 500,000 yen ($1,000+) are demanded, accompanied by intimidating bouncers.",
      avoidance: "Tokyo municipal law prohibits street touting (kyakuhiki). Never follow anyone who approaches you on the street into any bar or basement lounge."
    },
    {
      title: "Fake Monks Soliciting Amulets",
      hotspot: "Senso-ji Temple (Asakusa), Ueno Park",
      severity: "Moderate",
      howItWorks: "People in Buddhist monk robes hand you a golden medallion or peace card. Once taken, they pull out a guestbook demanding cash donations of 5,000+ yen for temple construction.",
      avoidance: "Legitimate Japanese Buddhist monks do not wander tourist streets aggressively thrusting amulets. Firmly refuse and keep moving."
    }
  ],
  barcelona: [
    {
      title: "Las Ramblas Shell Game (Trilero)",
      hotspot: "Las Ramblas, Plaça de Catalunya",
      severity: "Organized Crime",
      howItWorks: "Performers shuffle three shells or cups over a ball with a crowd of apparent spectators enthusiastically winning €50 notes. The 'winners' are paid shills. If you bet, you will lose, and the surrounding crowd contains pickpockets looking into unzipped bags.",
      avoidance: "Never stop to watch street games. They are 100% organized pickpocket rings."
    },
    {
      title: "The Spilled Bird Poop / Mustard Distraction",
      hotspot: "Metro stations and Park Güell walkways",
      severity: "High Frequency",
      howItWorks: "An accomplice sprays a white substance on your shoulder resembling bird droppings. A friendly stranger appears with tissues to help clean you up while picking your pockets.",
      avoidance: "If something spills on you, do not let strangers touch you or your bags. Move to a safe indoor shop before inspecting."
    }
  ],
  new_york: [
    {
      title: "Times Square CD Handout Hustle",
      hotspot: "Times Square, Broadway",
      severity: "Common",
      howItWorks: "Aspiring rappers hand you their music CD saying 'It's free! Support independent artists'. As soon as you hold it, they ask for your name, write on it with a Sharpie, and demand $20, surrounding you if you try giving it back.",
      avoidance: "Keep your hands down. If someone tries placing a CD in your hand, let it fall or walk right past."
    }
  ]
};

export const EMERGENCY_NUMBERS_DATABASE = {
  japan: {
    country: "Japan",
    police: "110",
    ambulance: "119",
    fire: "119",
    touristHelpline: "#9110 (Police Consultation in English)",
    embassies: [
      { name: "US Embassy Tokyo", phone: "+81 3-3224-5000" },
      { name: "UK Embassy Tokyo", phone: "+81 3-5211-1100" },
      { name: "Indian Embassy Tokyo", phone: "+81 3-3262-2391" }
    ]
  },
  france: {
    country: "France",
    police: "17",
    ambulance: "15 (SAMU)",
    fire: "18",
    touristHelpline: "112 (European Universal Emergency)",
    embassies: [
      { name: "US Embassy Paris", phone: "+33 1 43 12 22 22" },
      { name: "UK Embassy Paris", phone: "+33 1 44 51 31 00" },
      { name: "Indian Embassy Paris", phone: "+33 1 40 50 70 70" }
    ]
  },
  italy: {
    country: "Italy",
    police: "112 (Carabinieri) / 113",
    ambulance: "118",
    fire: "115",
    touristHelpline: "112 (Universal Emergency)",
    embassies: [
      { name: "US Embassy Rome", phone: "+39 06 46741" },
      { name: "UK Embassy Rome", phone: "+39 06 4220 0001" },
      { name: "Indian Embassy Rome", phone: "+39 06 4884 642" }
    ]
  },
  thailand: {
    country: "Thailand",
    police: "191",
    ambulance: "1669",
    fire: "199",
    touristHelpline: "1155 (Tourist Police - 24/7 English)",
    embassies: [
      { name: "US Embassy Bangkok", phone: "+66 2 205 4000" },
      { name: "UK Embassy Bangkok", phone: "+66 2 305 8333" },
      { name: "Indian Embassy Bangkok", phone: "+66 2 258 0300" }
    ]
  },
  spain: {
    country: "Spain",
    police: "091 (National) / 092 (Local)",
    ambulance: "061",
    fire: "080",
    touristHelpline: "112 (Universal Emergency)",
    embassies: [
      { name: "US Embassy Madrid", phone: "+34 91 587 2200" },
      { name: "UK Embassy Madrid", phone: "+34 91 714 6300" },
      { name: "Indian Embassy Madrid", phone: "+34 91 309 8870" }
    ]
  },
  united_states: {
    country: "United States",
    police: "911",
    ambulance: "911",
    fire: "911",
    touristHelpline: "311 (Non-emergency municipal assistance)",
    embassies: [
      { name: "Indian Embassy Washington DC", phone: "+1 202-939-7000" },
      { name: "UK Embassy Washington DC", phone: "+1 202-588-6500" }
    ]
  },
  india: {
    country: "India",
    police: "112 / 100",
    ambulance: "102 / 108",
    fire: "101",
    touristHelpline: "1363 (Toll Free 24/7 Tourist Helpline)",
    embassies: [
      { name: "US Embassy New Delhi", phone: "+91 11-2419-8000" },
      { name: "UK High Commission New Delhi", phone: "+91 11-2419-2100" }
    ]
  }
};
