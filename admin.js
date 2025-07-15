// Admin Panel JavaScript
let dateManager = null;
let currentWordsData = [];
let editingWordIndex = -1;
let editingDate = '';

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
    setTodayAsDefault();
});

function initializeAdmin() {
    dateManager = new DateManager();
    console.log('Admin panel başlatıldı');
}

function setupEventListeners() {
    // Tarih kontrolleri
    document.getElementById('loadDatesBtn').addEventListener('click', loadDateRange);
    document.getElementById('todayBtn').addEventListener('click', setTodayAsDefault);
    
    // Modal kontrolleri
    document.getElementById('closeModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('editWordForm').addEventListener('submit', saveWordEdit);
    
    // Yeni gün ekleme
    document.getElementById('addNewDayBtn').addEventListener('click', openNewDayModal);
    document.getElementById('closeNewDayModalBtn').addEventListener('click', closeNewDayModal);
    document.getElementById('cancelNewDayBtn').addEventListener('click', closeNewDayModal);
    document.getElementById('newDayForm').addEventListener('submit', saveNewDay);
    
    // Diğer aksiyonlar
    document.getElementById('saveAllBtn').addEventListener('click', saveAllChanges);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importData);
    document.getElementById('clearLocalStorageBtn').addEventListener('click', clearLocalStorage);
    
    // Modal dışına tıklama ile kapatma
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });
    document.getElementById('newDayModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewDayModal();
    });
}

function setTodayAsDefault() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    document.getElementById('startDate').value = todayString;
    
    // Otomatik olarak yükle
    loadDateRange();
}

async function loadDateRange() {
    const startDateInput = document.getElementById('startDate');
    const startDate = startDateInput.value;
    
    if (!startDate) {
        alert('Lütfen bir başlangıç tarihi seçin!');
        return;
    }
    
    const wordsContainer = document.getElementById('wordsContainer');
    wordsContainer.innerHTML = '<div class="loading-message">📊 Veriler yükleniyor...</div>';
    
    try {
        // 7 günlük tarih aralığı oluştur
        const dates = [];
        const startDateObj = new Date(startDate);
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDateObj);
            currentDate.setDate(startDateObj.getDate() + i);
            dates.push(currentDate.toISOString().split('T')[0]);
        }
        
        // Tarih aralığı bilgisini güncelle
        const endDate = dates[dates.length - 1];
        document.getElementById('dateRangeInfo').textContent = 
            `📅 ${formatDateTurkish(startDate)} - ${formatDateTurkish(endDate)} (7 gün)`;
        
        // Önce localStorage'dan güncellenmiş veri var mı kontrol et
        const overrideData = localStorage.getItem('lexilearn_updated_csv');
        let allWords;
        
        if (overrideData) {
            console.log('Admin panelinde localStorage\'dan güncellenmiş veriler kullanılıyor');
            allWords = parseCSVContent(overrideData);
        } else {
            // CSV'den verileri yükle
            allWords = await loadWordsFromCSV('kelimeler_veritabani_yeni.csv');
        }
        
        currentWordsData = [];
        
        // Her tarih için kelimeleri filtrele
        dates.forEach(date => {
            const wordsForDate = allWords.filter(word => word.Tarih === date);
            if (wordsForDate.length > 0) {
                currentWordsData.push({
                    date: date,
                    words: wordsForDate
                });
            } else {
                // Eğer veri yoksa, gömülü veritabanından al
                const embeddedWords = getEmbeddedWordsForDate(date);
                if (embeddedWords && embeddedWords.length > 0) {
                    // Gömülü format'ı CSV format'ına çevir
                    const csvFormatWords = embeddedWords.map(word => ({
                        Tarih: date,
                        Kelime: word.english,
                        Turkce_Anlam: word.turkish,
                        Ornek_Cumle: word.example,
                        Ornek_Cumle_Turkce: word.exampleTurkish,
                        Es_Anlamli_1: word.synonyms[0] || '',
                        Es_Anlamli_2: word.synonyms[1] || '',
                        Es_Anlamli_3: word.synonyms[2] || '',
                        Es_Anlamli_4: word.synonyms[3] || '',
                        Zit_Anlamli_1: word.antonyms[0] || '',
                        Zit_Anlamli_2: word.antonyms[1] || '',
                        Zit_Anlamli_3: word.antonyms[2] || '',
                        Zit_Anlamli_4: word.antonyms[3] || ''
                    }));
                    currentWordsData.push({
                        date: date,
                        words: csvFormatWords
                    });
                }
            }
        });
        
        displayWordsData();
        
        // localStorage'dan veri yüklendiyse bildir
        if (overrideData) {
            const lastUpdate = localStorage.getItem('lexilearn_last_update');
            if (lastUpdate) {
                const updateDate = new Date(lastUpdate);
                showNotification(`📊 Güncellenmiş veriler yüklendi (Son güncelleme: ${updateDate.toLocaleString('tr-TR')})`, 'info');
            }
        }
        
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        wordsContainer.innerHTML = '<div class="loading-message">❌ Veri yükleme hatası: ' + error.message + '</div>';
    }
}

