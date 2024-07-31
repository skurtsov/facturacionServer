const express = require('express');
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors')
const app = express();
const port = 3001;

const templatePath = path.join(__dirname, 'templates', 'template.ejs');
const imagePath = path.join(__dirname, 'src', 'logo.png');

// Настройка body-parser для получения данных из POST-запросов
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
// Обработка POST-запроса для создания фактуры
app.post('/generate-invoice', (req, res) => {
    const {
        invoiceNumber,
        customerName,
        customerAddress,
        items,
        subtotal,
        vatRate,
        iprfRate
    } = req.body;

   

    const iprf = iprfRate; // Налог на прибыль (или другой процент)
    const date = new Date().toLocaleDateString(); // Форматированная дата

    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount - iprf;

    const data = {
        invoiceNumber,
        customerName,
        customerAddress,
        logoPath: imagePath,
        items,
        subtotal,
        vatRate,
        vatAmount,
        total,
        date,
        iprf
    };

    // Рендеринг EJS-шаблона
    ejs.renderFile(templatePath, data, {}, (err, html) => {
        if (err) {
            console.error('Error rendering EJS template:', err);
            return res.status(500).send('Error rendering EJS template');
        }

        // Создание PDF
        pdf.create(html).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error creating PDF:', err);
                return res.status(500).send('Error creating PDF');
            }

            // Убедимся, что директория для хранения файлов существует
            const invoicesDir = path.join(__dirname, 'invoices');
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir);
            }

            const filePath = path.join(invoicesDir, 'invoice.pdf');

            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    console.error('Error writing PDF file:', err);
                    return res.status(500).send('Error writing PDF file');
                }

                res.download(filePath, 'invoice.pdf', (err) => {
                    if (err) {
                        console.error('Error sending PDF file:', err);
                        res.status(500).send('Error sending PDF file');
                    }
                });
            });
        });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
