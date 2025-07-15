// Kelime veritabanı - CSV'den dinamik olarak yüklenecek
let wordsDatabase = [];
let dateManager = null;

// Uygulama durumu
let currentWordIndex = 0;
let studiedWords = 0; // Öğrenilen kelime sayısı
let currentTestIndex = 0; // Test modunda hangi kelimede olduğumuz
let isTestMode = false; // Test modunda mı yoksa öğrenme modunda mı
let testAnswers = []; // Test cevapları
let dailyStreak = 0;
let totalWords = 0;
let lastCompletionDate = null;

// DOM elementleri
const elements = {
    dailyStreak: document.getElementById('dailyStreak'),
    totalWords: document.getElementById('totalWords'),
    progressFill: document.getElementById('progressFill'),
    currentWord: document.getElementById('currentWord'),
    englishWord: document.getElementById('englishWord'),
    pronunciationBtn: document.getElementById('pronunciationBtn'),
    turkishMeaning: document.getElementById('turkishMeaning'),
    englishExample: document.getElementById('englishExample'),
    turkishExample: document.getElementById('turkishExample'),
    synonyms: document.getElementById('synonyms'),
    antonyms: document.getElementById('antonyms'),
    studyBtn: document.getElementById('studyBtn'),
    testBtn: document.getElementById('testBtn'),
    wordCard: document.getElementById('wordCard'),
    testSection: document.getElementById('testSection'),
    testQuestion: document.getElementById('testQuestion'),
    backToStudyBtn: document.getElementById('backToStudyBtn'),
    testResult: document.getElementById('testResult'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    completionMessage: document.getElementById('completionMessage'),
    finalStreak: document.getElementById('finalStreak'),
    newDayBtn: document.getElementById('newDayBtn')
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', async function() {
    await loadStreakData();
    await initializeApp();
    setupEventListeners();
    loadCurrentWord();
});

async function initializeApp() {
    try {
        // DateManager'ı başlat
        dateManager = new DateManager();
        
        // Bugünün tarih bilgilerini al
        const todayInfo = dateManager.getTodayInfo();
        console.log(`Bugün: ${todayInfo.turkishDate}`);
        
        // Önce localStorage'dan güncellenmiş veri var mı kontrol et
        const overrideData = localStorage.getItem('lexilearn_updated_csv');
        let allWords;
        
        if (overrideData) {
            console.log('Admin panelinden güncellenmiş veriler kullanılıyor');
            allWords = parseCSVContent(overrideData);
        } else {
            // CSV'den kelimeleri yükle
            allWords = await loadWordsFromCSV('kelimeler_veritabani_yeni.csv');
        }
        
        if (allWords.length === 0) {
            console.warn('CSV veritabanı yüklenemedi, gömülü veritabanı kullanılıyor');
            // Fallback: Gömülü veritabanı
            wordsDatabase = getEmbeddedWordsForDate(todayInfo.date);
            console.log(`Gömülü veritabanından ${wordsDatabase.length} kelime yüklendi`);
        } else {
            // Bugünün kelimelerini filtrele
            const todaysWords = dateManager.getTodaysWords(allWords);
            
            if (todaysWords.length === 0) {
                console.warn('Bugün için CSV\'de kelime bulunamadı, gömülü veritabanı kullanılıyor');
                wordsDatabase = getEmbeddedWordsForDate(todayInfo.date);
                console.log(`Gömülü veritabanından ${wordsDatabase.length} kelime yüklendi`);
            } else {
                // CSV formatını uygulama formatına dönüştür
                wordsDatabase = convertCSVToAppFormat(todaysWords);
                console.log(`CSV'den bugün için ${wordsDatabase.length} kelime yüklendi`);
            }
        }
        
        // Günlük seriyi kontrol et
        const today = dateManager.getTodayString();
        if (lastCompletionDate !== today) {
            // Yeni gün, ilerlemeyi sıfırla
            studiedWords = 0;
            currentWordIndex = 0;
            currentTestIndex = 0;
            isTestMode = false;
            testAnswers = [];
            
            // Seri kontrolü: Eğer son tamamlama tarihi dünden eski ise seriyi sıfırla
            if (lastCompletionDate) {
                const lastDate = new Date(lastCompletionDate);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays > 1) {
                    console.log(`${diffDays} gün atlandı, seri sıfırlanıyor`);
                    dailyStreak = 0;
                    await saveStreakData();
                }
            }
        }
        
        updateStats();
        updateProgress();
        updateDateDisplay(todayInfo);
        
    } catch (error) {
        console.error('Uygulama başlatılırken hata:', error);
        // Hata durumunda gömülü veritabanı
        const today = new Date().toISOString().split('T')[0];
        wordsDatabase = getEmbeddedWordsForDate(today);
        console.log(`Hata durumunda gömülü veritabanından ${wordsDatabase.length} kelime yüklendi`);
        updateStats();
        updateProgress();
        
        // Basit tarih bilgisi göster
        const todayInfo = {
            turkishDate: new Date().toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            }),
            dayNumber: ((Math.floor((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24)) % 7) + 1)
        };
        updateDateDisplay(todayInfo);
    }
}

