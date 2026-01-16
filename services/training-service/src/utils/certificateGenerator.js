const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CertificateGenerator {
    constructor() {
        this.certificatesDir = path.join(__dirname, '../../certificates');

        if (!fs.existsSync(this.certificatesDir)) {
            fs.mkdirSync(this.certificatesDir, { recursive: true });
        }
    }

    async generateCertificate(data) {
        const { userName, courseTitle, score, issueDate } = data;
        const certificateId = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
        const fileName = `${certificateId}.pdf`;
        const filePath = path.join(this.certificatesDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    layout: 'landscape',
                    margins: { top: 50, bottom: 50, left: 72, right: 72 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                const pageWidth = doc.page.width;
                const pageHeight = doc.page.height;

                doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
                    .lineWidth(3)
                    .stroke('#1e40af');

                doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
                    .lineWidth(1)
                    .stroke('#60a5fa');

                doc.fontSize(48)
                    .font('Helvetica-Bold')
                    .fillColor('#1e40af')
                    .text('CERTIFICATE', 0, 100, { align: 'center' });

                doc.fontSize(20)
                    .font('Helvetica')
                    .fillColor('#6b7280')
                    .text('OF COMPLETION', 0, 160, { align: 'center' });

                doc.fontSize(16)
                    .fillColor('#374151')
                    .text('This is to certify that', 0, 220, { align: 'center' });

                doc.fontSize(36)
                    .font('Helvetica-Bold')
                    .fillColor('#1f2937')
                    .text(userName, 0, 260, { align: 'center' });

                doc.fontSize(16)
                    .font('Helvetica')
                    .fillColor('#374151')
                    .text('has successfully completed the course', 0, 320, { align: 'center' });

                doc.fontSize(28)
                    .font('Helvetica-Bold')
                    .fillColor('#1e40af')
                    .text(courseTitle, 0, 360, { align: 'center', width: pageWidth - 144 });

                doc.fontSize(14)
                    .font('Helvetica')
                    .fillColor('#6b7280')
                    .text(`with a score of ${score}%`, 0, 420, { align: 'center' });

                const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                doc.fontSize(12)
                    .fillColor('#9ca3af')
                    .text(`Issue Date: ${formattedDate}`, 0, 480, { align: 'center' });

                doc.fontSize(10)
                    .fillColor('#d1d5db')
                    .text(`Certificate ID: ${certificateId}`, 0, 510, { align: 'center' });

                const signatureY = pageHeight - 120;
                doc.moveTo(150, signatureY)
                    .lineTo(300, signatureY)
                    .stroke('#9ca3af');

                doc.fontSize(10)
                    .fillColor('#6b7280')
                    .text('Authorized Signature', 150, signatureY + 10, { width: 150, align: 'center' });

                doc.moveTo(pageWidth - 300, signatureY)
                    .lineTo(pageWidth - 150, signatureY)
                    .stroke('#9ca3af');

                doc.fontSize(10)
                    .fillColor('#6b7280')
                    .text('HR ERP System', pageWidth - 300, signatureY + 10, { width: 150, align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve({
                        certificateId,
                        filePath: fileName,
                        fullPath: filePath
                    });
                });

                stream.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    getCertificatePath(fileName) {
        return path.join(this.certificatesDir, fileName);
    }
}

module.exports = new CertificateGenerator();
