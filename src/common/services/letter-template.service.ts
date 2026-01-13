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
  signatures: Array<{
    signature?: string;
    officialName: string;
    officialPosition: string;
    officialNip: string;
    position: string;
  }>;
  // Data untuk placeholder replacement
  student?: any; // Student data
  letter?: any; // Letter data
  letterAttributes?: LetterAttributeData[]; // LetterAttributeSubmission data
}

@Injectable()
export class LetterTemplateService {
  private readonly studentMapping = {
    nama_mahasiswa: 'fullname',
    nim: 'nim',
    angkatan: 'classYear',
    program_studi: 'studyProgram.name',
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
    tanggal_surat: 'letterDate', // Akan diformat nantinya
  };

  generatePrintHtml(data: LetterPrintData, baseUrl: string): string {
    const {
      letterNumber,
      recipientName,
      recipientInfo,
      letterContent,
      letterhead,
      signatures,
    } = data;

    // Replace placeholders in letter content
    const processedContent = this.replacePlaceholders(
      letterContent,
      data.student,
      data.letter,
      data.letterAttributes || [],
    );

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
                margin: 2cm;
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
            margin-bottom: 20px;
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
            padding: 20px;
            color: #000;
        }
        .letter-container {
            max-width: 21cm;
            margin: 0 auto;
            background: white;
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
            margin: 3px 0;
        }
        .letter-info {
            margin-bottom: 20px;
        }
        .letter-info p {
            margin: 5px 0;
        }
        .letter-content {
            text-align: justify;
            margin-bottom: 30px;
            min-height: 200px;
        }
        .letter-content p {
            margin-bottom: 10px;
            text-indent: 50px;
        }
        .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        .signature-block {
            text-align: center;
            min-width: 200px;
            margin: 20px;
        }
        .signature-block .signature-image {
            max-width: 150px;
            max-height: 80px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
        }
        .signature-block .official-name {
            font-weight: bold;
            margin-top: 5px;
            border-top: 1px solid #000;
            padding-top: 5px;
            display: inline-block;
            min-width: 150px;
        }
        .signature-block .official-position {
            font-size: 10pt;
            margin-top: 5px;
        }
        .signature-block .official-nip {
            font-size: 10pt;
            margin-top: 3px;
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

        <div class="signatures">
            ${signatures
              .map((sig) => {
                const signaturePath = sig.signature
                  ? this.getImagePath(sig.signature, baseUrl)
                  : '';
                const position = sig.position || 'right';
                const positionStyle =
                  position === 'left'
                    ? 'left'
                    : position === 'center'
                      ? 'center'
                      : 'right';
                return `
                <div class="signature-block" style="text-align: ${positionStyle};">
                    ${signaturePath ? `<img src="${signaturePath}" alt="Signature" class="signature-image" />` : ''}
                    <div class="official-name">${this.escapeHtml(sig.officialName)}</div>
                    <div class="official-position">${this.escapeHtml(sig.officialPosition)}</div>
                    <div class="official-nip">NIP. ${this.escapeHtml(sig.officialNip)}</div>
                </div>
              `;
              })
              .join('')}
        </div>
    </div>

    <div class="print-button no-print">
        <button onclick="window.print()">Print Surat</button>
    </div>
</body>
</html>
    `;
  }

  private getImagePath(imagePath: string, baseUrl: string): string {
    if (!imagePath) return '';
    console.log(`${baseUrl}/${imagePath.replace(/^\//, '')}`);

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

  /**
   * Replace placeholders in template content
   * Supports:
   * - [attribute_name] from LetterAttributeSubmission
   * - [student.field] from Student data
   * - [letter.field] from Letter data
   */
  private replacePlaceholders(
    content: string,
    student?: any,
    letter?: any,
    letterAttributes: LetterAttributeData[] = [],
    submission?: any, // Tambahkan parameter submission di sini
  ): string {
    let processedContent = content;

    if (student) {
      Object.entries(this.studentMapping).forEach(
        ([placeholder, fieldPath]) => {
          const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
          const value = this.getNestedValue(student, fieldPath);
          processedContent = processedContent.replace(
            regex,
            value ? String(value) : '',
          );
        },
      );
    }

    if (submission) {
      Object.entries(this.submissionMapping).forEach(
        ([placeholder, fieldPath]) => {
          const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
          let value = this.getNestedValue(submission, fieldPath);

          // Formating khusus jika field adalah tanggal_surat
          if (placeholder === 'tanggal_surat' && value) {
            value = this.formatDate(value);
          }

          processedContent = processedContent.replace(
            regex,
            value ? String(value) : '',
          );
        },
      );
    }

    // 2. Ganti Kustom Placeholder Surat [nama_surat] -> letterName
    if (letter) {
      Object.entries(this.letterMapping).forEach(([placeholder, fieldPath]) => {
        const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
        const value = this.getNestedValue(letter, fieldPath);
        processedContent = processedContent.replace(
          regex,
          value ? String(value) : '',
        );
      });
    }

    // 3. Tetap pertahankan fungsionalitas lama untuk LetterAttribute kustom
    letterAttributes.forEach((attr) => {
      const regex = new RegExp(
        `\\[${this.escapeRegex(attr.placeholder)}\\]`,
        'g',
      );
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
