// Before the first human map there is deep time. Two kinds of moment live here:
// `cosmic` ones have no map at all, and `paleo` ones use real plate reconstructions
// (GPlates, Merdith et al. 2021) drawn as bare land on an empty ocean.
export const DEEP_ERAS = [
  {
    year: -13_800_000_000,
    kind: 'cosmic',
    label: '13.8 billion years ago',
    scene: 'bigbang',
    caption: 'The Big Bang, when space itself begins',
    facts: [
      'Everything we can see was once packed into a space smaller than an atom.',
      'Within three minutes the first hydrogen and helium nuclei had formed.',
      'For 380,000 years the universe was too hot for light to travel freely. That first light still reaches us as a faint radio glow.',
    ],
  },
  {
    year: -4_540_000_000,
    kind: 'cosmic',
    label: '4.54 billion years ago',
    scene: 'molten',
    caption: 'Earth forms from dust around a young Sun',
    facts: [
      'Earth grew out of a disc of dust and rock circling the new Sun.',
      'The surface was a sea of magma, with no ocean and no air we could breathe.',
      'Days lasted only about six hours, because the young Earth spun much faster.',
    ],
  },
  {
    year: -4_510_000_000,
    kind: 'cosmic',
    label: '4.51 billion years ago',
    scene: 'moon',
    caption: 'A Mars-sized world strikes Earth and the Moon is born',
    facts: [
      'A protoplanet often called Theia hit the young Earth and the debris became the Moon.',
      'The Moon formed far closer than today and has been drifting away ever since, about 3.8 cm a year.',
      'That impact tilted Earth, which is why we have seasons.',
    ],
  },
  {
    year: -3_700_000_000,
    kind: 'cosmic',
    label: '3.7 billion years ago',
    scene: 'ocean',
    caption: 'Oceans cover the world and the first life appears',
    facts: [
      'The oldest widely accepted traces of life are about 3.5 billion years old.',
      'Early life was single-celled and needed no oxygen at all.',
      'The sky was probably orange, with almost no free oxygen in the air.',
    ],
  },
  {
    year: -2_400_000_000,
    kind: 'cosmic',
    label: '2.4 billion years ago',
    scene: 'oxygen',
    caption: 'Cyanobacteria fill the air with oxygen',
    facts: [
      'Photosynthesis released so much oxygen that it poisoned most life of the time.',
      'Dissolved iron rusted out of the seas and settled as the banded iron we still mine today.',
      'This Great Oxidation Event made all later animal life possible.',
    ],
  },
  {
    year: -600_000_000,
    kind: 'paleo',
    key: 'ma600',
    land: 'Pannotia',
    label: '600 million years ago',
    caption: 'Pannotia breaks apart and the first animals appear',
    facts: [
      'The strange soft-bodied Ediacaran creatures were the first complex animals.',
      'Earth had recently thawed from a deep freeze some call Snowball Earth.',
      'All life still lived in the sea. The land was bare rock.',
    ],
  },
  {
    year: -500_000_000,
    kind: 'paleo',
    key: 'ma500',
    land: 'Gondwana',
    label: '500 million years ago',
    caption: 'The Cambrian explosion fills the seas',
    facts: [
      'Almost every major animal body plan alive today appeared in this burst of evolution.',
      'Trilobites were among the most successful animals on Earth.',
      'The giant southern continent Gondwana held today’s Africa, South America, India, Antarctica and Australia.',
    ],
  },
  {
    year: -400_000_000,
    kind: 'paleo',
    key: 'ma400',
    land: 'Laurussia',
    label: '400 million years ago',
    caption: 'Plants and animals move onto land',
    facts: [
      'The first forests were spreading, and they pulled huge amounts of carbon out of the air.',
      'Fish with sturdy fins were beginning to crawl into shallow water.',
      'Insects appeared, long before any animal with a backbone walked on land.',
    ],
  },
  {
    year: -300_000_000,
    kind: 'paleo',
    key: 'ma300',
    land: 'Pangaea',
    label: '300 million years ago',
    caption: 'All land joins into one supercontinent, Pangaea',
    facts: [
      'You could have walked from what is now South Africa to what is now Canada.',
      'Swampy coal forests of this age became most of the coal we burn today.',
      'Oxygen levels were so high that dragonflies grew wings the width of a seagull’s.',
    ],
  },
  {
    year: -200_000_000,
    kind: 'paleo',
    key: 'ma200',
    land: 'Pangaea',
    label: '200 million years ago',
    caption: 'Pangaea begins to split and dinosaurs spread',
    facts: [
      'Rifts tore Pangaea apart and the Atlantic Ocean started to open.',
      'Dinosaurs were becoming the dominant land animals.',
      'The first small mammals were alive, mostly no bigger than a mouse.',
    ],
  },
  {
    year: -100_000_000,
    kind: 'paleo',
    key: 'ma100',
    land: 'Gondwana',
    label: '100 million years ago',
    caption: 'A warm, high-sea world of flowering plants',
    facts: [
      'There was no ice at either pole and shallow seas flooded the continents.',
      'Flowering plants were spreading fast, and insects spread with them.',
      'India had broken away and was drifting north as an island continent.',
    ],
  },
  {
    year: -66_000_000,
    kind: 'paleo',
    key: 'ma66',
    land: 'Laurasia',
    label: '66 million years ago',
    caption: 'An asteroid ends the age of dinosaurs',
    facts: [
      'A roughly 10 km asteroid struck what is now the Yucatán in Mexico.',
      'About three quarters of all species died out, including every large dinosaur.',
      'Birds are the one dinosaur lineage that survived, and they are still with us.',
    ],
  },
  {
    year: -35_000_000,
    kind: 'paleo',
    key: 'ma35',
    land: 'Laurasia',
    label: '35 million years ago',
    caption: 'India crashes into Asia and the Himalayas rise',
    facts: [
      'India had crossed an entire ocean before colliding with Asia.',
      'That collision is still going on, and Everest grows by a few millimetres a year.',
      'Antarctica froze over as the oceans around it began to circulate.',
    ],
  },
  {
    year: -5_000_000,
    kind: 'paleo',
    key: 'ma5',
    land: 'Earth',
    label: '5 million years ago',
    caption: 'A familiar world, and the first upright apes',
    facts: [
      'The continents had almost reached the positions we know today.',
      'Early hominins in Africa were already walking upright.',
      'The Isthmus of Panama was closing, joining North and South America.',
    ],
  },
];

