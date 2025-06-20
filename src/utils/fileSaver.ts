export const savePdfToFile = (pdfBytes: Uint8Array, fileName: string = 'resume.pdf') =>
{
    const blob = new Blob([pdfBytes], {type: 'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}; 