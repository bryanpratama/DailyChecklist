document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll("input[type=checkbox]");
    const today = new Date().toLocaleDateString(); // Dapatkan tanggal hari ini dalam format lokal
    const lastVisit = localStorage.getItem("lastVisit"); // Ambil tanggal terakhir dari Local Storage
  
    // Jika tanggal terakhir berbeda dengan hari ini, reset checklist
    if (lastVisit !== today) {
      checkboxes.forEach((checkbox) => {
        localStorage.removeItem(checkbox.id); // Hapus status checklist dari Local Storage
        checkbox.checked = false; // Reset checklist ke tidak dicentang
      });
      localStorage.setItem("lastVisit", today); // Perbarui tanggal terakhir
    } else {
      // Jika tanggal sama, muat status checklist dari Local Storage
      checkboxes.forEach((checkbox) => {
        const isChecked = localStorage.getItem(checkbox.id) === "true";
        checkbox.checked = isChecked;
      });
    }
  
    // Simpan status checklist ke Local Storage saat berubah
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        localStorage.setItem(checkbox.id, checkbox.checked);
      });
    });
  });
  