export const ERAS = [
  ...DEEP_ERAS,
  { year: -123000, caption: 'The last interglacial, as humans spread across Africa', facts: [
    'The Eemian interglacial was warmer than today. Hippos wallowed where London’s Trafalgar Square now stands.',
    'Neanderthals ruled Ice Age Europe while Denisovans roamed Asia.',
    'Every human alive today descends from small bands of Homo sapiens living in Africa.',
  ] },
  { year: -10000, caption: 'End of the Ice Age', facts: [
    'Britain was still joined to Europe by Doggerland, a lowland now under the North Sea.',
    'Göbekli Tepe in Anatolia, possibly the world’s oldest monumental site, was being raised by hunter-gatherers.',
    'The entire human population is estimated at just a few million people.',
  ] },
  { year: -8000, caption: 'The first farmers of the Fertile Crescent', facts: [
    'Wheat, barley, peas and lentils were among humanity’s very first crops.',
    'Jericho already had a stone wall and an 8-metre tower, one of the oldest known.',
    'The Sahara was green, dotted with lakes and home to giraffes and hippos.',
  ] },
  { year: -5000, caption: 'Neolithic villages across Eurasia', facts: [
    'Farmers in the Yangtze valley were growing rice in flooded paddies.',
    'The first copper was being smelted in the Balkans and Iran.',
    'Britain had only recently become an island as rising seas drowned Doggerland.',
  ] },
  { year: -4000, caption: 'Copper, the wheel, and the first cities', facts: [
    'Uruk in Mesopotamia was growing into what many consider the world’s first true city.',
    'Within a few centuries the wheel would appear in Mesopotamia and the Caucasus.',
    'Megalithic tombs were being raised all along Europe’s Atlantic coast.',
  ] },
  { year: -3000, caption: 'Egypt unified; Sumerian city-states rise', facts: [
    'Writing had just been invented: cuneiform in Sumer and hieroglyphs in Egypt.',
    'The first phase of Stonehenge, a circular ditch and bank, was dug around this time.',
    'Tradition credits King Narmer with uniting Upper and Lower Egypt.',
  ] },
  { year: -2000, caption: 'Middle Kingdom Egypt and the Indus Valley', facts: [
    'The Great Pyramid of Giza was already some 500 years old.',
    'The last woolly mammoths were still alive on Wrangel Island in the Arctic.',
    'Indus cities like Mohenjo-daro had grid streets and covered drains.',
  ] },
  { year: -1500, caption: 'New Kingdom Egypt, Hittites, and Shang China', facts: [
    'Hatshepsut would soon rule Egypt as one of its few female pharaohs.',
    'Shang kings would carve questions to their ancestors on oracle bones, China’s earliest writing.',
    'The volcano of Thera had recently buried the Minoan town of Akrotiri in ash.',
  ] },
  { year: -1000, caption: 'Zhou dynasty; the Iron Age begins', facts: [
    'Iron tools and weapons were spreading across the Near East.',
    'Lapita seafarers, ancestors of the Polynesians, were reaching Fiji, Tonga and Samoa.',
    'The Zhou claimed the “Mandate of Heaven”, an idea that shaped Chinese rule for 3,000 years.',
  ] },
  { year: -700, caption: 'The height of Assyria', facts: [
    'Rome’s traditional founding date is 753 BC.',
    'The first recorded Olympic Games were held in 776 BC.',
    'Ashurbanipal would soon gather a vast library of clay tablets at Nineveh.',
  ] },
  { year: -500, caption: 'Achaemenid Persia rules from the Indus to the Aegean', facts: [
    'Persian royal messengers relayed news along the 2,700 km Royal Road in about a week.',
    'Athens had just adopted democracy, in 508 BC.',
    'Confucius was teaching in China while the Buddha’s ideas took root in India.',
  ] },
  { year: -400, caption: 'Classical Greece and the Warring States', facts: [
    'Socrates was tried and executed in Athens in 399 BC.',
    'The Nok culture of Nigeria was producing remarkable terracotta sculptures.',
    'Chinese Warring States armies were fielding crossbows and cast-iron tools.',
  ] },
  { year: -323, caption: 'Death of Alexander the Great', facts: [
    'Alexander died in Babylon aged 32, having never lost a battle.',
    'He founded many cities named Alexandria. The Egyptian one became the greatest.',
    'Chandragupta Maurya was about to forge India’s first great empire.',
  ] },
  { year: -300, caption: 'The Hellenistic kingdoms and the Mauryas', facts: [
    'Euclid wrote his Elements in Alexandria, used as a textbook for over 2,000 years.',
    'The Library of Alexandria was being founded under the Ptolemies.',
    'The Lighthouse of Alexandria would soon rise over 100 metres.',
  ] },
  { year: -200, caption: 'Rome against Carthage; the Han unify China', facts: [
    'Hannibal had crossed the Alps with war elephants in 218 BC.',
    'Qin Shi Huang unified China in 221 BC and was buried with the Terracotta Army.',
    'Eratosthenes measured the Earth’s circumference with remarkable accuracy.',
  ] },
  { year: -100, caption: 'The Roman Republic expands', facts: [
    'Julius Caesar was born in 100 BC.',
    'Han envoys had opened the routes later called the Silk Road.',
    'The Antikythera mechanism, an ancient analogue computer, dates from around this time.',
  ] },
  { year: -1, caption: 'Augustus rules Rome; the Han rule China', facts: [
    'There is no year zero: 1 BC is followed directly by AD 1.',
    'The world’s population was roughly 200–300 million.',
    'Rome and Han China together ruled a huge share of humanity, yet barely knew of each other.',
  ] },
  { year: 100, caption: 'The Roman Empire near its peak', facts: [
    'Under Trajan, Rome would reach its greatest extent in AD 117.',
    'Cai Lun is credited with inventing paper in China around AD 105.',
    'Teotihuacan’s Pyramid of the Sun was among the largest structures in the Americas.',
  ] },
  { year: 200, caption: 'Rome, Parthia, Kushan, and Han', facts: [
    'In 212, Caracalla granted Roman citizenship to all free men of the empire.',
    'The Han dynasty fell in 220, splitting China into the Three Kingdoms.',
    'Aksum in Ethiopia was becoming one of the great trading powers of the world.',
  ] },
  { year: 300, caption: 'The Tetrarchy and the Sasanian Empire', facts: [
    'Diocletian split rule of Rome between four emperors, called the Tetrarchy.',
    'Constantine legalised Christianity in 313.',
    'Classic Maya cities like Tikal were flourishing in the jungles of Central America.',
  ] },
  { year: 400, caption: 'The Gupta golden age', facts: [
    'The Visigoths sacked Rome in 410, the first time in 800 years.',
    'Indian mathematicians were developing place-value numerals, the ancestors of our digits.',
    'Polynesian voyagers were pushing east towards Hawaiʻi and Rapa Nui.',
  ] },
  { year: 500, caption: 'The fall of the West; Byzantium endures', facts: [
    'The Western Roman Empire fell in 476; the East lived on as Byzantium for another millennium.',
    'Aryabhata calculated π as 3.1416 in 499.',
    'Justinian would soon build the Hagia Sophia, completed in 537.',
  ] },
  { year: 600, caption: 'The Sui reunify China', facts: [
    'The Sui completed the Grand Canal, linking northern and southern China.',
    'Muhammad began preaching in Mecca around 610.',
    'The Sutton Hoo ship burial in England dates from about 625.',
  ] },
  { year: 700, caption: 'The Umayyad Caliphate and Tang China', facts: [
    'The Umayyad Caliphate would soon stretch from Spain to Central Asia.',
    'Chang’an, the Tang capital, may have had a million residents.',
    'Tang China was the likely birthplace of woodblock printing.',
  ] },
  { year: 800, caption: 'Charlemagne crowned emperor', facts: [
    'Charlemagne was crowned Emperor of the Romans on Christmas Day, 800.',
    'Baghdad’s House of Wisdom was translating Greek science into Arabic.',
    'Borobudur, the world’s largest Buddhist temple, was being built in Java.',
  ] },
  { year: 900, caption: 'Vikings, the Abbasids, and the end of the Tang', facts: [
    'The Diamond Sutra of 868 is the world’s oldest dated printed book.',
    'Vikings were settling Iceland, which founded its Althing parliament in 930.',
    'Many great Maya cities of the southern lowlands had been abandoned.',
  ] },
  { year: 1000, caption: 'The Song dynasty and the Holy Roman Empire', facts: [
    'Leif Erikson reached North America around 1000, nearly 500 years before Columbus.',
    'Murasaki Shikibu was writing The Tale of Genji, often called the first novel.',
    'Song China would soon record the first known formulas for gunpowder.',
  ] },
  { year: 1100, caption: 'The age of the Crusades', facts: [
    'Crusaders captured Jerusalem in 1099.',
    'Angkor Wat, the world’s largest religious monument, was built in the early 1100s.',
    'The University of Bologna, founded 1088, is the oldest still operating.',
  ] },
  { year: 1200, caption: 'On the eve of the Mongol storm', facts: [
    'Temüjin would be proclaimed Genghis Khan in 1206.',
    'Cahokia, near modern St. Louis, had recently been North America’s largest city.',
    'Notre-Dame de Paris was under construction.',
  ] },
  { year: 1279, caption: 'The Mongol Empire at its greatest extent', facts: [
    'The Mongol Empire was the largest contiguous land empire in history.',
    'Kublai Khan completed his conquest of Song China in 1279.',
    'Marco Polo was serving at Kublai Khan’s court.',
  ] },
  { year: 1300, caption: 'The Mongol khanates divide Eurasia', facts: [
    'The Ottoman state was founded in Anatolia around 1299.',
    'Mansa Musa of Mali, perhaps the richest person in history, made his famous hajj in 1324.',
    'Dante was writing the Divine Comedy.',
  ] },
  { year: 1400, caption: 'Ming China and the Timurids', facts: [
    'Zheng He’s treasure fleets would sail as far as East Africa between 1405 and 1433.',
    'Europe was recovering from the Black Death, which killed perhaps a third of its people.',
    'Timur had sacked Delhi in 1398 and would sack Baghdad in 1401.',
  ] },
  { year: 1492, caption: 'Columbus reaches the Americas', facts: [
    'Granada fell in January 1492, ending Muslim rule in Iberia.',
    'The oldest surviving globe, the Erdapfel, was made this year, without the Americas.',
    'Tenochtitlan was one of the largest cities on Earth.',
  ] },
  { year: 1500, caption: 'The Inca, the Aztecs, and the Ottomans', facts: [
    'The Inca road network stretched roughly 40,000 km through the Andes.',
    'Pedro Álvares Cabral reached Brazil in 1500.',
    'Leonardo da Vinci would soon begin the Mona Lisa.',
  ] },
  { year: 1530, caption: 'Charles V and Suleiman the Magnificent', facts: [
    'Magellan’s expedition completed the first circumnavigation of the globe in 1522.',
    'Babur founded the Mughal Empire after the Battle of Panipat in 1526.',
    'The Ottomans besieged Vienna in 1529.',
  ] },
  { year: 1600, caption: 'The Mughals, the Ottomans, and the Spanish Empire', facts: [
    'The English East India Company was chartered on 31 December 1600.',
    'Tokugawa Ieyasu won the Battle of Sekigahara in 1600, beginning 250 years of shogunate rule.',
    'Shakespeare was writing Hamlet.',
  ] },
  { year: 1650, caption: 'The Peace of Westphalia; the Qing take China', facts: [
    'The Peace of Westphalia (1648) laid foundations for the modern system of sovereign states.',
    'The Taj Mahal complex was completed around 1653.',
    'The Qing had captured Beijing in 1644, founding China’s last imperial dynasty.',
  ] },
  { year: 1700, caption: 'The age of absolutism', facts: [
    'Peter the Great would found St Petersburg in 1703.',
    'The Mughal Empire under Aurangzeb reached its greatest extent.',
    'Louis XIV’s Versailles was the envy of every court in Europe.',
  ] },
  { year: 1715, caption: 'After the War of the Spanish Succession', facts: [
    'Louis XIV died in 1715 after 72 years on the throne, the longest reign of any major European monarch.',
    'The Treaty of Utrecht (1713) handed Gibraltar to Britain.',
    'The Kangxi Emperor presided over a golden age in Qing China.',
  ] },
  { year: 1783, caption: 'The United States wins independence', facts: [
    'The Treaty of Paris recognised American independence in 1783.',
    'The Montgolfier brothers flew the first crewed hot-air balloon that same year.',
    'The First Fleet would reach Australia in 1788.',
  ] },
  { year: 1800, caption: 'The Napoleonic era begins', facts: [
    'Napoleon had just seized power as First Consul of France.',
    'Alessandro Volta invented the electric battery in 1800.',
    'World population was nearing one billion.',
  ] },
  { year: 1815, caption: 'The Congress of Vienna', facts: [
    'Napoleon met his final defeat at Waterloo in June 1815.',
    'Mount Tambora’s eruption brought “the Year Without a Summer” in 1816.',
    'Wars of independence were sweeping Spanish America.',
  ] },
  { year: 1878, caption: 'The Congress of Berlin', facts: [
    'The Congress of Berlin recognised Serbia, Montenegro and Romania as independent.',
    'Edison had unveiled the phonograph in 1877.',
    'Meiji Japan was industrialising at breathtaking speed.',
  ] },
  { year: 1880, caption: 'On the eve of the Scramble for Africa', facts: [
    'Around 1880 only about a tenth of Africa was under European rule; by 1914 almost all of it was.',
    'Edison patented his electric lamp in 1880.',
    'The Berlin Conference of 1884–85 would soon carve up Africa.',
  ] },
  { year: 1900, caption: 'Empires at their zenith', facts: [
    'The British Empire covered around a fifth of the world’s land.',
    'The Boxer Rebellion besieged Beijing’s foreign legations in 1900.',
    'The Wright brothers would fly just three years later.',
  ] },
  { year: 1914, caption: 'The outbreak of the Great War', facts: [
    'The assassination of Archduke Franz Ferdinand in Sarajevo triggered World War I.',
    'The Panama Canal opened in August 1914.',
    'Only Ethiopia and Liberia remained fully independent in Africa.',
  ] },
  { year: 1920, caption: 'A world redrawn at Versailles', facts: [
    'The German, Austro-Hungarian, Russian and Ottoman empires had collapsed or were collapsing.',
    'The League of Nations was founded in 1920.',
    'The 1918 influenza pandemic had killed tens of millions.',
  ] },
  { year: 1930, caption: 'Between the wars', facts: [
    'The Great Depression followed the 1929 Wall Street crash.',
    'Gandhi’s Salt March of 1930 challenged British rule in India.',
    'Pluto was discovered in 1930.',
  ] },
  { year: 1938, caption: 'On the brink of the Second World War', facts: [
    'Germany annexed Austria in March 1938.',
    'The Munich Agreement handed the Sudetenland to Germany.',
    'Nuclear fission was discovered in December 1938.',
  ] },
  { year: 1945, caption: 'The end of the Second World War', facts: [
    'World War II killed an estimated 70–85 million people.',
    'The United Nations was founded in October 1945 with 51 members.',
    'Atomic bombs destroyed Hiroshima and Nagasaki in August.',
  ] },
  { year: 1960, caption: 'Decolonization sweeps Africa and Asia', facts: [
    'Seventeen African countries became independent in 1960, “the Year of Africa”.',
    'Yuri Gagarin would become the first human in space the following year.',
    'World population was about 3 billion.',
  ] },
  { year: 1994, caption: 'After the Cold War', facts: [
    'The Soviet Union had dissolved in 1991 into 15 independent countries.',
    'South Africa held its first all-race elections in 1994.',
    'The European Union formally came into being in 1993.',
  ] },
  { year: 2000, caption: 'The new millennium', facts: [
    'World population passed 6 billion in 1999.',
    'The International Space Station received its first crew in November 2000.',
    'East Timor would become independent in 2002.',
  ] },
  { year: 2010, caption: 'The world of 2010', facts: [
    'South Sudan would become the world’s newest country in 2011.',
    'The Burj Khalifa, at 828 m, opened in 2010.',
    'Roughly 30% of humanity was online.',
  ] },
  { year: 2024, label: 'Today', source: 'naturalearth', caption: 'The world today, with detailed modern borders', facts: [
    'There are 193 member states of the United Nations.',
    'World population passed 8 billion in November 2022.',
    'Russia is the largest country on Earth, at over 17 million km².',
  ] },
];

