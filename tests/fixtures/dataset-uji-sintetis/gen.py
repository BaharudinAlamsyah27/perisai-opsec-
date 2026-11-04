import json, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fractions import Fraction

random.seed(7)
B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
M = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
def F(p,s): return ImageFont.truetype(p,s)

def dms(v):
    v=abs(v); d=int(v); m=int((v-d)*60); s=round(((v-d)*60-m)*60,4)
    return ((d,1),(m,1),(int(s*10000),10000))

def make_exif(lat=None, lon=None, when=None, make="FiktifCam", model="Model-X", serial=None, alt=None):
    ex = Image.Exif()
    ex[0x010F]=make; ex[0x0110]=model
    if when:
        ex[0x8769] = {0x9003: when, 0x9004: when, **({0xA431: serial} if serial else {})}
    if lat is not None:
        from PIL.TiffImagePlugin import IFDRational
        def r(t): return tuple(IFDRational(a,b) for a,b in t)
        g = {1:'S' if lat<0 else 'N', 2:r(dms(lat)), 3:'W' if lon<0 else 'E', 4:r(dms(lon))}
        if alt is not None: g[5]=0; g[6]=IFDRational(int(alt*100),100)
        ex[0x8825]=g
    return ex

def bg(w=1600,h=1000,top=(60,70,60),bot=(30,36,30)):
    im=Image.new("RGB",(w,h)); d=ImageDraw.Draw(im)
    for y in range(h):
        t=y/h; d.line([(0,y),(w,y)],fill=tuple(int(top[i]*(1-t)+bot[i]*t) for i in range(3)))
    return im

def board(im, lines, box, fill=(245,245,235), ink=(15,15,15), fs=64, font=B):
    d=ImageDraw.Draw(im); x0,y0,x1,y1=box
    d.rectangle(box,fill=fill,outline=(10,10,10),width=6)
    y=y0+30
    for ln in lines:
        d.text((x0+40,y),ln,font=F(font,fs),fill=ink); y+=int(fs*1.45)

cases=[]
def save(name, im, exif=None, desc="", expect=None):
    kw={"quality":92}
    if exif is not None: kw["exif"]=exif
    im.save(name,"JPEG",**kw)
    cases.append({"file":name,"deskripsi":desc,"harapan":expect or {}})

# 01 bersih
im=bg(); d=ImageDraw.Draw(im)
d.ellipse((600,300,1000,700),fill=(190,60,50)); d.rectangle((760,700,840,900),fill=(90,60,30))
save("01_foto_bersih.jpg", im, None, "Gambar objek polos, tanpa EXIF, tanpa teks.", {"skor":"0-24 (Aman)","temuan":0})

# 02 gps saja
im=bg(top=(70,90,120),bot=(20,30,50)); d=ImageDraw.Draw(im)
d.rectangle((500,350,1100,800),fill=(160,140,100)); d.polygon([(450,350),(800,150),(1150,350)],fill=(120,50,40))
save("02_gps_saja.jpg", im, make_exif(-6.1754,106.8272,"2026:11:03 05:12:00",alt=8), "Rumah-rumahan polos + GPS netral. Tanpa teks.", {"temuan_wajib":["GPS (critical)","waktu (medium)","perangkat (low)"],"skor":">=60"})

# 03 papan satuan + NRP + HP (OCR)
im=bg(); board(im,["POS JAGA","YONIF 999","KODIM 9999"],(150,150,1450,650),fs=96)
board(im,["NRP 12345678","HP 0812-5550-1234"],(150,700,1450,950),fs=70)
save("03_papan_satuan_nrp.jpg", im, make_exif(-6.1754,106.8272,"2026:11:03 06:40:00"), "Papan fiktif: satuan, NRP, nomor HP + GPS.", {"temuan_wajib":["satuan (high)","NRP (high)","nomor HP (medium)","GPS (critical)"],"bbox":"area papan tersensor di versi aman","skor_setelah_sanitasi":"turun jauh"})

# 04 dokumen rahasia
im=bg(top=(200,200,190),bot=(170,170,160)); d=ImageDraw.Draw(im)
d.rectangle((200,100,1400,900),fill=(250,250,245),outline=(30,30,30),width=5)
d.text((280,160),"RAHASIA",font=F(B,170),fill=(190,20,20))
d.text((280,400),"Rencana kegiatan latihan",font=F(R,60),fill=(20,20,20))
d.text((280,500),"Berangkat besok jam 05.00",font=F(R,60),fill=(20,20,20))
d.text((280,600),"Menuju pos perbatasan",font=F(R,60),fill=(20,20,20))
save("04_dokumen_rahasia.jpg", im, None, "Dokumen fiktif berlabel RAHASIA + jadwal + pergerakan.", {"temuan_wajib":["klasifikasi dokumen (critical)","jadwal (medium)","pergerakan (medium)"],"combo":"mungkin: Pola Penugasan Terbaca bila >=3 grup"})