function setupEventListeners() {
    elements.pronunciationBtn.addEventListener('click', pronounceWord);
    elements.studyBtn.addEventListener('click', toggleStudyMode);
    elements.testBtn.addEventListener('click', startTest);
    elements.backToStudyBtn.addEventListener('click', backToStudy);
    elements.prevBtn.addEventListener('click', previousWord);
    elements.nextBtn.addEventListener('click', nextWord);
    elements.newDayBtn.addEventListener('click', startNewDay);
}

function loadCurrentWord() {
    const word = wordsDatabase[currentWordIndex];
    
    elements.englishWord.textContent = word.english;
    elements.turkishMeaning.textContent = word.turkish;
    elements.englishExample.textContent = word.example;
    elements.turkishExample.textContent = word.exampleTurkish;
    
    // Eş anlamlı kelimeleri yükle
    elements.synonyms.innerHTML = '';
    word.synonyms.forEach(synonym => {
        const tag = document.createElement('span');
        tag.className = 'word-tag';
        tag.textContent = synonym;
        elements.synonyms.appendChild(tag);
    });
    
    // Zıt anlamlı kelimeleri yükle
    elements.antonyms.innerHTML = '';
    word.antonyms.forEach(antonym => {
        const tag = document.createElement('span');
        tag.className = 'word-tag';
        tag.textContent = antonym;
        elements.antonyms.appendChild(tag);
    });
    
    // Buton durumlarını güncelle
    updateButtonStates();
}

function updateButtonStates() {
    if (isTestMode) {
        // Test modunda navigasyon butonları
        elements.prevBtn.disabled = currentTestIndex === 0;
        elements.nextBtn.disabled = currentTestIndex >= 4;
        elements.studyBtn.style.display = 'none';
        elements.testBtn.style.display = 'none';
    } else {
        // Öğrenme modunda navigasyon butonları
        elements.prevBtn.disabled = currentWordIndex === 0;
        elements.nextBtn.disabled = currentWordIndex >= 4;
        elements.studyBtn.style.display = 'flex';
        elements.testBtn.style.display = 'flex';
        
        // Tüm kelimeler öğrenildiyse test butonunu göster
        if (studiedWords === 5) {
            elements.testBtn.textContent = '🎯 Günlük Teste Başla';
            elements.testBtn.disabled = false;
        } else {
            elements.testBtn.textContent = `✏️ Teste Geç (${studiedWords}/5)`;
            elements.testBtn.disabled = true;
        }
    }
}

function toggleStudyMode() {
    // Kelimeyi öğrenildi olarak işaretle
    if (currentWordIndex >= studiedWords) {
        studiedWords = currentWordIndex + 1;
        updateProgress();
    }
    
    elements.studyBtn.textContent = '✅ İncelendi';
    elements.studyBtn.disabled = true;
    updateButtonStates();
}

function startTest() {
    if (studiedWords < 5) {
        alert('Önce tüm kelimeleri öğrenmelisiniz!');
        return;
    }
    
    // Test moduna geç
    isTestMode = true;
    currentTestIndex = 0;
    testAnswers = [];
    
    // Test UI'ını göster
    showTestQuestion();
    elements.wordCard.style.display = 'none';
    elements.testSection.style.display = 'block';
    
    updateButtonStates();
}

