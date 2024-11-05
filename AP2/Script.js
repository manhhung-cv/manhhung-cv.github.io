var vWelcome = document.getElementById("Welcome");
var contentArray = ['PROJECT', 'AP2', 'By'];
var contentArray2 = ['AP2', 'Log', 'Hunq'];
var currentIndex = 0;

function changeContent() {
  vWelcome.innerHTML = `<h1>${contentArray[currentIndex]} <b>${contentArray2[currentIndex]}</b></h1>`;
  currentIndex = (currentIndex + 1) % contentArray.length;
}

setTimeout(() => {
  vWelcome.style.opacity = 1;
  changeContent();
}, 2000);

// Thay đổi nội dung mỗi 2 giây
setInterval(() => {
  vWelcome.style.opacity = 0;
  setTimeout(() => {
    changeContent();
    vWelcome.style.opacity = 1;
  }, 1000);
}, 5000);

