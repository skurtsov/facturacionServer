const ejs = require('ejs');
const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path');

const imagePath = path.join(__dirname, 'src', 'logo.png');

// Пример данных
const subtotal = 175;
const vatRate = 21;
const iprf = (subtotal*0.07).toFixed(2); // Налог на прибыль (или другой процент)
const date = new Date().toLocaleDateString(); // Форматированная дата

const vatAmount = (subtotal * vatRate) / 100;
const total = subtotal + vatAmount - iprf;

const data = {
    invoiceNumber: 'INV-001',
    customerName: 'John Doe',
    customerAddress: '123 Main St, Anytown, USA',
    logoPath: imagePath,
    items: [
        { name: 'Product A', quantity: 2, price: 50, total: 100 },
        { name: 'Product B', quantity: 1, price: 1, total: 75 }
    ],
    subtotal: subtotal,
    vatRate: vatRate,
    vatAmount: vatAmount,
    total: total,
    date: date,
    iprf: iprf
};

// Путь к шаблону EJS
const templatePath = path.join(__dirname, 'templates', 'template.ejs');

// Рендеринг EJS-шаблона
ejs.renderFile(templatePath, data, {}, (err, html) => {
    if (err) {
        console.error('Error rendering EJS template:', err);
        return;
    }
    fs.writeFile('test.html', html, (err) => {
        if (err) {
            console.error('Error writing HTML file:', err);
            return;
        }
        console.log('HTML file created.');
    });

    // Создание PDF
    pdf.create(html).toFile('invoice.pdf', (err, res) => {
        if (err) {
            console.error('Error creating PDF:', err);
            return;
        }
        console.log('PDF created:', res.filename);
    });
});
