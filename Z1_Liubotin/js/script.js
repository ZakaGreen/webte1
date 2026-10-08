// Enable the mobile menu; links remain visible if JavaScript is disabled.
const navigation = document.querySelector('.site-nav');
const menuButton = document.querySelector('.menu-toggle');
const navList = document.querySelector('#nav-list');

navigation.classList.add('menu-ready');
menuButton.hidden = false;

menuButton.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', isOpen);
});
