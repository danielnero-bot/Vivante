function openLocation(address = "13 Timothy Lane Rumuola, Port Harcourt, Rivers State") {
    const formattedAddress = address.replace(/ /g, '+');
  window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
}
function showMenu() {
  const secondNav = document.querySelector('.second-nav');
  const button = document.querySelector('#menu-btn>i');
  if (secondNav) {
    const isHidden = secondNav.style.display === 'none' || getComputedStyle(secondNav).display === 'none';
    button.classList.toggle('fa-bars', !isHidden);
    button.classList.toggle('fa-xmark', isHidden);
    secondNav.style.display = isHidden ? 'block' : 'none';
  }
  
}