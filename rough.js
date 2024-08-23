async function downloadReport() {
        const { jsPDF } = window.jspdf;

        // Show the loading overlay
        document.getElementById('loadingOverlay').style.display = 'flex';

        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Set standard font size
        pdf.setFontSize(12);

        // Convert the chart to an image
        const chartImage = document.getElementById('myBarChart').toDataURL('image/png');

        // Convert the marks breakdown to an image
        const breakdownElement = document.getElementById('breakdown');
        const breakdownCanvas = await html2canvas(breakdownElement, { scale: 2 });
        const breakdownImage = breakdownCanvas.toDataURL('image/png');

        // Function to add content with pagination support
        async function addContentWithPagination(element, pdf, yOffset = 10) {
            const canvas = await html2canvas(element, { scale: 2 });
            const imageData = canvas.toDataURL('image/png');
            const imageWidth = canvas.width;
            const imageHeight = canvas.height;

            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const imageWidthMM = pdfWidth - 20; // Width with margins
            const imageHeightMM = (imageHeight * imageWidthMM) / imageWidth; // Maintain aspect ratio

            const chunkHeight = pdfHeight - 20; // Adjust margins
            let position = yOffset;

            while (position < imageHeightMM) {
                pdf.addImage(imageData, 'PNG', 10, position, imageWidthMM, chunkHeight);
                position += chunkHeight;
                if (position < imageHeightMM) {
                    pdf.addPage();
                    position = 10;
                }
            }
        }

        // Add the chart image to the PDF
        const chartWidth = 190; // Adjust based on desired width
        const chartHeight = (chartWidth * 100) / 190; // Maintain aspect ratio
        pdf.addImage(chartImage, 'PNG', 10, 10, chartWidth, chartHeight);

        // Add the marks breakdown image to the same page if content is small
        const breakdownWidth = pdf.internal.pageSize.getWidth() - 20;
        const breakdownHeight = (breakdownCanvas.height * breakdownWidth) / breakdownCanvas.width;
        const spaceLeft = pdf.internal.pageSize.getHeight() - (chartHeight + 20);

        if (breakdownHeight <= spaceLeft) {
            pdf.addImage(breakdownImage, 'PNG', 10, chartHeight + 20, breakdownWidth, breakdownHeight);
        } else {
            pdf.addPage();
            pdf.addImage(breakdownImage, 'PNG', 10, 10, breakdownWidth, breakdownHeight);
        }

        // Add a new page for each question
        const questionContentDiv = document.getElementById('questiondiv');
        const questionChildren = questionContentDiv.children;
        for (let i = 0; i < questionChildren.length; i++) {
            const questionDiv = questionChildren[i];
            pdf.addPage();
            await addContentWithPagination(questionDiv, pdf);
        }

        // Save the PDF
        pdf.save('assessment-report.pdf');

        // Hide the loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';

        clearLocalStorage();
    }