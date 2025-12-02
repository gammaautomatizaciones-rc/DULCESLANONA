// -----------------------------------
// VARIABLES GLOBALES
// -----------------------------------
let cart = [];
let allProducts = [];
let selectedBudin = null;
let selectedBase = null;
let selectedAgregados = [];
let selectedTarta = null;
let selectedSabor = null;
let selectedDeliveryDate = null;

// -----------------------------------
// REFERENCIAS DOM
// -----------------------------------
const menuContainer = document.getElementById("menu-container");
const loader = document.getElementById("loader");

// -----------------------------------
// INICIALIZACIÓN
// -----------------------------------
loadMenu();

// Mostrar modal de información después de que se cargue todo
window.addEventListener('load', function() {
  setTimeout(function() {
    showInfoModal();
  }, 1000); // Pequeño delay para que el usuario vea la página primero
});