function displayWordsData() {
    const wordsContainer = document.getElementById('wordsContainer');
    
    if (currentWordsData.length === 0) {
        wordsContainer.innerHTML = '<div class="loading-message">📭 Seçilen tarih aralığında veri bulunamadı</div>';
        return;
    }
    
    let html = '';
    
    currentWordsData.forEach((dayData, dayIndex) => {
        const turkishDate = formatDateTurkish(dayData.date);
        const dayNumber = dateManager.getDayNumber(dayData.date);
        
        html += `
            <div class="day-section">
                <div class="day-header">
                    <div class="day-title">
                        📅 ${turkishDate} (Gün ${dayNumber})
                    </div>
                    <div class="day-actions">
                        <button class="btn btn-outline" onclick="addWordToDay('${dayData.date}')">➕ Kelime Ekle</button>
                        <button class="btn btn-danger" onclick="deleteDay('${dayData.date}')">🗑️ Günü Sil</button>
                    </div>
                </div>
                <div class="words-grid">
        `;
        
        dayData.words.forEach((word, wordIndex) => {
            html += createWordCard(word, dayIndex, wordIndex);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    wordsContainer.innerHTML = html;
}

function createWordCard(word, dayIndex, wordIndex) {
    const synonyms = [
        word.Es_Anlamli_1, word.Es_Anlamli_2, 
        word.Es_Anlamli_3, word.Es_Anlamli_4
    ].filter(s => s && s.trim()).map(s => `<span class="word-tag">${s}</span>`).join('');
    
    const antonyms = [
        word.Zit_Anlamli_1, word.Zit_Anlamli_2, 
        word.Zit_Anlamli_3, word.Zit_Anlamli_4
    ].filter(s => s && s.trim()).map(s => `<span class="word-tag">${s}</span>`).join('');
    
    return `
        <div class="word-card">
            <div class="word-header">
                <div class="word-english">${word.Kelime}</div>
                <button class="edit-word-btn" onclick="editWord(${dayIndex}, ${wordIndex})">✏️ Düzenle</button>
            </div>
            <div class="word-details">
                <p><strong>Türkçe:</strong> ${word.Turkce_Anlam}</p>
                <p><strong>Örnek:</strong> ${word.Ornek_Cumle}</p>
                <p><strong>Türkçe:</strong> ${word.Ornek_Cumle_Turkce}</p>
                <p><strong>Eş anlamlı:</strong></p>
                <div class="word-tags">${synonyms}</div>
                <p><strong>Zıt anlamlı:</strong></p>
                <div class="word-tags">${antonyms}</div>
            </div>
        </div>
    `;
}

function editWord(dayIndex, wordIndex) {
    const word = currentWordsData[dayIndex].words[wordIndex];
    editingWordIndex = wordIndex;
    editingDate = currentWordsData[dayIndex].date;
    
    // Modal form alanlarını doldur
    document.getElementById('editDate').value = editingDate;
    document.getElementById('editEnglish').value = word.Kelime;
    document.getElementById('editTurkish').value = word.Turkce_Anlam;
    document.getElementById('editExample').value = word.Ornek_Cumle;
    document.getElementById('editExampleTurkish').value = word.Ornek_Cumle_Turkce;
    
    document.getElementById('editSynonym1').value = word.Es_Anlamli_1 || '';
    document.getElementById('editSynonym2').value = word.Es_Anlamli_2 || '';
    document.getElementById('editSynonym3').value = word.Es_Anlamli_3 || '';
    document.getElementById('editSynonym4').value = word.Es_Anlamli_4 || '';
    
    document.getElementById('editAntonym1').value = word.Zit_Anlamli_1 || '';
    document.getElementById('editAntonym2').value = word.Zit_Anlamli_2 || '';
    document.getElementById('editAntonym3').value = word.Zit_Anlamli_3 || '';
    document.getElementById('editAntonym4').value = word.Zit_Anlamli_4 || '';
    
    // Modal'ı göster
    document.getElementById('editModal').style.display = 'flex';
}

function saveWordEdit(e) {
    e.preventDefault();
    
    // Form verilerini al
    const updatedWord = {
        Tarih: editingDate,
        Kelime: document.getElementById('editEnglish').value,
        Turkce_Anlam: document.getElementById('editTurkish').value,
        Ornek_Cumle: document.getElementById('editExample').value,
        Ornek_Cumle_Turkce: document.getElementById('editExampleTurkish').value,
        Es_Anlamli_1: document.getElementById('editSynonym1').value,
        Es_Anlamli_2: document.getElementById('editSynonym2').value,
        Es_Anlamli_3: document.getElementById('editSynonym3').value,
        Es_Anlamli_4: document.getElementById('editSynonym4').value,
        Zit_Anlamli_1: document.getElementById('editAntonym1').value,
        Zit_Anlamli_2: document.getElementById('editAntonym2').value,
        Zit_Anlamli_3: document.getElementById('editAntonym3').value,
        Zit_Anlamli_4: document.getElementById('editAntonym4').value
    };
    
    // Veriyi güncelle
    const dayData = currentWordsData.find(day => day.date === editingDate);
    if (dayData) {
        dayData.words[editingWordIndex] = updatedWord;
        
        // Anında localStorage'a kaydet
        saveToLocalStorage();
        
        displayWordsData();
        closeEditModal();
        
        // Başarı mesajı
        showNotification('✅ Kelime güncellendi ve kaydedildi!', 'success');
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingWordIndex = -1;
    editingDate = '';
}

function openNewDayModal() {
    // Yeni gün formu için 5 kelime alanı oluştur
    const container = document.getElementById('newWordsContainer');
    container.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        container.innerHTML += `
            <div class="word-form-section">
                <h4>📝 ${i}. Kelime</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>İngilizce Kelime:</label>
                        <input type="text" id="newWord${i}English" required>
                    </div>
                    <div class="form-group">
                        <label>Türkçe Anlamı:</label>
                        <input type="text" id="newWord${i}Turkish" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Örnek Cümle (İngilizce):</label>
                    <textarea id="newWord${i}Example" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label>Örnek Cümle (Türkçe):</label>
                    <textarea id="newWord${i}ExampleTurkish" rows="2" required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Eş Anlamlı Kelimeler:</label>
                        <input type="text" id="newWord${i}Synonym1" placeholder="1. eş anlamlı">
                        <input type="text" id="newWord${i}Synonym2" placeholder="2. eş anlamlı">
                        <input type="text" id="newWord${i}Synonym3" placeholder="3. eş anlamlı">
                        <input type="text" id="newWord${i}Synonym4" placeholder="4. eş anlamlı">
                    </div>
                    <div class="form-group">
                        <label>Zıt Anlamlı Kelimeler:</label>
                        <input type="text" id="newWord${i}Antonym1" placeholder="1. zıt anlamlı">
                        <input type="text" id="newWord${i}Antonym2" placeholder="2. zıt anlamlı">
                        <input type="text" id="newWord${i}Antonym3" placeholder="3. zıt anlamlı">
                        <input type="text" id="newWord${i}Antonym4" placeholder="4. zıt anlamlı">
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('newDayModal').style.display = 'flex';
}

function closeNewDayModal() {
    document.getElementById('newDayModal').style.display = 'none';
}

function saveNewDay(e) {
    e.preventDefault();
    
    const newDate = document.getElementById('newDayDate').value;
    if (!newDate) {
        alert('Lütfen bir tarih seçin!');
        return;
    }
    
    // 5 kelimeyi topla
    const newWords = [];
    for (let i = 1; i <= 5; i++) {
        const word = {
            Tarih: newDate,
            Kelime: document.getElementById(`newWord${i}English`).value,
            Turkce_Anlam: document.getElementById(`newWord${i}Turkish`).value,
            Ornek_Cumle: document.getElementById(`newWord${i}Example`).value,
            Ornek_Cumle_Turkce: document.getElementById(`newWord${i}ExampleTurkish`).value,
            Es_Anlamli_1: document.getElementById(`newWord${i}Synonym1`).value,
            Es_Anlamli_2: document.getElementById(`newWord${i}Synonym2`).value,
            Es_Anlamli_3: document.getElementById(`newWord${i}Synonym3`).value,
            Es_Anlamli_4: document.getElementById(`newWord${i}Synonym4`).value,
            Zit_Anlamli_1: document.getElementById(`newWord${i}Antonym1`).value,
            Zit_Anlamli_2: document.getElementById(`newWord${i}Antonym2`).value,
            Zit_Anlamli_3: document.getElementById(`newWord${i}Antonym3`).value,
            Zit_Anlamli_4: document.getElementById(`newWord${i}Antonym4`).value
        };
        newWords.push(word);
    }
    
    // Veriyi ekle
    currentWordsData.push({
        date: newDate,
        words: newWords
    });
    
    // Tarihe göre sırala
    currentWordsData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Anında localStorage'a kaydet
    saveToLocalStorage();
    
    displayWordsData();
    closeNewDayModal();
    
    showNotification('✅ Yeni gün eklendi ve kaydedildi!', 'success');
}

async function saveAllChanges() {
    try {
        // Önce mevcut CSV dosyasını yükle
        const allWords = await loadWordsFromCSV('kelimeler_veritabani_yeni.csv');
        
        // Değişiklikleri mevcut veriye uygula
        currentWordsData.forEach(dayData => {
            dayData.words.forEach(updatedWord => {
                // Mevcut veride bu kelimeyi bul ve güncelle
                const existingIndex = allWords.findIndex(word => 
                    word.Tarih === updatedWord.Tarih && 
                    word.Kelime === updatedWord.Kelime
                );
                
                if (existingIndex !== -1) {
                    // Mevcut kelimeyi güncelle
                    allWords[existingIndex] = updatedWord;
                } else {
                    // Yeni kelime ekle
                    allWords.push(updatedWord);
                }
            });
        });
        
        // Tarihe göre sırala
        allWords.sort((a, b) => new Date(a.Tarih) - new Date(b.Tarih));
        
        // CSV formatında veri oluştur
        let csvContent = 'Tarih,Kelime,Turkce_Anlam,Ornek_Cumle,Ornek_Cumle_Turkce,Es_Anlamli_1,Es_Anlamli_2,Es_Anlamli_3,Es_Anlamli_4,Zit_Anlamli_1,Zit_Anlamli_2,Zit_Anlamli_3,Zit_Anlamli_4\n';
        
        allWords.forEach(word => {
            // CSV formatında özel karakterleri escape et
            const escapeCsvField = (field) => {
                if (!field) return '';
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            };
            
            csvContent += [
                word.Tarih,
                escapeCsvField(word.Kelime),
                escapeCsvField(word.Turkce_Anlam),
                escapeCsvField(word.Ornek_Cumle),
                escapeCsvField(word.Ornek_Cumle_Turkce),
                escapeCsvField(word.Es_Anlamli_1),
                escapeCsvField(word.Es_Anlamli_2),
                escapeCsvField(word.Es_Anlamli_3),
                escapeCsvField(word.Es_Anlamli_4),
                escapeCsvField(word.Zit_Anlamli_1),
                escapeCsvField(word.Zit_Anlamli_2),
                escapeCsvField(word.Zit_Anlamli_3),
                escapeCsvField(word.Zit_Anlamli_4)
            ].join(',') + '\n';
        });
        
        // Verileri localStorage'a kaydet
        localStorage.setItem('lexilearn_updated_csv', csvContent);
        localStorage.setItem('lexilearn_last_update', new Date().toISOString());
        
        // Gömülü veritabanını da güncelle
        const embeddedData = generateEmbeddedData();
        localStorage.setItem('lexilearn_updated_embedded', embeddedData);
        
        showNotification('✅ Değişiklikler kaydedildi! Ana uygulamayı yenileyin.', 'success');
        
    } catch (error) {
        console.error('Kaydetme hatası:', error);
        showNotification('❌ Kaydetme hatası: ' + error.message, 'error');
    }
}

function exportData() {
    const jsonData = JSON.stringify(currentWordsData, null, 2);
    downloadFile(jsonData, 'lexilearn_backup.json', 'application/json');
    
    showNotification('📤 Veriler JSON formatında dışa aktarıldı!', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            if (file.name.endsWith('.json')) {
                const data = JSON.parse(event.target.result);
                currentWordsData = data;
                displayWordsData();
                showNotification('📥 JSON verisi başarıyla içe aktarıldı!', 'success');
            } else if (file.name.endsWith('.csv')) {
                // CSV import işlemi
                showNotification('📥 CSV içe aktarma özelliği yakında eklenecek!', 'info');
            }
        } catch (error) {
            showNotification('❌ Dosya içe aktarma hatası: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatDateTurkish(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('tr-TR', options);
}

function updateEmbeddedDatabase() {
    // Gömülü veritabanını güncelle
    let jsContent = `// Gömülü kelime veritabanı - CSV yüklenemediğinde kullanılacak
const embeddedWordsDatabase = {
`;
    
    // İlk birkaç günün verilerini gömülü veritabanına ekle
    const uniqueDates = [...new Set(currentWordsData.map(day => day.date))].slice(0, 4);
    
    uniqueDates.forEach((date, index) => {
        const dayData = currentWordsData.find(day => day.date === date);
        if (dayData) {
            jsContent += `    '${date}': [\n`;
            
            dayData.words.forEach((word, wordIndex) => {
                const synonyms = [
                    word.Es_Anlamli_1, word.Es_Anlamli_2, 
                    word.Es_Anlamli_3, word.Es_Anlamli_4
                ].filter(s => s && s.trim()).map(s => `"${s}"`).join(', ');
                
                const antonyms = [
                    word.Zit_Anlamli_1, word.Zit_Anlamli_2, 
                    word.Zit_Anlamli_3, word.Zit_Anlamli_4
                ].filter(s => s && s.trim()).map(s => `"${s}"`).join(', ');
                
                jsContent += `        {
            english: "${word.Kelime}",
            turkish: "${word.Turkce_Anlam}",
            example: "${word.Ornek_Cumle}",
            exampleTurkish: "${word.Ornek_Cumle_Turkce}",
            synonyms: [${synonyms}],
            antonyms: [${antonyms}]
        }${wordIndex < dayData.words.length - 1 ? ',' : ''}
`;
            });
            
            jsContent += `    ]${index < uniqueDates.length - 1 ? ',' : ''}
`;
        }
    });
    
    jsContent += `};

// Gömülü veritabanından kelime al
function getEmbeddedWordsForDate(dateString) {
    // Tarih döngüsü hesapla (16 Temmuz 2025'ten itibaren)
    const baseDate = new Date('2025-07-16');
    const targetDate = new Date(dateString);
    const diffTime = targetDate - baseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // ${uniqueDates.length} günlük döngü
    const cycleDay = (diffDays % ${uniqueDates.length}) + 1;
    let cycleDate;
    
    switch(cycleDay) {
${uniqueDates.map((date, index) => `        case ${index + 1}:
            cycleDate = '${date}';
            break;`).join('\n')}
        default:
            cycleDate = '${uniqueDates[0]}';
    }
    
    return embeddedWordsDatabase[cycleDate] || embeddedWordsDatabase['${uniqueDates[0]}'];
}`;
    
    // Güncellenmiş gömülü veritabanını indir
    downloadFile(jsContent, 'words_embedded.js', 'text/javascript');
}

function deleteDay(date) {
    if (confirm(`${formatDateTurkish(date)} tarihli günü silmek istediğinizden emin misiniz?`)) {
        currentWordsData = currentWordsData.filter(day => day.date !== date);
        
        // Anında localStorage'a kaydet
        saveToLocalStorage();
        
        displayWordsData();
        showNotification('🗑️ Gün silindi ve kaydedildi!', 'success');
    }
}

function addWordToDay(date) {
    // Basit prompt ile kelime ekleme
    const english = prompt('İngilizce kelime:');
    if (!english) return;
    
    const turkish = prompt('Türkçe anlamı:');
    if (!turkish) return;
    
    const example = prompt('Örnek cümle (İngilizce):');
    if (!example) return;
    
    const exampleTurkish = prompt('Örnek cümle (Türkçe):');
    if (!exampleTurkish) return;
    
    const newWord = {
        Tarih: date,
        Kelime: english,
        Turkce_Anlam: turkish,
        Ornek_Cumle: example,
        Ornek_Cumle_Turkce: exampleTurkish,
        Es_Anlamli_1: '',
        Es_Anlamli_2: '',
        Es_Anlamli_3: '',
        Es_Anlamli_4: '',
        Zit_Anlamli_1: '',
        Zit_Anlamli_2: '',
        Zit_Anlamli_3: '',
        Zit_Anlamli_4: ''
    };
    
    const dayData = currentWordsData.find(day => day.date === date);
    if (dayData) {
        dayData.words.push(newWord);
        
        // Anında localStorage'a kaydet
        saveToLocalStorage();
        
        displayWordsData();
        showNotification('➕ Kelime eklendi ve kaydedildi!', 'success');
    }
}

function saveToLocalStorage() {
    try {
        // CSV formatında veri oluştur
        let csvContent = 'Tarih,Kelime,Turkce_Anlam,Ornek_Cumle,Ornek_Cumle_Turkce,Es_Anlamli_1,Es_Anlamli_2,Es_Anlamli_3,Es_Anlamli_4,Zit_Anlamli_1,Zit_Anlamli_2,Zit_Anlamli_3,Zit_Anlamli_4\n';
        
        currentWordsData.forEach(dayData => {
            dayData.words.forEach(word => {
                const escapeCsvField = (field) => {
                    if (!field) return '';
                    const str = String(field);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return '"' + str.replace(/"/g, '""') + '"';
                    }
                    return str;
                };
                
                csvContent += [
                    word.Tarih,
                    escapeCsvField(word.Kelime),
                    escapeCsvField(word.Turkce_Anlam),
                    escapeCsvField(word.Ornek_Cumle),
                    escapeCsvField(word.Ornek_Cumle_Turkce),
                    escapeCsvField(word.Es_Anlamli_1),
                    escapeCsvField(word.Es_Anlamli_2),
                    escapeCsvField(word.Es_Anlamli_3),
                    escapeCsvField(word.Es_Anlamli_4),
                    escapeCsvField(word.Zit_Anlamli_1),
                    escapeCsvField(word.Zit_Anlamli_2),
                    escapeCsvField(word.Zit_Anlamli_3),
                    escapeCsvField(word.Zit_Anlamli_4)
                ].join(',') + '\n';
            });
        });
        
        // localStorage'a kaydet
        localStorage.setItem('lexilearn_updated_csv', csvContent);
        localStorage.setItem('lexilearn_last_update', new Date().toISOString());
        
        // Gömülü veritabanını da güncelle
        const embeddedData = generateEmbeddedData();
        localStorage.setItem('lexilearn_updated_embedded', embeddedData);
        
    } catch (error) {
        console.error('localStorage kaydetme hatası:', error);
        showNotification('❌ Kaydetme hatası: ' + error.message, 'error');
    }
}

function generateEmbeddedData() {
    // Gömülü veritabanı formatında veri oluştur
    let jsContent = '';
    
    const uniqueDates = [...new Set(currentWordsData.map(day => day.date))].slice(0, 4);
    
    uniqueDates.forEach((date, index) => {
        const dayData = currentWordsData.find(day => day.date === date);
        if (dayData) {
            dayData.words.forEach((word, wordIndex) => {
                const synonyms = [
                    word.Es_Anlamli_1, word.Es_Anlamli_2, 
                    word.Es_Anlamli_3, word.Es_Anlamli_4
                ].filter(s => s && s.trim());
                
                const antonyms = [
                    word.Zit_Anlamli_1, word.Zit_Anlamli_2, 
                    word.Zit_Anlamli_3, word.Zit_Anlamli_4
                ].filter(s => s && s.trim());
                
                jsContent += JSON.stringify({
                    date: date,
                    english: word.Kelime,
                    turkish: word.Turkce_Anlam,
                    example: word.Ornek_Cumle,
                    exampleTurkish: word.Ornek_Cumle_Turkce,
                    synonyms: synonyms,
                    antonyms: antonyms
                }) + '\n';
            });
        }
    });
    
    return jsContent;
}

// CSV içeriğini parse et (admin paneli için)
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

function clearLocalStorage() {
    if (confirm('Tüm değişiklikleri sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        localStorage.removeItem('lexilearn_updated_csv');
        localStorage.removeItem('lexilearn_updated_embedded');
        localStorage.removeItem('lexilearn_last_update');
        
        showNotification('🗑️ Tüm değişiklikler sıfırlandı! Sayfayı yenileyin.', 'warning');
        
        // Sayfayı otomatik yenile
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

function showNotification(message, type = 'info') {
    // Gelişmiş notification sistemi
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // CSS animasyonu ekle
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    switch(type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        default:
            notification.style.background = '#06b6d4';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}