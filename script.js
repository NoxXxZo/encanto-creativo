// Scroll suave al hacer clic en el menú
document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  enlace.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({
      behavior: "smooth",
    });
  });
});
