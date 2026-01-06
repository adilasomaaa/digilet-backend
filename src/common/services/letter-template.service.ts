import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

interface LetterPrintData {
  letterNumber?: string;
  recipientName: string;
  recipientInfo?: string[];
  letterContent: string;
  letterhead?: {
    logo?: string;
    header: string;
    subheader?: string;
    address?: string;
  };
  signatures: Array<{
    signature?: string;
    officialName: string;
    officialPosition: string;
    officialNip: string;
    position: string;
  }>;
}

@Injectable()
export class LetterTemplateService {
  generatePrintHtml(data: LetterPrintData, baseUrl: string): string {
    const { letterNumber, recipientName, recipientInfo, letterContent, letterhead, signatures } = data;

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
        ${letterhead ? `
        <div class="letterhead">
            ${letterhead.logo ? this.getImageTag(letterhead.logo, baseUrl, 'Logo') : ''}
            <h1>${this.escapeHtml(letterhead.header)}</h1>
            ${letterhead.subheader ? `<h2>${this.escapeHtml(letterhead.subheader)}</h2>` : ''}
            ${letterhead.address ? `<p>${this.escapeHtml(letterhead.address)}</p>` : ''}
        </div>
        ` : ''}
        
        <div class="letter-info">
            ${letterNumber ? `<p><strong>Nomor:</strong> ${this.escapeHtml(letterNumber)}</p>` : ''}
            <p><strong>Kepada Yth.</strong></p>
            <p><strong>${this.escapeHtml(recipientName)}</strong></p>
            ${recipientInfo ? recipientInfo.map(info => `<p>${this.escapeHtml(info)}</p>`).join('') : ''}
        </div>

        <div class="letter-content">
            ${letterContent}
        </div>

        <div class="signatures">
            ${signatures.map((sig) => {
              const signaturePath = sig.signature ? this.getImagePath(sig.signature, baseUrl) : '';
              const position = sig.position || 'right';
              const positionStyle = position === 'left' ? 'left' : position === 'center' ? 'center' : 'right';
              return `
                <div class="signature-block" style="text-align: ${positionStyle};">
                    ${signaturePath ? `<img src="${signaturePath}" alt="Signature" class="signature-image" />` : ''}
                    <div class="official-name">${this.escapeHtml(sig.officialName)}</div>
                    <div class="official-position">${this.escapeHtml(sig.officialPosition)}</div>
                    <div class="official-nip">NIP. ${this.escapeHtml(sig.officialNip)}</div>
                </div>
              `;
            }).join('')}
        </div>
    </div>

    <div class="print-button no-print">
        <button onclick="window.print()">Print Surat</button>
    </div>
</body>
</html>
    `;
  }

  private getImagePath(path: string, baseUrl: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    if (path.startsWith('/')) {
      return `${baseUrl}${path}`;
    }
    return `${baseUrl}/${path}`;
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
