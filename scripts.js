// Toggle navbar responsive
document.getElementById("menu-toggle").addEventListener("click", function () {
    document.getElementById("nav-links").classList.toggle("active");
  });
  
  // Slider otomatis
  let current = 0;
  const slides = document.querySelectorAll(".slide");
  
  function showNextSlide() {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }
  setInterval(showNextSlide, 3000);
  