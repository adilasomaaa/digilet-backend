import { Injectable } from '@nestjs/common';

import {
  formatDate,
  formatHijriDate,
  escapeHtml,
  getNestedValue,
  getImagePath,
} from './letter-template/utils';

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

  /**
   * Generate HTML for print view
   */
  generatePrintHtml(data: LetterPrintData, baseUrl: string): string {
    const {
      letterNumber,
      letterContent,
      letterhead,
      carbonCopy,
      attachments,
    } = data;

    const { signatures } = data;

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
                    ${carbonCopy.map((cc) => `<li>${cc}</li>`).join('')}
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
            flex: 0 0 80px;
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

        .letter-content p {
            margin-top: 0 !important;
            margin-bottom: 2px !important;
            line-height: 1.5 !important;
        }

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
            padding: 2px 4px;
            vertical-align: top;
            border-style: solid;
            border-width: 1px;
            border-color: #000;
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

        .sig-kiri-atas   { grid-column: 1; grid-row: 1; }
        .sig-tengah-atas  { grid-column: 2; grid-row: 1; }
        .sig-kanan-atas  { grid-column: 3; grid-row: 1; }
        .sig-kiri-bawah  { grid-column: 1; grid-row: 2; }
        .sig-tengah-bawah { grid-column: 2; grid-row: 2; }
        .sig-kanan-bawah { grid-column: 3; grid-row: 2; }
        
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
        .signature-wrapper {
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .signature-img.signature-digital {
            max-height: 250px !important;
            max-width: 250px;
            width: auto;
            object-fit: contain;
            filter: contrast(1.2) brightness(0.9);
        }

        .signature-img.signature-barcode {
            max-height: 70px !important;
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
          padding: 2px 4px;
          vertical-align: top;
          border-style: solid;
          border-width: 1px;
          border-color: #000;
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
                    <img src="${getImagePath(letterhead.logo, baseUrl)}" alt="Logo">
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
              const isBase64 = sig.signature?.startsWith('data:image');
              const signatureSrc = sig.signature
                ? isBase64
                  ? sig.signature
                  : getImagePath(sig.signature, baseUrl)
                : '';

              const sigClass = sig.signatureType === 'digital'
                  ? 'signature-digital'
                  : 'signature-barcode';

              const positionClass = `sig-${sig.position}`;

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
                  <div class="official-position">${escapeHtml(sig.officialPosition)}</div>
                  <div class="signature-wrapper">
                      ${
                        signatureSrc
                          ? `<img src="${signatureSrc}" alt="Signature" class="signature-img ${sigClass}" />`
                          : `<div style="height: 70px;"></div>`
                      }
                  </div>
                  <div class="official-name"><u>${escapeHtml(sig.officialName)}</u></div>
                  ${sig.officialNip ? `<div class="official-nip">NBM: ${escapeHtml(sig.officialNip)}</div>` : ''}
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
</body>
</html>
    `;
  }

  /**
   * Get letter data for frontend PDF generation
   * Returns structured data instead of generating PDF on server
   */
  getLetterData(data: LetterPrintData, baseUrl: string) {
    const {
      letterNumber,
      letterContent,
      letterhead,
      carbonCopy,
      attachments,
      signatures,
    } = data;

    // Process letter content with placeholders
    const processedContent = this.replacePlaceholders(letterContent, data);

    // Process signatures with full image paths
    const processedSignatures = signatures.map((sig) => {
      const isBase64 = sig.signature?.startsWith('data:image');
      const signatureSrc = sig.signature
        ? isBase64
          ? sig.signature
          : getImagePath(sig.signature, baseUrl)
        : '';

      return {
        ...sig,
        signature: signatureSrc,
      };
    });

    // Process letterhead with full image path
    const processedLetterhead = letterhead
      ? {
          ...letterhead,
          logo: letterhead.logo ? getImagePath(letterhead.logo, baseUrl) : '',
        }
      : null;

    return {
      letterNumber: letterNumber || 'Surat',
      letterContent: processedContent,
      letterhead: processedLetterhead,
      signatures: processedSignatures,
      carbonCopy,
      attachments,
    };
  }

  /**
   * Replace placeholders in template content
   * Supports:
   * - [attribute_name] from LetterAttributeSubmission
   * - [student.field] from Student data
   * - [letter.field] from Letter data
   */



  /**
   * Replace placeholders in template content
   * Supports:
   * - [attribute_name] from LetterAttributeSubmission
   * - [student.field] from Student data
   * - [letter.field] from Letter data
   */
  private replacePlaceholders(
    content: string,
    data: LetterPrintData,
  ): string {
    let processedContent = content;
    const { student, letter, letterAttributes, letterNumber } = data;

    // 1. Mapping Student
    Object.entries(this.studentMapping).forEach(([placeholder, path]) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      const value = getNestedValue(student, path);
      processedContent = processedContent.replace(
        regex,
        value ? String(value) : '',
      );
    });

    // 2. Mapping Letter
    Object.entries(this.letterMapping).forEach(([placeholder, path]) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      const value = getNestedValue(letter, path);
      processedContent = processedContent.replace(
        regex,
        value ? String(value) : '',
      );
    });

    // 3. Mapping Submission (nomor_surat & tanggal_surat)
    Object.entries(this.submissionMapping).forEach(([placeholder, path]) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      let value = '';

      const rawDate = (data as any).submission?.letterDate || new Date();

      if (path === 'letterNumber') {
        value = letterNumber || '';
      } else if (path === 'letterDate') {
        value = formatDate(rawDate);
      } else if (path === 'letterDateHijri') {
        value = formatHijriDate(rawDate);
      }

      processedContent = processedContent.replace(regex, value);
    });

    // 4. Mapping Atribut Dinamis
    letterAttributes?.forEach((attr) => {
      const regex = new RegExp(`\\[${attr.placeholder}\\]`, 'g');
      processedContent = processedContent.replace(regex, attr.content || '');
    });

    return processedContent;
  }


}