function showTestQuestion() {
    const word = wordsDatabase[currentTestIndex];
    
    // Test durumunu sıfırla
    isAnswerSubmitted = false;
    if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
        autoAdvanceTimeout = null;
    }
    
    // Test sorusunu oluştur
    const testSentence = word.example.replace(new RegExp(word.english, 'gi'), '_____');
    
    // Seçenekleri oluştur (doğru cevap + diğer 4 kelime)
    const options = [word.english];
    const otherWords = wordsDatabase.filter((_, index) => index !== currentTestIndex);
    
    // Diğer 4 kelimeyi rastgele seç
    while (options.length < 5) {
        const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
        if (!options.includes(randomWord.english)) {
            options.push(randomWord.english);
        }
    }
    
    // Seçenekleri karıştır
    shuffleArray(options);
    
    // HTML oluştur
    let optionsHTML = '';
    options.forEach((option, index) => {
        optionsHTML += `
            <button class="option-btn" data-answer="${option}">
                ${String.fromCharCode(65 + index)}) ${option}
            </button>
        `;
    });
    
    elements.testQuestion.innerHTML = `
        <div class="question-header">
            <strong>Soru ${currentTestIndex + 1}/5:</strong>
        </div>
        <div class="question-sentence">
            ${testSentence}
        </div>
        <div class="question-options">
            ${optionsHTML}
        </div>
    `;
    
    elements.testResult.style.display = 'none';
    
    // Seçenek butonlarına event listener ekle
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectAnswer(this.dataset.answer);
        });
    });
}

function backToStudy() {
    if (isTestMode) {
        // Test modundan çık
        isTestMode = false;
        currentTestIndex = 0;
        testAnswers = [];
        updateButtonStates();
    }
    
    elements.wordCard.style.display = 'block';
    elements.testSection.style.display = 'none';
}

let isAnswerSubmitted = false;
let autoAdvanceTimeout = null;

function selectAnswer(selectedAnswer) {
    // Eğer cevap zaten verilmişse, tekrar işlem yapma
    if (isAnswerSubmitted) return;
    
    isAnswerSubmitted = true;
    const correctAnswer = wordsDatabase[currentTestIndex].english;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Cevabı kaydet
    testAnswers[currentTestIndex] = {
        question: currentTestIndex,
        userAnswer: selectedAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
    };
    
    // Tüm butonları deaktif et ve renkleri göster
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        const answer = btn.dataset.answer;
        
        if (answer === correctAnswer) {
            btn.classList.add('correct-answer');
        } else if (answer === selectedAnswer && !isCorrect) {
            btn.classList.add('wrong-answer');
        } else {
            btn.classList.add('disabled-answer');
        }
    });
    
    // Sonuç mesajını göster
    elements.testResult.style.display = 'block';
    
    if (isCorrect) {
        elements.testResult.className = 'test-result correct';
        elements.testResult.innerHTML = `
            <div>🎉 Doğru! Tebrikler!</div>
            <div><strong>${correctAnswer}</strong> kelimesini doğru bildiniz!</div>
            <div class="next-info">3 saniye sonra sonraki soruya geçilecek...</div>
        `;
    } else {
        elements.testResult.className = 'test-result incorrect';
        elements.testResult.innerHTML = `
            <div>❌ Yanlış cevap</div>
            <div>Doğru cevap: <strong>${correctAnswer}</strong></div>
            <div>Seçtiğiniz: <strong>${selectedAnswer}</strong></div>
            <div class="next-info">3 saniye sonra sonraki soruya geçilecek...</div>
        `;
    }
    
    // Manuel geçiş butonunu göster
    showManualNextButton();
    
    // Otomatik geçiş (3 saniye sonra)
    autoAdvanceTimeout = setTimeout(() => {
        proceedToNextQuestion();
    }, 3000);
}

function showManualNextButton() {
    // Manuel geçiş butonu ekle
    const manualNextBtn = document.createElement('button');
    manualNextBtn.className = 'btn btn-primary manual-next-btn';
    manualNextBtn.innerHTML = currentTestIndex === 4 ? '🎯 Sonuçları Gör' : '➡️ Sonraki Soru';
    manualNextBtn.onclick = () => {
        clearTimeout(autoAdvanceTimeout);
        proceedToNextQuestion();
    };
    
    elements.testResult.appendChild(manualNextBtn);
}

