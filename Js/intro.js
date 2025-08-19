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

  // Dark light mode
//   let darkModeIcon = document.querySelector('#darkMode-icon');

//   darkModeIcon.onclick = () =>{
//     darkModeIcon.classList.toggle('bx-sun');
//     document.body.classList.toggle('dark-mode');
//   }

// scroll Reveal
ScrollReveal({ 
    // reset: true ,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.heading-content h2, #css_container, .skills h3, .timeline h3', { origin: 'top' });
ScrollReveal().reveal('.heading-content p,  #html_container,  #javascript_container, iframe', { origin: 'bottom' });
ScrollReveal().reveal('#cpp_container', { origin: 'left' });
ScrollReveal().reveal('#sql_container, .home-content p, .about-content', { origin: 'right' });



// skill round animation when visible.

const round_start =(hidden_class, cont_class, className, percent, time, flag)=>{

    const observer = new IntersectionObserver((entries) =>{
        entries.forEach((entry) =>{
            
            console.log(entry)
            if(entry.isIntersecting)
            {
                entry.target.classList.add(cont_class);
                
                let num =  document.getElementsByClassName(className);
                
                if(flag == false)
                {   
                    flag = true;
                    
                    for(let i=0; i<num.length; i++)
                    {
                        let counter = 0;
                        setInterval(()=>{
                            if(counter == percent)
                            clearInterval();
                            else
                            {
                                counter +=1;
                                num[i].innerHTML = counter + "%";
                            }
                        },time);
                    }
                }
            }
        })
    })

const cpp_id = document.querySelectorAll(hidden_class);
cpp_id.forEach((el) => observer.observe(el));
}

let percent = [80, 80, 60, 80, 80];
let time =[24, 24, 34, 24, 24];
let flags =[false, false, false, false, false];
let names = ['cpp_number', 'html_number', 'css_number', 'js_number', 'sql_number']
let container = ['cpp_container', 'html_container', 'css_container', 'javascript_container', 'sql_container']
let hidden = ['.cpp_hidden', '.html_hidden', '.css_hidden', '.js_hidden', '.sql_hidden']

for(let i=0; i<time.length; i++)
{
    round_start(hidden[i], container[i], names[i], percent[i], time[i], flags[i]); 
}



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