# 05 plat nomor sah
im=bg(top=(90,90,100),bot=(40,40,50)); d=ImageDraw.Draw(im)
d.rounded_rectangle((300,300,1300,700),30,fill=(20,20,20))
d.rounded_rectangle((330,330,1270,670),20,fill=(240,240,240))
plate_text = "AD 1234 XY"
plate_font = F(B,135)
plate_bounds = d.textbbox((0, 0), plate_text, font=plate_font)
plate_width = plate_bounds[2] - plate_bounds[0]
plate_height = plate_bounds[3] - plate_bounds[1]
d.text(((1600 - plate_width) / 2, (1000 - plate_height) / 2), plate_text, font=plate_font, fill=(10,10,10))
save("05_plat_nomor_sah.jpg", im, None, "Plat fiktif format sah AD 1234 XY.", {"temuan_wajib":["plat nomor (medium)"]})

# 06 negatif: teks acak yang TIDAK boleh jadi plat
im=bg(top=(100,100,90),bot=(50,50,45)); board(im,["SG 3 ow","Selamat pagi","semangat hari ini"],(200,200,1400,800),fs=90)
save("06_negatif_bukan_plat.jpg", im, None, "Teks biasa. 'SG 3 ow' TIDAK boleh terdeteksi sebagai plat.", {"temuan":0,"skor":"0-24 (Aman)"})

# 07 warna/huruf campur variasi penulisan
im=bg(); board(im,["kodim 0735","Yon-if 999","Koramil 03"],(150,200,1450,800),fs=96)
save("07_variasi_penulisan.jpg", im, None, "Variasi huruf kecil/tanda hubung. Harus terdeteksi sebagai satuan.", {"temuan_wajib":["satuan (high) x3, kemungkinan perlu normalisasi"]})

# 08 NIK
im=bg(); board(im,["KTP (CONTOH FIKTIF)","NIK 3300000000000001","Nama: BUDI CONTOH"],(150,200,1450,800),fs=76)
save("08_nik_fiktif.jpg", im, None, "NIK 16 digit fiktif.", {"temuan_wajib":["NIK (high)"]})

# 09 foto besar 12MP bersih-ish dengan teks
big=Image.new("RGB",(4000,3000),(80,100,80)); d=ImageDraw.Draw(big)
for i in range(400):
    x=random.randint(0,3900);y=random.randint(0,2900); d.ellipse((x,y,x+80,y+80),fill=(random.randint(40,200),random.randint(40,200),random.randint(40,200)))
board(big,["ASRAMA YONIF 999"],(600,1200,3400,1800),fs=260)
save("09_foto_besar_12mp.jpg", big, make_exif(-6.1754,106.8272,"2026:11:03 07:00:00"), "12 MP. Uji kinerja (<15 dtk) dan skala bbox.", {"kinerja":"<15 detik","bbox":"akurat pada skala asli"})

# 10 bukan gambar
open("10_bukan_gambar.jpg","w").write("ini bukan gambar, hanya teks.")
cases.append({"file":"10_bukan_gambar.jpg","deskripsi":"File teks berekstensi .jpg","harapan":{"perilaku":"pesan error ramah, aplikasi tidak crash"}})

# 11-18 pola hidup: dua lokasi berulang
LOC={"A":(-6.1754,106.8272),"B":(-6.1900,106.8300),"C":(-6.2100,106.8450)}
plan=[("A","2026:11:02 05:50:00"),("B","2026:11:02 07:30:00"),("A","2026:11:03 05:55:00"),("B","2026:11:03 07:28:00"),
      ("A","2026:11:04 05:48:00"),("B","2026:11:04 07:35:00"),("C","2026:11:04 19:10:00"),("A","2026:11:05 05:52:00")]
for i,(k,t) in enumerate(plan, start=11):
    im=bg(top=(random.randint(50,120),random.randint(70,120),random.randint(70,120)),bot=(30,40,40)); d=ImageDraw.Draw(im)
    d.ellipse((650,300,950,600),fill=(random.randint(120,220),90,60))
    save(f"{i}_pola_{k}_{t[5:10].replace(':','-')}.jpg", im, make_exif(*LOC[k],t), f"Foto pola hidup di titik {k}, {t}.", {"pola":"titik A dan B berulang tiap hari, jam sekitar 05.50 dan 07.30; titik C muncul sekali"})

json.dump({"catatan":"Semua data FIKTIF. Koordinat Jakarta pusat (area publik) hanya contoh. Jangan ganti dengan data nyata.","kasus":cases},open("expected.json","w"),ensure_ascii=False,indent=2)
open("README.md","w").write("""# Dataset Uji Sintetis — PERISAI OPSEC

Semua gambar dibuat otomatis, tidak mengandung orang, plat nomor, atau lokasi sungguhan.
Satuan (YONIF 999, KODIM 9999), NRP, NIK, dan nomor HP semuanya FIKTIF.

Letakkan di `tests/fixtures/`. `expected.json` berisi harapan hasil per file (dipakai untuk QA manual
dan referensi test). Foto 01-10 untuk uji deteksi, 11-18 untuk uji Rekonstruksi Pola Hidup (P1).

Cara pakai cepat: unggah satu per satu di aplikasi, bandingkan dengan `expected.json`.
""")
