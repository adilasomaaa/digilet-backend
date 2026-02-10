import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

interface LetterAttributeData {
  placeholder: string;
  content: string;
}

interface LetterPrintData {
  letterNumber?: string;
  recipientName: string;
  recipientInfo?: string[];
  letterContent: string;
  letterhead?: any;
  signatureType?: 'barcode' | 'digital';
  signatures: Array<{
    signature?: string;
    officialName: string;
    officialPosition: string;
    officialNip: string;
    position: string;
    isAcknowledged: boolean;
  }>;
  // Data untuk placeholder replacement
  student?: any; // Student data
  letter?: any; // Letter data
  letterAttributes?: LetterAttributeData[]; // LetterAttributeSubmission data
  carbonCopy?: string | string[]; // Tembusan (HTML string or array)
  attachments?: string[]; // Lampiran (HTML content)
}

@Injectable()
export class LetterTemplateService {
  private readonly studentMapping = {
    nama_mahasiswa: 'fullname',
    nim: 'nim',
    angkatan: 'classYear',
    program_studi: 'institution.name',
    alamat: 'address',
    nomor_telepon: 'phoneNumber',
    tempat_lahir: 'birthplace',
    tanggal_lahir: 'birthday',
    jenis_kelamin: 'gender',
  };

  private readonly letterMapping = {
    nama_surat: 'letterName',
    nomor_referensi: 'referenceNumber',
  };

  private readonly submissionMapping = {
    nomor_surat: 'letterNumber',
    tanggal_surat: 'letterDate',
    tanggal_hijriah: 'letterDateHijri'
  };

