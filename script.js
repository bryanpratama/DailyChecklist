document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  const selects = document.querySelectorAll("select");
  const today = new Date().toLocaleDateString();
  const lastVisit = localStorage.getItem("lastVisit");

  // Fungsi untuk memperbarui waktu di atas halaman
  function updateTime() {
    const now = new Date();
    const timeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    document.getElementById("time").textContent = `Current Time: ${timeString}`;
  }
  setInterval(updateTime, 1000);

  // Reset checklist jika tanggal berbeda
  if (lastVisit !== today) {
    checkboxes.forEach((checkbox) => {
      localStorage.removeItem(checkbox.id);
      checkbox.checked = false;
    });
    selects.forEach((select) => {
      localStorage.removeItem(select.id);
      select.value = "belum dikerjakan";
    });
    localStorage.setItem("lastVisit", today);
  } else {
    checkboxes.forEach((checkbox) => {
      const isChecked = localStorage.getItem(checkbox.id) === "true";
      checkbox.checked = isChecked;
    });

    selects.forEach((select) => {
      const status = localStorage.getItem(select.id) || "belum dikerjakan";
      select.value = status;
    });
  }

  // Simpan status checklist ke Local Storage saat berubah
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      localStorage.setItem(checkbox.id, checkbox.checked);
    });
  });

  selects.forEach((select) => {
    select.addEventListener("change", () => {
      localStorage.setItem(select.id, select.value);
    });
  });
});

function openKeep() {
  // Deteksi perangkat
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
      // Jika perangkat adalah mobile, coba buka aplikasi
      window.location.href = "intent:#Intent;action=android.intent.action.MAIN;package=com.google.android.keep;end";
  } else {
      // Jika perangkat adalah desktop, buka tab baru
      window.open("https://keep.google.com/", "_blank");
  }
}