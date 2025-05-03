window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);

    const tanggal = urlParams.get('tanggal') || "-";
    const waktu = urlParams.get('waktu') || "-";
    const bpm = urlParams.get('BPM') || "-";
    const sistole = urlParams.get('SISTOLE') || "-";
    const diastole = urlParams.get('DIASTOLE') || "-";

    // Menampilkan data pengukuran di halaman detail
    document.getElementById('tanggal').textContent = `Tanggal: ${tanggal}`;
    document.getElementById('waktu').textContent = `Waktu: ${waktu}`;
    document.getElementById('bpm').textContent = `BPM: ${bpm}`;
    document.getElementById('sistolik').textContent = `Sistolik: ${sistole}`;
    document.getElementById('diastolik').textContent = `Diastolik: ${diastole}`;
};
