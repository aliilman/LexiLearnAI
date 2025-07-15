// Tarih bazlı kelime yönetimi için yardımcı fonksiyonlar

class DateManager {
    constructor() {
        this.baseDate = new Date('2025-07-16'); // Başlangıç tarihi
    }

    // Bugünün tarihini YYYY-MM-DD formatında döndür
    getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Belirli bir tarihin gün sayısını hesapla (16 Temmuz 2025'ten itibaren)
    getDayNumber(dateString = null) {
        const targetDate = dateString ? new Date(dateString) : new Date();
        const diffTime = targetDate - this.baseDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return (diffDays % 10) + 1; // 1-10 arası döngü
    }

    // Bugünün kelimelerini CSV'den filtrele
    getTodaysWords(csvData) {
        const today = this.getTodayString();
        return csvData.filter(row => row.Tarih === today);
    }

    // Belirli bir tarihin kelimelerini al
    getWordsForDate(csvData, dateString) {
        return csvData.filter(row => row.Tarih === dateString);
    }

    // Sonraki 7 günün tarihlerini oluştur
    getNext7Days() {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        return dates;
    }

    // Tarihi Türkçe formatta göster
    formatDateTurkish(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('tr-TR', options);
    }

    // Bugün hangi gün olduğunu göster
    getTodayInfo() {
        const today = this.getTodayString();
        const dayNumber = this.getDayNumber();
        const turkishDate = this.formatDateTurkish(today);
        
        return {
            date: today,
            dayNumber: dayNumber,
            turkishDate: turkishDate,
            isWeekend: dayNumber === 6 || dayNumber === 7
        };
    }
}

// CSV okuma fonksiyonu
async function loadWordsFromCSV(csvPath) {
    try {
        console.log('CSV yükleniyor:', csvPath);
        const response = await fetch(csvPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV içeriği yüklendi, uzunluk:', csvText.length);
        
        if (!csvText || csvText.trim().length === 0) {
            throw new Error('CSV dosyası boş');
        }
        
        const lines = csvText.split('\n').filter(line => line.trim());
        console.log('CSV satır sayısı:', lines.length);
        
        if (lines.length < 2) {
            throw new Error('CSV dosyasında yeterli veri yok');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        console.log('CSV başlıkları:', headers);
        
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                // CSV'de virgül içeren alanlar için daha iyi parsing
                const values = parseCSVLine(lines[i]);
                const row = {};
                
                headers.forEach((header, index) => {
                    row[header] = values[index] ? values[index].trim() : '';
                });
                
                data.push(row);
            }
        }
        
        console.log('CSV başarıyla yüklendi, kayıt sayısı:', data.length);
        return data;
    } catch (error) {
        console.error('CSV yüklenirken hata:', error);
        console.error('Hata detayı:', error.message);
        return [];
    }
}

// CSV satırını doğru şekilde parse et
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Kullanım örneği:
/*
const dateManager = new DateManager();
const todayInfo = dateManager.getTodayInfo();
console.log(`Bugün: ${todayInfo.turkishDate}`);
console.log(`Gün numarası: ${todayInfo.dayNumber}`);

// CSV'den kelimeleri yükle
loadWordsFromCSV('kelimeler_veritabani.csv').then(words => {
    const todaysWords = dateManager.getTodaysWords(words);
    console.log('Bugünün kelimeleri:', todaysWords);
});
*/