export const AGES = [
  { name: 'Deep Time', from: -Infinity, to: -1000000 },
  { name: 'Prehistory', from: -999999, to: -3001 },
  { name: 'Ancient', from: -3000, to: 499 },
  { name: 'Medieval', from: 500, to: 1491 },
  { name: 'Early Modern', from: 1492, to: 1799 },
  { name: 'Modern', from: 1800, to: Infinity },
];

export const ageOf = (year) => AGES.find((a) => year >= a.from && year <= a.to);

export const formatYear = (year) => {
  const era = ERAS.find((e) => e.year === year);
  if (era?.label) return era.label;
  return year < 0 ? `${Math.abs(year).toLocaleString('en-US')} BC` : `AD ${year}`;
};

// Short form for the timeline ruler, where "13.8 billion years ago" will not fit.
export const shortYear = (year) => {
  const era = ERAS.find((e) => e.year === year);
  if (era?.kind) {
    const ago = Math.abs(year);
    return ago >= 1e9 ? `${+(ago / 1e9).toFixed(2)} Ga` : `${Math.round(ago / 1e6)} Ma`;
  }
  if (era?.label) return era.label;
  return year === -1 ? 'AD 1' : year < 0 ? `${Math.abs(year).toLocaleString('en-US')} BC` : String(year);
};

export const eraKey = (year) => {
  const era = ERAS.find((e) => e.year === year);
  if (era?.key) return era.key;
  return year === 2024 ? 'today' : year < 0 ? `bc${Math.abs(year)}` : String(year);
};

export const dataUrl = (year) => `/data/world_${eraKey(year)}.topo.json`;
