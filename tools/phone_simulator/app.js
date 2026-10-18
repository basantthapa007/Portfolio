let isPowerOn = false;

function togglePower() {
  const screen = document.getElementById('phone-screen');
  isPowerOn = !isPowerOn;

  if (isPowerOn) {
    screen.classList.remove('power-off');
    screen.classList.add('booting');
    setTimeout(() => {
      screen.classList.remove('booting');
      screen.classList.add('lock-screen');
    }, 2000); // 2 second boot animation
  } else {
    screen.className = 'screen power-off'; // Turn off screen
  }
}