function proceedToNextQuestion() {
    // Eğer zaten işlem yapılmışsa, tekrar yapma
    if (!isAnswerSubmitted) return;
    
    // Timeout'u temizle
    if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
        autoAdvanceTimeout = null;
    }
    
    // Manuel butonları kaldır
    document.querySelectorAll('.manual-next-btn').forEach(btn => btn.remove());
    
    // Son soru mu?
    if (currentTestIndex === 4) {
        showTestResults();
    } else {
        // Sonraki soruya geç
        currentTestIndex++;
        isAnswerSubmitted = false; // Yeni soru için sıfırla
        showTestQuestion();
        updateButtonStates();
    }
}

// submitTest fonksiyonunu kaldırıyoruz çünkü artık selectAnswer kullanıyoruz
function submitTest() {
    // Bu fonksiyon artık kullanılmıyor
}

function previousWord() {
    if (isTestMode) {
        if (currentTestIndex > 0) {
            currentTestIndex--;
            showTestQuestion();
            updateButtonStates();
        }
    } else {
        if (currentWordIndex > 0) {
            currentWordIndex--;
            loadCurrentWord();
            resetWordState();
        }
    }
}

function nextWord() {
    if (isTestMode) {
        // Test modunda manuel geçiş
        if (isAnswerSubmitted) {
            // Cevap verildiyse, otomatik geçişi iptal et ve manuel geç
            clearTimeout(autoAdvanceTimeout);
            proceedToNextQuestion();
        }
        // Cevap verilmediyse hiçbir şey yapma
    } else {
        if (currentWordIndex < 4) {
            currentWordIndex++;
            loadCurrentWord();
            resetWordState();
        }
    }
}

function resetWordState() {
    // Kelime daha önce öğrenildiyse buton durumunu güncelle
    if (currentWordIndex < studiedWords) {
        elements.studyBtn.textContent = '✅ İncelendi';
        elements.studyBtn.disabled = true;
    } else {
        elements.studyBtn.textContent = '📖 Kelimeyi İncele';
        elements.studyBtn.disabled = false;
    }
    updateButtonStates();
}

function updateProgress() {
    const progressPercentage = (studiedWords / 5) * 100;
    elements.progressFill.style.width = progressPercentage + '%';
    elements.currentWord.textContent = studiedWords;
}

function updateStats() {
    elements.dailyStreak.textContent = dailyStreak;
    elements.totalWords.textContent = totalWords;
}

async function completeDay() {
    const today = dateManager ? dateManager.getTodayString() : new Date().toISOString().split('T')[0];
    
    // Bugün zaten tamamlanmış mı kontrol et
    if (lastCompletionDate === today) {
        console.log('Bugün zaten tamamlanmış, seri artırılmayacak');
        // Sadece tebrik mesajını göster, seriyi artırma
        elements.finalStreak.textContent = dailyStreak;
        elements.completionMessage.style.display = 'flex';
        return;
    }
    
    // Günlük seriyi artır (sadece yeni gün ise)
    dailyStreak++;
    totalWords += 5;
    lastCompletionDate = today;
    
    // Hem localStorage hem de dosyaya kaydet
    await saveStreakData();
    
    // Tebrik mesajını göster
    elements.finalStreak.textContent = dailyStreak;
    elements.completionMessage.style.display = 'flex';
    
    updateStats();
}

