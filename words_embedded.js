// Gömülü kelime veritabanı - CSV yüklenemediğinde kullanılacak
const embeddedWordsDatabase = {
    '2025-07-16': [
        {
            english: "amazing",
            turkish: "şaşırtıcı; harika",
            example: "The magic show was absolutely amazing.",
            exampleTurkish: "Sihir gösterisi kesinlikle şaşırtıcıydı.",
            synonyms: ["incredible", "wonderful", "fantastic", "astonishing"],
            antonyms: ["boring", "ordinary", "dull", "disappointing"]
        },
        {
            english: "brave",
            turkish: "cesur; yiğit",
            example: "The firefighter was very brave during the rescue.",
            exampleTurkish: "İtfaiyeci kurtarma sırasında çok cesurdu.",
            synonyms: ["courageous", "fearless", "bold", "heroic"],
            antonyms: ["cowardly", "afraid", "timid", "scared"]
        },
        {
            english: "create",
            turkish: "yaratmak; oluşturmak",
            example: "Artists create beautiful paintings every day.",
            exampleTurkish: "Sanatçılar her gün güzel tablolar yaratır.",
            synonyms: ["make", "build", "produce", "design"],
            antonyms: ["destroy", "demolish", "ruin", "break"]
        },
        {
            english: "dream",
            turkish: "rüya; hayal",
            example: "She had a wonderful dream last night.",
            exampleTurkish: "Dün gece harika bir rüya gördü.",
            synonyms: ["vision", "fantasy", "aspiration", "hope"],
            antonyms: ["reality", "nightmare", "fact", "truth"]
        },
        {
            english: "explore",
            turkish: "keşfetmek; araştırmak",
            example: "Children love to explore new places.",
            exampleTurkish: "Çocuklar yeni yerleri keşfetmeyi sever.",
            synonyms: ["investigate", "discover", "examine", "search"],
            antonyms: ["ignore", "avoid", "neglect", "overlook"]
        }
    ],
    '2025-07-17': [
        {
            english: "adventure",
            turkish: "macera; serüven",
            example: "Their trip to the mountains was a great adventure.",
            exampleTurkish: "Dağlara yaptıkları gezi büyük bir maceraydı.",
            synonyms: ["journey", "expedition", "quest", "exploration"],
            antonyms: ["routine", "boredom", "monotony", "safety"]
        },
        {
            english: "brilliant",
            turkish: "parlak; zeki",
            example: "She came up with a brilliant solution to the problem.",
            exampleTurkish: "Soruna parlak bir çözüm buldu.",
            synonyms: ["bright", "clever", "intelligent", "genius"],
            antonyms: ["dull", "stupid", "dim", "foolish"]
        },
        {
            english: "confident",
            turkish: "kendinden emin; güvenli",
            example: "He felt confident about his presentation.",
            exampleTurkish: "Sunumu hakkında kendinden emindi.",
            synonyms: ["assured", "certain", "self-assured", "positive"],
            antonyms: ["insecure", "doubtful", "uncertain", "nervous"]
        },
        {
            english: "delicious",
            turkish: "lezzetli; nefis",
            example: "The homemade pizza was absolutely delicious.",
            exampleTurkish: "Ev yapımı pizza kesinlikle nefisti.",
            synonyms: ["tasty", "flavorful", "scrumptious", "appetizing"],
            antonyms: ["disgusting", "tasteless", "bland", "awful"]
        },
        {
            english: "elegant",
            turkish: "zarif; şık",
            example: "She wore an elegant dress to the party.",
            exampleTurkish: "Partiye zarif bir elbise giydi.",
            synonyms: ["graceful", "sophisticated", "stylish", "refined"],
            antonyms: ["clumsy", "crude", "vulgar", "awkward"]
        }
    ],
    '2025-07-18': [
        {
            english: "fantastic",
            turkish: "harika; muhteşem",
            example: "The concert was fantastic last night.",
            exampleTurkish: "Dün geceki konser harikaydı.",
            synonyms: ["amazing", "wonderful", "marvelous", "excellent"],
            antonyms: ["terrible", "awful", "horrible", "dreadful"]
        },
        {
            english: "generous",
            turkish: "cömert; eli açık",
            example: "My grandmother is very generous with her time.",
            exampleTurkish: "Büyükannem zamanını ayırmada çok cömerttir.",
            synonyms: ["kind", "giving", "charitable", "benevolent"],
            antonyms: ["selfish", "stingy", "greedy", "mean"]
        },
        {
            english: "honest",
            turkish: "dürüst; samimi",
            example: "I appreciate your honest opinion about this.",
            exampleTurkish: "Bu konudaki dürüst görüşün için teşekkürler.",
            synonyms: ["truthful", "sincere", "genuine", "frank"],
            antonyms: ["dishonest", "lying", "deceptive", "false"]
        },
        {
            english: "incredible",
            turkish: "inanılmaz; olağanüstü",
            example: "The view from the mountain top was incredible.",
            exampleTurkish: "Dağın tepesinden manzara inanılmazdı.",
            synonyms: ["amazing", "extraordinary", "remarkable", "astonishing"],
            antonyms: ["ordinary", "believable", "normal", "common"]
        },
        {
            english: "joyful",
            turkish: "neşeli; sevinçli",
            example: "The children were joyful during the celebration.",
            exampleTurkish: "Çocuklar kutlama sırasında çok neşeliydi.",
            synonyms: ["happy", "cheerful", "delighted", "elated"],
            antonyms: ["sad", "miserable", "gloomy", "sorrowful"]
        }
    ],
    '2025-07-23': [
        {
            english: "friendly",
            turkish: "arkadaş canlısı; dostane",
            example: "She is very friendly to everyone she meets.",
            exampleTurkish: "Tanıştığı herkese çok arkadaş canlısıdır.",
            synonyms: ["kind", "warm", "welcoming", "sociable"],
            antonyms: ["unfriendly", "hostile", "cold", "rude"]
        },
        {
            english: "intelligent",
            turkish: "zeki; akıllı",
            example: "He is an intelligent student who learns quickly.",
            exampleTurkish: "Hızlı öğrenen zeki bir öğrencidir.",
            synonyms: ["smart", "clever", "bright", "wise"],
            antonyms: ["stupid", "dumb", "foolish", "ignorant"]
        },
        {
            english: "journey",
            turkish: "yolculuk; seyahat",
            example: "Their journey to Europe was unforgettable.",
            exampleTurkish: "Avrupa yolculukları unutulmazdı.",
            synonyms: ["trip", "voyage", "travel", "adventure"],
            antonyms: ["stay", "arrival", "destination", "home"]
        },
        {
            english: "nature",
            turkish: "doğa; tabiat",
            example: "We should protect nature for future generations.",
            exampleTurkish: "Gelecek nesiller için doğayı korumalıyız.",
            synonyms: ["environment", "wilderness", "outdoors", "ecology"],
            antonyms: ["artificial", "synthetic", "man-made", "urban"]
        },
        {
            english: "opportunity",
            turkish: "fırsat; şans",
            example: "This job is a great opportunity for your career.",
            exampleTurkish: "Bu iş kariyerin için büyük bir fırsat.",
            synonyms: ["chance", "possibility", "opening", "prospect"],
            antonyms: ["obstacle", "barrier", "disadvantage", "hindrance"]
        }
    ]
};

// Gömülü veritabanından kelime al
function getEmbeddedWordsForDate(dateString) {
    // Tarih döngüsü hesapla (16 Temmuz 2025'ten itibaren)
    const baseDate = new Date('2025-07-16');
    const targetDate = new Date(dateString);
    const diffTime = targetDate - baseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 10 günlük döngü
    const cycleDay = (diffDays % 4) + 1; // Şu anda 4 günlük veri var
    let cycleDate;
    
    switch(cycleDay) {
        case 1:
            cycleDate = '2025-07-16';
            break;
        case 2:
            cycleDate = '2025-07-17';
            break;
        case 3:
            cycleDate = '2025-07-18';
            break;
        case 4:
            cycleDate = '2025-07-23';
            break;
        default:
            cycleDate = '2025-07-16';
    }
    
    return embeddedWordsDatabase[cycleDate] || embeddedWordsDatabase['2025-07-16'];
}