const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");

const frameCount = 192;
const images = [];
let loadedImages = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* Load images */
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = `/static/frames/exgif-frame-${String(i).padStart(3, "0")}.png`;
  images.push(img);

  img.onload = () => {
    loadedImages++;
    if (loadedImages === frameCount) {
      render(0);
    }
  };
}

/* Draw frame */
function render(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images[index], 0, 0, canvas.width, canvas.height);
}

/* Scroll logic */
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.querySelector(".scroll-spacer").offsetHeight - window.innerHeight;

  const scrollFraction = scrollTop / maxScroll;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );

  render(frameIndex);
  updateText(frameIndex);
});

/* Hero text animation */
function updateText(frame) {
  const title = document.getElementById("heroTitle");
  const subtitle = document.getElementById("heroSubtitle");

  if (frame < 60) {
    title.textContent = "UnderKilometer";
    subtitle.textContent = "Find homes near your college";
  } else if (frame < 120) {
    title.textContent = "Verified Stays";
    subtitle.textContent = "Real reviews by real students";
  } else {
    title.textContent = "Smart Filters";
    subtitle.textContent = "Distance. Rent. Amenities.";
  }
}

/* Resize support */
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
