import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function generateReceiptBuffer(receiptData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
      return reject(new Error('Roboto-Regular.ttf не найден по пути: ' + fontPath));
    }

    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    // Контент PDF
    doc.fontSize(20).text('ЧЕК ОБ ОПЛАТЕ', { align: 'center' }).moveDown();

    doc.fontSize(12);
    doc.text(`Номер чека: ${receiptData.receiptNumber}`);
    doc.text(`Дата и время: ${receiptData.paymentDate}`);
    doc.text(`Период оплаты: ${receiptData.selectedMonth}`);
    doc.text(`Способ оплаты: ${receiptData.paymentMethod}`);
    doc.moveDown();

    doc.fontSize(14).text('Услуги:', { underline: true });

    receiptData.selectedServices.forEach((service) => {
      doc.fontSize(12).text(`${service.name} — ${service.amount.toFixed(2)} руб.`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`ИТОГО: ${receiptData.totalAmount.toFixed(2)} руб.`);
    doc.fontSize(12).fillColor('green').text('СТАТУС: ОПЛАЧЕНО');
    doc.fillColor('black').moveDown().text('Спасибо за использование нашего сервиса!', { align: 'center' });

    doc.end();
  });
}
