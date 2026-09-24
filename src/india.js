// "India through time": a guided story. Each chapter points at an era and at the realm name
// the border dataset uses for that era, so the globe can jump straight to it.
export const INDIA_VIEW = { lat: 22.5, lng: 80, altitude: 1.25 };

// Rough box around the subcontinent, used to list the realms on the map in each chapter.
export const inIndiaRegion = (r) => r.lng >= 66 && r.lng <= 97.5 && r.lat >= 6 && r.lat <= 36.5;

export const INDIA_CHAPTERS = [
  {
    year: -2000,
    realm: 'Indus valley civilization',
    title: 'The first cities',
    span: 'c. 3300 to 1300 BC',
    story:
      'Long before kings and empires, people along the Indus and Ghaggar rivers built planned cities like Harappa, Mohenjo-daro and Dholavira. Streets ran in neat grids, homes had bathrooms, and covered drains carried waste water away. Their seals carry a script that nobody has managed to read yet.',
    remember: [
      'One of the three earliest city civilisations, alongside Egypt and Mesopotamia',
      'The same brick sizes and weights were used across hundreds of kilometres',
      'Traded with Mesopotamia, where the region was probably called Meluhha',
    ],
    ask: [
      'Why did these cities slowly empty out after about 1900 BC?',
      'What might the Indus script say, and why is it so hard to decode?',
      'How did people run such tidy cities without any known palaces or kings?',
    ],
  },
  {
    year: -1000,
    realm: 'Vedic Aryans',
    title: 'The Vedic age',
    span: 'c. 1500 to 500 BC',
    story:
      'The Rigveda, one of the oldest texts still recited anywhere, was composed in the northwest and passed down by memory for centuries before anyone wrote it down. Over time people moved east into the Ganga plains, cleared forests, and settled into larger villages and the first small kingdoms.',
    remember: [
      'The Vedas were memorised word for word, with clever methods to avoid mistakes',
      'Sanskrit from this period is the root of many Indian languages',
      'Iron tools later helped clear the Ganga plains for farming',
    ],
    ask: [
      'How could a text survive for a thousand years without being written?',
      'How did society change as people moved east into the Ganga plains?',
      'Which everyday words in your own language come from Sanskrit?',
    ],
  },
  {
    year: -500,
    realm: 'Magadha',
    title: 'Sixteen great kingdoms',
    span: 'c. 600 to 320 BC',
    story:
      'North India was split into sixteen powerful states called the Mahajanapadas. Some had kings, others were run by councils, making them early republics. This is when the Buddha and Mahavira taught, questioning old rituals and offering new ways to live. Slowly, Magadha in today’s Bihar swallowed its rivals.',
    remember: [
      'Gautama Buddha and Mahavira lived around the same time',
      'The Vajji league was governed by assemblies, not a single king',
      'Punch-marked silver coins came into use',
    ],
    ask: [
      'Why did Magadha, and not another kingdom, end up on top?',
      'What did the Buddha and Mahavira disagree with in older traditions?',
      'How did a republic work 2,500 years ago?',
    ],
  },
  {
    year: -200,
    realm: 'Mauryan Empire',
    title: 'The Mauryas and Ashoka',
    span: '322 to 185 BC',
    story:
      'Chandragupta Maurya, guided by his adviser Chanakya, built the first empire to cover most of the subcontinent. His grandson Ashoka conquered Kalinga, was horrified by the bloodshed, and turned to Buddhism. He carved messages about kindness and fair rule on rocks and pillars across the land.',
    remember: [
      'The Lion Capital of Ashoka at Sarnath is India’s national emblem',
      'The chakra on India’s flag comes from Ashoka’s pillars',
      'The Greek envoy Megasthenes described the capital Pataliputra, today’s Patna',
    ],
    ask: [
      'What makes a ruler change after winning a war?',
      'How did one government control such a huge area without modern transport?',
      'What did Ashoka’s edicts actually say?',
    ],
  },
  {
    year: 100,
    realm: 'Satavahanihara',
    title: 'Traders, Kushans and Satavahanas',
    span: 'c. 100 BC to AD 250',
    story:
      'After the Mauryas, power split up. The Kushans ruled the northwest and linked India to the Silk Road, while the Satavahanas ruled the Deccan. Ships sailed between Indian ports and the Roman Empire, carrying pepper, cotton and gems in exchange for gold. Roman coins still turn up in South India today.',
    remember: [
      'Monsoon winds let ships cross the Arabian Sea in a few weeks',
      'Gandhara art mixed Greek and Indian styles in early statues of the Buddha',
      'Tamil Sangam poetry describes this busy world of ports and trade',
    ],
    ask: [
      'What did Rome buy from India, and why did it worry some Romans?',
      'How did the monsoon shape trade and daily life?',
      'How did Buddhism travel from India to China?',
    ],
  },
  {
    year: 400,
    realm: 'Gupta Empire',
    title: 'The Gupta golden age',
    span: 'c. AD 320 to 550',
    story:
      'Under the Guptas, north India saw a burst of science, art and writing. Kalidasa wrote plays and poems still performed today. Aryabhata argued that the Earth spins on its axis, and Indian mathematicians shaped the place-value system with zero that the whole world now uses.',
    remember: [
      'Decimal numbers with zero travelled from India through the Arab world to Europe',
      'The iron pillar in Delhi’s Qutb complex, from this era, has barely rusted in 1,600 years',
      'Nalanda began to grow into a great centre of learning',
    ],
    ask: [
      'Why do some periods produce so much science and art at once?',
      'How did zero travel from India to the rest of the world?',
      'Why is it called a golden age, and golden for whom?',
    ],
  },
  {
    year: 600,
    realm: 'Kanauj',
    title: 'Harsha and the temple builders',
    span: 'c. AD 600 to 750',
    story:
      'Harsha ruled much of north India from Kannauj, while the Chalukyas and Pallavas competed in the south. The Chinese monk Xuanzang travelled across India, studied at Nalanda and wrote down what he saw. In the south, kings began building temples in stone, like those at Mahabalipuram.',
    remember: [
      'Xuanzang spent over a decade in India and carried hundreds of texts back to China',
      'The Chalukya king Pulakeshin II stopped Harsha from expanding south',
      'The Pallava monuments at Mahabalipuram are a UNESCO World Heritage Site',
    ],
    ask: [
      'What did a traveller from China find surprising about India?',
      'Why did south Indian kings start building in stone?',
      'How was a huge university like Nalanda run?',
    ],
  },
  {
    year: 900,
    realm: 'Rashtrakuta',
    title: 'Three rivals and a temple cut from rock',
    span: 'c. AD 750 to 1000',
    story:
      'For about two centuries, three powers fought over the city of Kannauj: the Palas of Bengal, the Gurjara-Pratiharas of the northwest and the Rashtrakutas of the Deccan. Historians call it the tripartite struggle. The Rashtrakutas also carved the Kailasa temple at Ellora out of a single hill of rock.',
    remember: [
      'The Kailasa temple was carved from the top down, out of solid rock',
      'The Palas supported Buddhist universities like Nalanda and Vikramashila',
      'An Arab traveller counted the Rashtrakuta king among the four great kings of the world',
    ],
    ask: [
      'Why was Kannauj worth fighting over for so long?',
      'How do you carve a whole temple out of one rock?',
      'How did endless wars affect ordinary people?',
    ],
  },
  {
    year: 1000,
    realm: 'Chola Empire',
    title: 'The Chola navy',
    span: 'c. AD 850 to 1279',
    story:
      'The Cholas of Tamil Nadu built one of the strongest navies in Asian history. Rajaraja I raised the huge Brihadeeswarar temple at Thanjavur, and his son Rajendra I sent a fleet to raid Srivijaya in Southeast Asia. Chola bronzes, like the dancing Nataraja, are treasures in museums worldwide.',
    remember: [
      'The Brihadeeswarar temple was completed in 1010',
      'Village assemblies recorded their election rules on temple walls',
      'Chola trade and power reached Sri Lanka, the Maldives and Southeast Asia',
    ],
    ask: [
      'Why did a South Indian kingdom send ships all the way to Indonesia?',
      'How did village councils choose members a thousand years ago?',
      'How were Chola bronzes made?',
    ],
  },
  {
    year: 1300,
    realm: 'Sultanate of Delhi',
    title: 'The Delhi Sultanate',
    span: '1206 to 1526',
    story:
      'Turkic rulers set up a sultanate in Delhi that lasted over 300 years under five dynasties. Alauddin Khalji beat back several Mongol invasions that wrecked other parts of Asia. New buildings like the Qutb Minar and new ways of speaking, which later grew into Hindustani and Urdu, came out of this mix of cultures.',
    remember: [
      'Razia Sultan was one of very few women to rule from Delhi',
      'Work on the Qutb Minar began around 1199',
      'Amir Khusrau wrote poems and music still sung today',
    ],
    ask: [
      'How did Delhi hold off the Mongols when so many great cities fell?',
      'How did Persian, Turkic and Indian cultures blend?',
      'What was life like for a farmer under the sultans?',
    ],
  },
  {
    year: 1500,
    realm: 'Vijayanagara',
    title: 'Vijayanagara and Hampi',
    span: '1336 to 1646',
    story:
      'In the south, the Vijayanagara Empire built a capital at Hampi that foreign visitors compared to Rome. Its markets sold horses, spices and precious stones. It peaked under Krishnadevaraya, before a defeat at the Battle of Talikota in 1565 left the city in ruins.',
    remember: [
      'The ruins of Hampi are a UNESCO World Heritage Site',
      'Krishnadevaraya was also a poet who wrote in Telugu',
      'Portuguese and Persian visitors left detailed descriptions of the city',
    ],
    ask: [
      'What made Hampi so rich?',
      'Why did a single battle bring down such a big empire?',
      'What do ruins tell us that books cannot?',
    ],
  },
  {
    year: 1700,
    realm: 'Mughal Empire',
    title: 'The Mughal Empire',
    span: '1526 to 1857',
    story:
      'Babur founded the Mughal Empire after winning the First Battle of Panipat in 1526. His grandson Akbar brought people of many faiths into his court and government. Shah Jahan built the Taj Mahal, and by 1700, under Aurangzeb, the empire covered almost the whole subcontinent and was one of the richest states on Earth.',
    remember: [
      'By some estimates, Mughal India made about a quarter of the world’s goods around 1700',
      'Akbar hosted debates between scholars of different religions',
      'The Taj Mahal took about 20 years and some 20,000 workers to build',
    ],
    ask: [
      'How did Akbar hold together a land of so many religions and languages?',
      'Why did the empire weaken so quickly after 1707?',
      'Who were the artists behind Mughal miniature paintings?',
    ],
  },
  {
    year: 1783,
    realm: 'Maratha Confederacy',
    title: 'Marathas, Sikhs and a trading company',
    span: 'c. 1674 to 1818',
    story:
      'As Mughal power faded, new powers rose. Shivaji founded a Maratha kingdom in 1674, and by the 1700s the Maratha Confederacy controlled much of India. In Punjab, Ranjit Singh later built a strong Sikh empire. Meanwhile the British East India Company was quietly turning from traders into rulers.',
    remember: [
      'Shivaji was crowned Chhatrapati at Raigad in 1674',
      'The Marathas lost the Third Battle of Panipat in 1761 to Ahmad Shah Durrani',
      'The Company took Bengal after the battles of Plassey (1757) and Buxar (1764)',
    ],
    ask: [
      'How did a trading company end up ruling a country?',
      'What made Maratha forts and ships so hard to beat?',
      'How might India look today if Panipat in 1761 had gone the other way?',
    ],
  },
  {
    year: 1900,
    realm: 'British Raj',
    title: 'The British Raj',
    span: '1858 to 1947',
    story:
      'After the revolt of 1857, the British Crown took direct control of India. Railways, telegraphs and new schools arrived, but so did heavy taxes and deadly famines. Indians organised to demand self-rule, from the founding of the Indian National Congress in 1885 to Gandhi’s mass movements of non-violence.',
    remember: [
      'The revolt of 1857 is often called the First War of Independence',
      'Famines under British rule killed millions, including the Bengal famine of 1943',
      'Gandhi’s Salt March in 1930 drew attention from around the world',
    ],
    ask: [
      'Who gained and who lost from the railways?',
      'Why did non-violent protest work against an empire?',
      'How did people from very different regions come together as one movement?',
    ],
  },
  {
    year: 1960,
    realm: 'India',
    title: 'Independence and the Republic',
    span: '1947 onwards',
    story:
      'India became independent on 15 August 1947, but partition split the land and forced millions from their homes. On 26 January 1950 the Constitution, drafted under B. R. Ambedkar, came into force and India became a republic. More than 560 princely states were joined into the Indian Union.',
    remember: [
      'The first general election, in 1951 to 1952, had about 173 million voters',
      'Sardar Vallabhbhai Patel led the joining of the princely states',
      'India’s Constitution is the longest written constitution of any country',
    ],
    ask: [
      'How do you run an election for 173 million people, most of whom could not read?',
      'What did partition mean for families on both sides?',
      'Why was giving every adult the vote from day one such a bold choice?',
    ],
  },
  {
    year: 2024,
    realm: 'India',
    title: 'India today',
    span: 'Today',
    story:
      'India is now the world’s most populous country, with over 1.4 billion people, 22 languages listed in its Constitution and hundreds more spoken. It is the largest democracy on Earth, landed a spacecraft near the Moon’s south pole in 2023, and still lives alongside traditions thousands of years old.',
    remember: [
      'India passed China as the most populous country in 2023',
      'Chandrayaan-3 landed near the Moon’s south pole in August 2023',
      'This map shows India’s official borders, including all of Jammu and Kashmir, Ladakh and Arunachal Pradesh',
    ],
    ask: [
      'What from each chapter can you still see in India today?',
      'Which region’s history do you know least about?',
      'What would you ask a friend from another state about their history?',
    ],
  },
];
