document.getElementById('convertForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const url = document.getElementById('url').value;

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to convert video');
        }

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'audio.mp3';
        link.click();
        document.getElementById('result').textContent = 'Download started!';
    } catch (error) {
        document.getElementById('result').textContent = `Error: ${error.message}`;
    }
});
