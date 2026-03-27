export function downloadCsv(filename, csvString) {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function escapeCsv(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const mustQuote = /[",\n\r]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return mustQuote ? `"${escaped}"` : escaped;
}

/**
 * rows: array of objects
 * columns: [{ key, label }]
 */
export function buildCsv(rows, columns) {
    const header = columns.map((c) => escapeCsv(c.label ?? c.key)).join(',');
    const lines = rows.map((row) =>
        columns.map((c) => escapeCsv(row?.[c.key])).join(',')
    );
    return [header, ...lines].join('\n');
}

export function exportRowsToCsv({ filename, rows, columns }) {
    const csv = buildCsv(rows, columns);
    downloadCsv(filename, csv);
}

