import jsPDF from 'jspdf';
import '../fonts/Roboto-Regular-normal';

interface Service {
  id: string;
  name: string;
  amount: number;
}

interface ReceiptData {
  userId: string;
  selectedMonth: string;
  selectedServices: Service[];
  totalAmount: number;
  paymentMethod: string;
  paymentDate: string;
  receiptNumber: string;
}

export const generateAndDownloadReceipt = (receiptData: ReceiptData) => {
  try {
    const doc = new jsPDF();
    
    doc.setFont('Roboto-Regular');
    
    doc.setFontSize(20);
    doc.text('ЧЕК ОБ ОПЛАТЕ', 105, 30, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    let yPos = 50;

    doc.text(`Номер чека: ${receiptData.receiptNumber}`, 20, yPos);
    yPos += 10;
    doc.text(`Дата и время: ${receiptData.paymentDate}`, 20, yPos);
    yPos += 10;
    doc.text(`Период оплаты: ${receiptData.selectedMonth}`, 20, yPos);
    yPos += 10;
    doc.text(`Способ оплаты: ${receiptData.paymentMethod}`, 20, yPos);
    yPos += 20;

    doc.setFontSize(14);
    doc.text('УСЛУГИ:', 20, yPos);
    yPos += 10;

    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;

    doc.setFontSize(10);
    doc.text('Наименование услуги', 20, yPos);
    doc.text('Сумма', 150, yPos);
    yPos += 10;
    doc.line(20, yPos - 5, 190, yPos - 5);

    doc.setFontSize(10);
    receiptData.selectedServices.forEach(service => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      const serviceName = service.name.length > 50 
        ? service.name.substring(0, 50) + '...' 
        : service.name;

      doc.text(serviceName, 20, yPos);
      doc.text(`${service.amount.toFixed(2)} руб.`, 150, yPos);
      yPos += 8;
    });

    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(14);
    doc.text(`ИТОГО К ОПЛАТЕ: ${receiptData.totalAmount.toFixed(2)} руб.`, 20, yPos);

    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0);
    doc.text('СТАТУС: ОПЛАЧЕНО', 20, yPos);

    doc.setTextColor(0, 0, 0);
    yPos += 20;

    doc.setFontSize(10);
    doc.text('Спасибо за использование нашего сервиса!', 105, yPos, { align: 'center' });

    const cleanMonth = receiptData.selectedMonth.replace(/\s+/g, '_');
    const fileName = `chek_${receiptData.receiptNumber}_${cleanMonth}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error('Ошибка при генерации чека:', error);
    throw error;
  }
};