  generatePrintHtml(data: LetterPrintData, baseUrl: string): string {
    const {
      letterNumber,
      recipientName,
      recipientInfo,
      letterContent,
      letterhead,
      carbonCopy,
      attachments,
    } = data;

    const { signatures, signatureType } = data;

    const processedContent = this.replacePlaceholders(letterContent, data);

    // Check if there are any center signatures
    const hasCenterSignatures = signatures.some(
      (sig) => sig.position === 'tengah-atas' || sig.position === 'tengah-bawah'
    );

    // Determine grid columns based on center signature presence
    const gridColumns = hasCenterSignatures ? 3 : 2;

    // Process carbonCopy: check if it's an array or string
    let carbonCopyHtml = '';
    if (carbonCopy) {
      if (Array.isArray(carbonCopy) && carbonCopy.length > 0) {
         carbonCopyHtml = `
            <div class="carbon-copy">
                <b>Tembusan:</b>
                <ol>
                    ${carbonCopy.map(cc => `<li>${cc}</li>`).join('')}
                </ol>
            </div>`;
      } else if (typeof carbonCopy === 'string' && carbonCopy.trim() !== '') {
          // Render as raw HTML
          carbonCopyHtml = `
            <div class="carbon-copy">
                ${carbonCopy}
            </div>`;
      }
    }

    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Surat - ${letterNumber || 'Surat'}</title>
    <style>
        @media print {
            @page {
                margin: 1cm 2cm;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
        .header-wrapper {
            display: flex;
            align-items: center;
            border-bottom: 4px double #000;
            padding-bottom: 10px;
        }
        .header-logo {
            flex: 0 0 80px; /* Lebar area logo */
            margin-right: 15px;
        }
        .header-logo img {
            max-width: 80px;
            max-height: 100px;
            object-fit: contain;
        }
        .header-text {
            flex: 1;
            text-align: center;
            line-height:1.2;
            /* Kompensasi agar teks tetap di tengah meskipun ada logo di kiri */
            margin-right: 80px; 
        }
        .header-univ { font-size: 12pt; font-weight: bold; margin: 0; }
        .header-fai { font-size: 14pt; font-weight: bold; margin: 0; }
        .header-address { font-size: 9pt; margin: 0; }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            // padding: 20px;
            color: #000;
        }
        .letter-container {
            max-width: 21cm;
            margin: 0 auto;
            background: white;
            box-sizing: border-box;
            position: relative;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .letterhead {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
        }
        .letterhead img {
            max-width: 100px;
            height: auto;
            margin-bottom: 10px;
        }
        .letterhead h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 5px 0;
            text-transform: uppercase;
        }
        .letterhead h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 5px 0;
        }
        .letterhead p {
            font-size: 11pt;
            margin: 1px 0;
        }
        .letter-info {
            margin-bottom: 20px;
        }
        .letter-info p {
            margin: 0px 0;
        }
        .letter-content {
            text-align: justify;
            margin-bottom: 5px;
            min-height: 200px;
        }

        /* 2. Menghilangkan indentasi otomatis jika Anda menggunakan tabel untuk layout */
        .letter-content p {
            margin-top: 0 !important;
            margin-bottom: 2px !important; 
            line-height: 1.5 !important;
        }

        /* 3. Atur Tabel agar tidak memiliki border secara default (untuk Tabel Informasi) */
        .letter-content figure.table {
            margin: 10px 0 !important;
            width: 100% !important;
        }

        .letter-content figure.table p {
            margin: 0 !important;
            text-indent: 0 !important;
        }

        .letter-content p {
            text-indent: 35px;
        }

        .letter-content table {
            width: 100%;
            border-collapse: collapse;
        }

        .letter-content table td {
            padding: 2px 4px; /* Spasi default, bisa di-override inline */
            vertical-align: top;
            border-style: solid; /* Default style to allow border-width to work */
            border-width: 1px;     /* Default width 0 so borders are hidden unless specified inline */
            border-color: #000;  /* Default color black so 1px borders are visible */
        }
        .letter-content table td, strong {
            margin: 0;
        }
        .signatures {
          display: grid;
          grid-template-columns: repeat(${gridColumns}, 1fr);
          grid-template-rows: auto auto;
          gap: 5px;
        }

        /* Mapping posisi untuk 3 kolom */
        .sig-kiri-atas   { grid-column: 1; grid-row: 1; }
        .sig-tengah-atas  { grid-column: 2; grid-row: 1; }
        .sig-kanan-atas  { grid-column: 3; grid-row: 1; }
        .sig-kiri-bawah  { grid-column: 1; grid-row: 2; }
        .sig-tengah-bawah { grid-column: 2; grid-row: 2; }
        .sig-kanan-bawah { grid-column: 3; grid-row: 2; }
        
        /* Override untuk 2 kolom - kanan tetap di kolom 2 */
        ${gridColumns === 2 ? `
        .signatures .sig-kanan-atas {
          grid-column: 2 !important;
        }
        .signatures .sig-kanan-bawah {
          grid-column: 2 !important;
        }
        ` : ''}

        .signature-block {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .acknowledgment-text {
            font-weight: bold;
        }
        .signature-block .signature-image {
            max-width: 150px;
            max-height: 75px;
            border:1px solid #000;
        }
        .signature-block .official-name {
            font-weight: bold;
            padding-top: 5px;
            display: inline-block;
            min-width: 150px;
        }
        .signature-block .official-position {
            font-weight: bold;
        }
        .signature-block .official-nip {
            font-size: 10pt;
        }
        .print-button {
            text-align: center;
            margin: 20px 0;
        }
        .print-button button {
            padding: 10px 20px;
            font-size: 14pt;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .print-button button:hover {
            background-color: #0056b3;
        }
        .signature-wrapper {
            height: 65px; /* Area penampung yang lebih tinggi */
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Style untuk Tanda Tangan Digital (Signature Pad) */
        .signature-img.signature-digital {
            max-height: 250px !important; /* Diperbesar dari sebelumnya 80px */
            max-width: 250px;
            width: auto;
            object-fit: contain;
            /* Memberikan sedikit filter agar goresan hitam lebih pekat saat diprint */
            filter: contrast(1.2) brightness(0.9); 
        }

        /* Style untuk Barcode / QR Code */
        .signature-img.signature-barcode {
            max-height: 70px !important; /* QR Code tetap ringkas agar tidak dominan */
            width: auto;
            padding: 5px;
            background: white;
        }

        .signature-block .official-name {
            font-weight: bold;
            font-size: 12pt;
        }

        .carbon-copy {
            margin-top: 20px;
            font-size: 10pt;
            /* If it's from editor, it might have p tags with margins */
        }
        .carbon-copy p {
            margin: 0;
        }
        
        .attachment-page {
            page-break-before: always;
        }
        
        .attachment-page img {
            max-width: 100%;
            height: auto;
        }
        .attachment-page table {
          width: 100%;
          border-collapse: collapse;
        }

        .attachment-page table td {
          padding: 2px 4px; /* Spasi default, bisa di-override inline */
          vertical-align: top;
          border-style: solid; /* Default style to allow border-width to work */
          border-width: 1px;     /* Default width 0 so borders are hidden unless specified inline */
          border-color: #000;  /* Default color black so 1px borders are visible */
        }
    </style>
</head>
<body>
    <div class="letter-container">
        ${
          letterhead
            ? `
        <div class="header-wrapper">
            ${
              letterhead?.logo
                ? `
                <div class="header-logo">
                    <img src="${this.getImagePath(letterhead.logo, baseUrl)}" alt="Logo">
                </div>
                `
                : ''
            }
                
                <div class="header-text">
                    <p class="header-univ">${letterhead.header}</p>
                    <p class="header-fai">${letterhead.subheader}</p>
                    <p class="header-address">Alamat: ${letterhead.address}</p>
                    <p class="header-address">Website: http://fai.umgo.ac.id/</p>
                </div>
        </div>
        `
            : ''
        }
        

        <div class="letter-content">
            ${processedContent}
        </div>

        <div class="signatures ${gridColumns === 2 ? 'two-column' : ''}">
          ${signatures
            .map((sig: any) => {
              console.log(sig.isAcknowledged);
              
              const isBase64 = sig.signature?.startsWith('data:image');
              const signatureSrc = sig.signature
                ? isBase64
                  ? sig.signature
                  : this.getImagePath(sig.signature, baseUrl)
                : '';

              const sigClass = sig.signatureType === 'digital'
                  ? 'signature-digital'
                  : 'signature-barcode';

              // Logika posisi berdasarkan value yang Anda berikan
              const positionClass = `sig-${sig.position}`; 

              
               // Check if any signature in the list has acknowledgment to maintain alignment
               const hasAcknowledgment = signatures.some((s: any) => s.isAcknowledged);

               return `
              <div class="signature-block ${positionClass}">
                  ${
                    sig.isAcknowledged
                      ? '<div class="acknowledgment-text">Mengetahui,</div>'
                      : hasAcknowledgment
                        ? '<div class="acknowledgment-text" style="visibility: hidden;">Mengetahui,</div>'
                        : ''
                  }
                  <div class="official-position">${this.escapeHtml(sig.officialPosition)}</div>
                  <div class="signature-wrapper">
                      ${
                        signatureSrc
                          ? `<img src="${signatureSrc}" alt="Signature" class="signature-img ${sigClass}" />`
                          : `<div style="height: 70px;"></div>`
                      }
                  </div>
                  <div class="official-name"><u>${this.escapeHtml(sig.officialName)}</u></div>
                  ${sig.officialNip ? `<div class="official-nip">NBM: ${this.escapeHtml(sig.officialNip)}</div>` : ''}
              </div>
            `;
            })
            .join('')}
        </div>
        
        ${carbonCopyHtml}
    </div>
    
    ${
      attachments && attachments.length > 0
        ? attachments
            .map(
              (att) => `
        <div class="attachment-page">
            ${att}
        </div>
        `
            )
            .join('')
        : ''
    }

    <div class="print-button no-print">
        <button onclick="window.print()">Print Surat</button>
    </div>
</body>
</html>
    `;
  }

  private getImagePath(imagePath: string, baseUrl: string): string {
    if (!imagePath) return '';

    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  }

  private getImageTag(path: string, baseUrl: string, alt: string): string {
    const imagePath = this.getImagePath(path, baseUrl);
    return `<img src="${imagePath}" alt="${alt}" />`;
  }

  async generatePdf(data: LetterPrintData, baseUrl: string): Promise<Buffer> {
    const html = this.generatePrintHtml(data, baseUrl);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '2cm',
          right: '2cm',
          bottom: '2cm',
          left: '2cm',
        },
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private formatHijriDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    
    // Menggunakan Intl.DateTimeFormat dengan kalender islamic-umalqura
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  }

  /**
   * Replace placeholders in template content
   * Supports:
   * - [attribute_name] from LetterAttributeSubmission
   * - [student.field] from Student data
   * - [letter.field] from Letter data
   */
  private replacePlaceholders(
    content: string,
    data: LetterPrintData, // Gunakan interface ini agar semua field bisa diakses
  ): string {
    let processedContent = content;
    const { student, letter, letterAttributes, letterNumber } = data;

    // 1. Mapping Student (Eksis)
    Object.entries(this.studentMapping).forEach(([placeholder, path]) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      const value = this.getNestedValue(student, path);
      processedContent = processedContent.replace(
        regex,
        value ? String(value) : '',
      );
    });

    // 2. Mapping Letter (Eksis)
    Object.entries(this.letterMapping).forEach(([placeholder, path]) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      const value = this.getNestedValue(letter, path);
      processedContent = processedContent.replace(
        regex,
        value ? String(value) : '',
      );
    });

    // 3. BARU: Mapping Submission (nomor_surat & tanggal_surat)
    Object.entries(this.submissionMapping).forEach(([placeholder, path]) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      let value = '';

      const rawDate = (data as any).submission?.letterDate || new Date();

      if (path === 'letterNumber') {
        value = letterNumber || '';
      } else if (path === 'letterDate') {
        value = this.formatDate(rawDate);
      } else if (path === 'letterDateHijri') {
        value = this.formatHijriDate(rawDate); // Memanggil fungsi konversi Hijriah
      }

      processedContent = processedContent.replace(regex, value);
    });

    // 4. Mapping Atribut Dinamis (Eksis)
    letterAttributes?.forEach((attr) => {
      const regex = new RegExp(`\\[${attr.placeholder}\\]`, 'g');
      processedContent = processedContent.replace(regex, attr.content || '');
    });

    return processedContent;
  }

  /**
   * Get nested value from object using dot notation
   * Supports nested paths like "studyProgram.name"
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) {
      return undefined;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
