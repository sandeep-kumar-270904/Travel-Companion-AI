// International electrical standards (plugs, voltage, frequency) and cultural dress codes
export const ELECTRICAL_STANDARDS_DATABASE = {
  japan: {
    country: "Japan",
    plugTypes: ["Type A", "Type B"],
    voltage: "100V",
    frequency: "50Hz (Eastern Japan/Tokyo) / 60Hz (Western Japan/Osaka)",
    adapterNeededForUS: false,
    adapterNeededForEU: true,
    adapterNeededForUK: true,
    details: "US two-prong plugs fit without an adapter, but three-prong plugs require a 3-to-2 prong ground adapter. Voltage is 100V, slightly lower than US (120V); dual-voltage electronics (phones, laptops) work flawlessly.",
    culturalDressCode: "Shoes must be removed before entering temples, ryokans, and fitting rooms. Wear easy slip-on shoes with clean socks. Revealing clothing is uncommon in urban centers; visible tattoos should be covered with sleeves or bandages at onsens/gyms."
  },
  france: {
    country: "France",
    plugTypes: ["Type C", "Type E"],
    voltage: "230V",
    frequency: "50Hz",
    adapterNeededForUS: true,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Standard European round two-pin plugs (Europlug Type C & E). US/UK appliances require a plug adapter. Verify high-wattage items (hair dryers) support 230V.",
    culturalDressCode: "Smart-casual is the norm. Beachwear, flip-flops, and athletic sweatpants outside the gym are frowned upon in restaurants and museums. Modest attire required inside Notre-Dame and basilicas."
  },
  italy: {
    country: "Italy",
    plugTypes: ["Type C", "Type F", "Type L"],
    voltage: "230V",
    frequency: "50Hz",
    adapterNeededForUS: true,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Type L (three in-line pins) is unique to Italy, though Type C Europlugs fit standard modern outlets. Adapters widely needed for US/UK plugs.",
    culturalDressCode: "Strict modesty code for all churches and Vatican City: shoulders and knees MUST be covered for both men and women (no sleeveless tops, short shorts, or miniskirts). Carry a light scarf."
  },
  thailand: {
    country: "Thailand",
    plugTypes: ["Type A", "Type B", "Type C", "Type O"],
    voltage: "220V",
    frequency: "50Hz",
    adapterNeededForUS: false,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Most modern hotels feature universal hybrid outlets that accept both US two-pin (Type A/B) and Euro round pins (Type C).",
    culturalDressCode: "Grand Palace and Buddhist Wats enforce strict dress codes: no bare shoulders, cleavage, or exposed knees. Remove shoes before stepping over temple thresholds (never step ON the raised threshold). Light linen pants are ideal."
  },
  united_kingdom: {
    country: "United Kingdom",
    plugTypes: ["Type G"],
    voltage: "230V",
    frequency: "50Hz",
    adapterNeededForUS: true,
    adapterNeededForEU: true,
    adapterNeededForUK: false,
    details: "Large rectangular three-prong plugs (Type G). Most wall sockets have their own individual on/off rocker switch.",
    culturalDressCode: "Layering is essential due to rapid maritime weather shifts. Always pack a compact windproof umbrella or water-resistant trench coat."
  },
  united_states: {
    country: "United States",
    plugTypes: ["Type A", "Type B"],
    voltage: "120V",
    frequency: "60Hz",
    adapterNeededForUS: false,
    adapterNeededForEU: true,
    adapterNeededForUK: true,
    details: "Standard North American two-flat-pin (Type A) and grounded three-pin (Type B). European and UK travelers require a plug adapter and 120V dual-voltage compatibility.",
    culturalDressCode: "Generally casual, but business-casual or upscale attire required at fine dining venues. Sturdy walking sneakers essential for major cities and national parks."
  },
  germany: {
    country: "Germany",
    plugTypes: ["Type C", "Type F"],
    voltage: "230V",
    frequency: "50Hz",
    adapterNeededForUS: true,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Standard European 'Schuko' grounded plug (Type F) and Europlug (Type C).",
    culturalDressCode: "Practical, weather-appropriate clothing. Comfortable walking shoes for cobblestones."
  },
  spain: {
    country: "Spain",
    plugTypes: ["Type C", "Type F"],
    voltage: "230V",
    frequency: "50Hz",
    adapterNeededForUS: true,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Standard European round two-pin sockets (Type C & F).",
    culturalDressCode: "Locals dress up slightly for evening paseos and dinners (which start after 9:00 PM). Swimwear is restricted strictly to beaches and pools."
  },
  india: {
    country: "India",
    plugTypes: ["Type C", "Type D", "Type M"],
    voltage: "230V",
    frequency: "50Hz",
    adapterNeededForUS: true,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Type D (three large round pins in a triangle) and Europlug Type C. Universal adapters recommended.",
    culturalDressCode: "Conservative attire: cover shoulders, chest, and knees. Remove shoes before entering temples, mosques, and private homes. Carry socks as temple marble floors can become scorching in afternoon sun."
  },
  vietnam: {
    country: "Vietnam",
    plugTypes: ["Type A", "Type C", "Type F"],
    voltage: "220V",
    frequency: "50Hz",
    adapterNeededForUS: false,
    adapterNeededForEU: false,
    adapterNeededForUK: true,
    details: "Universal hybrid outlets accepting both US flat pins and EU round pins are common in hotels.",
    culturalDressCode: "Modest attire at pagodas and temples (cover shoulders and knees). Light, breathable cotton and rain ponchos for tropical humidity."
  }
};