function startNewDay() {
    // Yeni gün için sıfırla
    currentWordIndex = 0;
    studiedWords = 0;
    currentTestIndex = 0;
    isTestMode = false;
    testAnswers = [];
    
    // Kelimeleri karıştır (basit shuffle)
    shuffleArray(wordsDatabase);
    
    // UI'ı sıfırla
    elements.completionMessage.style.display = 'none';
    resetWordState();
    loadCurrentWord();
    updateProgress();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showTestResults() {
    const correctAnswers = testAnswers.filter(answer => answer.isCorrect).length;
    const score = (correctAnswers / 5) * 100;
    
    // Test sonuçları HTML'i oluştur
    let resultsHTML = `
        <div class="test-results">
            <h2>🎯 Test Sonuçları</h2>
            <div class="score-summary">
                <div class="score-circle">
                    <span class="score-number">${correctAnswers}/5</span>
                    <span class="score-percentage">${score}%</span>
                </div>
            </div>
            <div class="results-details">
    `;
    
    testAnswers.forEach((answer, index) => {
        const word = wordsDatabase[index];
        const statusIcon = answer.isCorrect ? '✅' : '❌';
        const statusClass = answer.isCorrect ? 'correct' : 'incorrect';
        
        resultsHTML += `
            <div class="result-item ${statusClass}">
                <div class="result-header">
                    ${statusIcon} <strong>${word.english}</strong>
                </div>
                <div class="result-details">
                    <p><strong>Soru:</strong> ${word.example.replace(new RegExp(word.english, 'gi'), '_____')}</p>
                    <p><strong>Sizin cevabınız:</strong> ${answer.userAnswer}</p>
                    ${!answer.isCorrect ? `<p><strong>Doğru cevap:</strong> ${answer.correctAnswer}</p>` : ''}
                </div>
            </div>
        `;
    });
    
    resultsHTML += `
            </div>
            <div class="results-actions">
                <button class="btn btn-secondary" id="reviewWordsBtn">📖 Kelimeleri Tekrar Gözden Geçir</button>
                <button class="btn btn-primary" id="finishTestBtn">🎉 Testi Tamamla</button>
            </div>
        </div>
    `;
    
    // Test bölümünü sonuçlarla değiştir
    elements.testSection.innerHTML = resultsHTML;
    
    // Yeni butonlara event listener ekle
    document.getElementById('reviewWordsBtn').addEventListener('click', reviewWords);
    document.getElementById('finishTestBtn').addEventListener('click', finishTest);
}

function reviewWords() {
    // Test modundan çık ve kelime inceleme moduna dön
    isTestMode = false;
    currentWordIndex = 0;
    currentTestIndex = 0;
    
    // Test section'ını gizle, word card'ı göster
    elements.testSection.style.display = 'none';
    elements.wordCard.style.display = 'block';
    
    // İlk kelimeyi yükle
    loadCurrentWord();
    resetWordState();
    updateButtonStates();
}

async function finishTest() {
    // Günü tamamla
    await completeDay();
}

// CSV formatını uygulama formatına dönüştür
function convertCSVToAppFormat(csvWords) {
    return csvWords.map(row => ({
        english: row.Kelime || '',
        turkish: row.Turkce_Anlam || '',
        example: row.Ornek_Cumle || '',
        exampleTurkish: row.Ornek_Cumle_Turkce || '',
        synonyms: [
            row.Es_Anlamli_1 || '',
            row.Es_Anlamli_2 || '',
            row.Es_Anlamli_3 || '',
            row.Es_Anlamli_4 || ''
        ].filter(word => word.trim() !== ''),
        antonyms: [
            row.Zit_Anlamli_1 || '',
            row.Zit_Anlamli_2 || '',
            row.Zit_Anlamli_3 || '',
            row.Zit_Anlamli_4 || ''
        ].filter(word => word.trim() !== '')
    }));
}

// Varsayılan kelimeler (fallback)
function getDefaultWords() {
    return [
        {
            english: "beautiful",
            turkish: "güzel, çok hoş",
            example: "The sunset was absolutely beautiful tonight.",
            exampleTurkish: "Bu akşam gün batımı kesinlikle çok güzeldi.",
            synonyms: ["gorgeous", "lovely", "stunning", "attractive"],
            antonyms: ["ugly", "hideous", "unattractive", "plain"]
        },
        {
            english: "challenge",
            turkish: "meydan okuma, zorluk",
            example: "Learning a new language is always a challenge.",
            exampleTurkish: "Yeni bir dil öğrenmek her zaman bir meydan okumadır.",
            synonyms: ["difficulty", "obstacle", "test", "trial"],
            antonyms: ["ease", "simplicity", "comfort", "advantage"]
        },
        {
            english: "discover",
            turkish: "keşfetmek, bulmak",
            example: "Scientists discover new species every year.",
            exampleTurkish: "Bilim insanları her yıl yeni türler keşfeder.",
            synonyms: ["find", "uncover", "reveal", "detect"],
            antonyms: ["hide", "conceal", "lose", "miss"]
        },
        {
            english: "enormous",
            turkish: "çok büyük, devasa",
            example: "The elephant was enormous compared to other animals.",
            exampleTurkish: "Fil, diğer hayvanlara kıyasla devasaydı.",
            synonyms: ["huge", "massive", "gigantic", "immense"],
            antonyms: ["tiny", "small", "miniature", "microscopic"]
        },
        {
            english: "fascinating",
            turkish: "büyüleyici, çok ilginç",
            example: "The documentary about space was fascinating.",
            exampleTurkish: "Uzay hakkındaki belgesel büyüleyiciydi.",
            synonyms: ["captivating", "intriguing", "amazing", "enchanting"],
            antonyms: ["boring", "dull", "uninteresting", "tedious"]
        }
    ];
}

// Tarih bilgisini UI'da göster
function updateDateDisplay(todayInfo) {
    // Header'a tarih bilgisi ekle
    const header = document.querySelector('.header');
    let dateDisplay = document.getElementById('dateDisplay');
    
    if (!dateDisplay) {
        dateDisplay = document.createElement('div');
        dateDisplay.id = 'dateDisplay';
        dateDisplay.className = 'date-display';
        header.appendChild(dateDisplay);
    }
    
    dateDisplay.innerHTML = `
        <div class="today-date">📅 ${todayInfo.turkishDate}</div>
        <div class="day-cycle">Gün ${todayInfo.dayNumber}/7</div>
    `;
}

// CSV içeriğini parse et
function parseCSVContent(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            });
            
            data.push(row);
        }
    }
    
    return data;
}

