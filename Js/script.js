// menu icon navbar
 let menuIcon = document.querySelector('#menu-icon');
 let navbar = document.querySelector('.navbar');

 menuIcon.onclick = () =>{
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
 };

// scroll sections active link
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () =>{
    sections.forEach(sec =>{
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height){
            navLinks.forEach(links =>{
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });
    
    
// stick navbar
    let header = document.querySelector('.header');   
    header.classList.toggle('sticky', window.scrollY > 100);

// remove menu icon navbar when click navbar link(scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

// swiper
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 50,
    loop: true,
    grabCursor: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

 // scroll Reveal
 ScrollReveal({ 
    // reset: true ,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img img, .services-container, .portfolio-box, .testimonial-wrapper, contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img img', { origin: 'left' });
ScrollReveal().reveal('.home-content h3, .home-content p, .about-content', { origin: 'right' });

// dark mode with local storage

let darkMode = localStorage.getItem("darkMode");
const darkModeToggle = document.querySelector("#darkMode-icon");


const enableDarkMode = () =>{
  document.body.classList.add("dark-mode");
  localStorage.setItem("darkMode", "enabled");
};

const disableDarkMode = () =>{
  document.body.classList.remove("dark-mode");
  localStorage.setItem("darkMode", null);
}

if(darkMode == "enabled"){
  enableDarkMode();
}

darkModeToggle.addEventListener("click", () =>{
  darkMode = localStorage.getItem("darkMode");
  if(darkMode != "enabled") {
    enableDarkMode();
    console.log(darkMode);
  }
  else
  {
    disableDarkMode();
    console.log(darkMode);
  }
});


//send email
var btn = document.getElementById("submit_btn");

btn.addEventListener('click', function(e){
  e.preventDefault();
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var mob = document.getElementById('mob').value;
  var sub = document.getElementById('sub').value;
  var message = document.getElementById('message').value;
  var body = 'This message is from your portfolio' + '<br/> Name: ' + name + '<br/> Email: ' + email + '<br/> Mobile Number: ' + mob +' <br/> Subject: ' + sub +' <br/> Message: ' + message;
  console.log(body);

  templateParams={name, email, mob, sub, message, body}

  emailjs.send("service_o76fstd", "template_ewxncsg", templateParams).then(function(message){
    statusMessage.textContent = "Thank you for your message! I will get back to you soon.";
    statusMessage.style.color = "green";
    document.getElementById("contactForm").reset();

    setTimeout(function() {
      statusMessage.textContent = "";
    }, 3000);
  }).catch(function(error) {
    statusMessage.textContent = "Oops! Something went wrong. Please try again later.";
    statusMessage.style.color = "red";
    document.getElementById("contactForm").reset();
    setTimeout(function() {
      statusMessage.textContent = "";
    }, 3000);
  });
    
});
