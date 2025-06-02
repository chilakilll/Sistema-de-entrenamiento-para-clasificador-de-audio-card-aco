document.addEventListener('DOMContentLoaded', () => {
const wrapper = document.querySelector('.wrapper');
const accederLink = document.querySelector('.acceder-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnAcceder-popup');
const iconClose = document.querySelector('.icon-close');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#signup-form');

 // Referencia al contenedor del menú de usuario
  let perfilMenu;

registerLink.addEventListener('click', () => {
  wrapper.classList.add('active');
});

accederLink.addEventListener('click', () => {
  wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
  wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

// Registro de usuario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = registerForm.querySelector('input[type="text"]').value;
  const email = registerForm.querySelector('input[type="email"]').value;
  const password = registerForm.querySelector('input[type="password"]').value;
  const aceptarTerminos = registerForm.querySelector('input[type="checkbox"]').checked;

  if (!aceptarTerminos) {
    alert('Debes aceptar los términos y condiciones');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, aceptarTerminos })
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (data.success) {
      alert('Registro exitoso');
      wrapper.classList.remove('active');
    } else {
      alert('Hubo un error al registrar el usuario');
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    alert('Error al registrar. Por favor inténtelo de nuevo.');
  }
});

// Inicio de sesión
loginForm.addEventListener('submit', async (e) => {
  console.log('Form submitted!');
  e.preventDefault();

  const email = loginForm.querySelector('input[type="email"]').value;
  console.log('Email:', email);
  const password = loginForm.querySelector('input[type="password"]').value;
  console.log('Password:', password);
  const rememberMe = loginForm.querySelector('#remember-me').checked;

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log('Response:', res);

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (data.success) {
      alert('Inicio de sesión exitoso');
      // Cambiar el texto del botón
  btnPopup.textContent = 'Cuenta';

  // Opcional: guarda un indicador en localStorage (si quieres recordar el estado de sesión)
  localStorage.setItem('sesionIniciada', 'true');
      // Limpia el formulario de inicio de sesión
      loginForm.reset();
      // Si el usuario quiere ser recordado, guarda su email en localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }
      // Redirigir o hacer algo después de logearse
    } else {
      alert('Usuario no registrado o datos incorrectos. Por favor regístrate.');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('Error al iniciar sesión. Por favor inténtelo de nuevo.');
  }
});

// Autocompletar email si está guardado en localStorage
window.addEventListener('DOMContentLoaded', () => {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.querySelector('#login-form input[type="email"]').value = rememberedEmail;
  }
});
});
// Al cargar la página, verifica si la sesión está iniciada
const sesionIniciada = localStorage.getItem('sesionIniciada');
if (sesionIniciada === 'true') {
  btnPopup.textContent = 'Cuenta';
}