function pronounceWord() {
    const word = wordsDatabase[currentWordIndex].english;
    
    // Web Speech API kullanarak telaffuz
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    } else {
        // Fallback: Basit animasyon
        elements.pronunciationBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            elements.pronunciationBtn.style.transform = 'scale(1)';
        }, 200);
    }
}

// Seri verilerini dosyadan yükle
async function loadStreakData() {
    try {
        // Önce dosyadan yüklemeyi dene
        const response = await fetch('streak_data.json');
        if (response.ok) {
            const data = await response.json();
            dailyStreak = data.dailyStreak || 0;
            totalWords = data.totalWords || 0;
            lastCompletionDate = data.lastCompletionDate;
            console.log('Seri verileri dosyadan yüklendi:', data);
        } else {
            throw new Error('Dosya bulunamadı');
        }
    } catch (error) {
        console.log('Dosyadan yüklenemedi, localStorage\'dan yükleniyor:', error.message);
        // Fallback: localStorage'dan yükle
        dailyStreak = parseInt(localStorage.getItem('dailyStreak') || '0');
        totalWords = parseInt(localStorage.getItem('totalWords') || '0');
        lastCompletionDate = localStorage.getItem('lastCompletionDate');
        
        // İlk kez dosyaya kaydet
        await saveStreakData();
    }
}

// Seri verilerini hem dosyaya hem localStorage'a kaydet
async function saveStreakData() {
    const data = {
        dailyStreak: dailyStreak,
        totalWords: totalWords,
        lastCompletionDate: lastCompletionDate,
        streakHistory: JSON.parse(localStorage.getItem('streakHistory') || '[]'),
        lastUpdated: new Date().toISOString()
    };
    
    // localStorage'a kaydet (hızlı erişim için)
    localStorage.setItem('dailyStreak', dailyStreak.toString());
    localStorage.setItem('totalWords', totalWords.toString());
    localStorage.setItem('lastCompletionDate', lastCompletionDate || '');
    
    try {
        // Dosyaya kaydetmeyi dene (Netlify Functions kullanarak)
        const response = await fetch('/.netlify/functions/save-streak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Seri verileri dosyaya kaydedildi');
        } else {
            console.log('Dosyaya kaydetme başarısız, sadece localStorage kullanılıyor');
        }
    } catch (error) {
        console.log('Dosyaya kaydetme hatası:', error.message);
        console.log('Veriler sadece localStorage\'da saklanıyor');
    }
}