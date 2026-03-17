const fs = require("fs");
const PDFDocument = require("pdfkit");

// Convert JSON array to CSV string
const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    // extract keys (columns)
    const keys = Object.keys(data[0]._doc || data[0]);

    // header row
    const header = keys.join(",");

    // data rows
    const rows = data.map((item) => {
        const obj = item._doc || item;

        return keys
            .map((key) => {
                let value = obj[key];

                // handle undefined/null
                if (value === undefined || value === null) return "";

                // convert objects/arrays to string
                if (typeof value === "object") {
                    value = JSON.stringify(value);
                }

                // escape commas
                return `"${value}"`;
            })
            .join(",");
    });

    return [header, ...rows].join("\n");
};

// Write CSV to file
const generateCSV = (data, filePath) => {
    const csv = convertToCSV(data);
    fs.writeFileSync(filePath, csv);
};

// Generate a professional PDF report
// Note: This function is asynchronous in nature because it pipes to a stream, 
// but we end the document immediately. For production, you might want to wrap this in a Promise.
const generatePDF = (reportData, filePath, title = "Platform Report") => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).text("WasteZero Platform - Official Report", { align: "center" });
            doc.moveDown(0.5);
            doc.fontSize(16).text(title, { align: "center" });
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
            doc.moveDown();

            // Horizontal line
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Content logic
            if (Array.isArray(reportData)) {
                // List structure for logs
                reportData.forEach((item, index) => {
                    const obj = item._doc || item;
                    doc.fontSize(11).fillColor("#2563eb").text(`Entry #${index + 1}`);
                    doc.fillColor("#000000");

                    Object.keys(obj).forEach(key => {
                        if (key !== "__v" && key !== "_id") {
                            doc.fontSize(10).text(`${key}: ${JSON.stringify(obj[key])}`);
                        }
                    });
                    doc.moveDown(0.5);

                    if (doc.y > 700) doc.addPage();
                });
            } else {
                // Summary structure for statistics
                Object.keys(reportData).forEach(section => {
                    doc.fontSize(14).fillColor("#059669").text(section.toUpperCase(), { underline: true });
                    doc.fillColor("#000000");

                    const details = reportData[section];
                    Object.keys(details).forEach(key => {
                        doc.fontSize(11).text(`• ${key}: ${details[key]}`);
                    });
                    doc.moveDown();
                });
            }

            // Footer
            doc.fontSize(8).text("Internal Use Only - WasteZero Ecosystem", 50, 750, { align: "center" });

            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateCSV, generatePDF };