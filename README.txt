Qwen35-Agent - Masaüstü Terminal

NASIL ÇALIŞTIRILIR?
------------------
1. run.bat dosyasına ÇİFT TIKLA
2. Terminal açılacak, direkt yazmaya başla

KOMUTLAR:
--------
/think              -> Derin düşünme AÇIK (matematik, zor sorular)
/no_think           -> Hızlı mod
/vision C:\foto.jpg Bu nedir?  -> Görsel analiz
/code Python ile todo yaz       -> Kod yazma
/math x^2 + 5x + 6 = 0 çöz     -> Matematik
/clear              -> Sohbeti temizle
/exit               -> Çıkış

ÖRNEKLER:
-------
Sen: Merhaba nasılsın?
Sen: /think 17 koyundan 9'u hariç hepsi öldü kaç kaldı?
Sen: /vision C:\Users\excalibur\Desktop\ekran.png bu hatayı açıkla
Sen: /code Python ile hızlı sıralama yaz
Sen: /math 3x + 2y = 12, 5x - y = 7 çöz

DOSYA YOLU:
----------
C:\Users\excalibur\Desktop\qwen35-agent\

Model: qwen35-agent (qwen3.5:9b - 6.6GB)
Özellikler: Vision, Thinking, 256K Context, Tools

Sorun olursa:
- Ollama çalışmıyor hatası -> Yeni CMD açıp "ollama serve" yaz
- Model yok hatası -> "ollama list" ile kontrol et
