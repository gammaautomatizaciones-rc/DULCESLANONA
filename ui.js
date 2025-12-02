// -----------------------------------
// FUNCIONES DE INTERFAZ DE USUARIO
// -----------------------------------

// -----------------------------------
// Smooth Scroll a Menú
// -----------------------------------
function scrollToMenu() {
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}

// -----------------------------------
// Render dinámico de productos
// -----------------------------------
function renderMenu(items) {
  menuContainer.innerHTML = "";

  // Filtrar productos personalizables (budines y tamaños de tartas)
  let personalizableItems = items.filter(item =>
    item.categoria &&
    item.categoria !== "Regla" &&
    item.categoria !== "Base" &&
    item.categoria !== "Agregado" &&
    item.categoria !== "Sabores"
  );

  if (personalizableItems.length === 0) {
    menuContainer.innerHTML = "<p>No se encontraron productos para mostrar. Verifica que el CSV tenga las categorías correctas.</p>";
    return;
  }

  personalizableItems.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Manejo de "destacado"
    const destacado =
      item.destacado &&
      (item.destacado.toLowerCase() === "si" ||
        item.destacado.toLowerCase() === "sí" ||
        item.destacado.toLowerCase() === "true");

    // Manejo de precio
    const precio = parseFloat(item.precio) || 0;
    const precioDisplay = precio > 0 ? `$${precio}` : "Desde $2.500";

    let buttonHTML = "";
    if (item.categoria === "Budín") {
      buttonHTML = `<button class="btn-add" onclick="openBudinModal('${item.nombre}')">Personalizar</button>`;
    } else if (item.categoria === "Tartas Clásicas" || item.categoria === "Tartas Especiales") {
      buttonHTML = `<button class="btn-add" onclick="openTartaModal('${item.nombre}', '${item.categoria}')">Elegir Sabor</button>`;
    }

    card.innerHTML = `
            ${destacado ? `<div class="badge">⭐ Destacado</div>` : ""}
            <img src="${item.imagen ? "img/" + item.imagen : "assets/logo.png"}" alt="${item.nombre}" loading="lazy" onerror="this.src='assets/logo.png'" />
            <h3>${item.nombre}</h3>
            <p>${item.descripcion || ""}</p>
            <p class="price">${precioDisplay}</p>
            ${buttonHTML}
        `;

    card.setAttribute("data-category", item.categoria);

    menuContainer.appendChild(card);
  });
}

// -----------------------------------
// Filtros por categoría
// -----------------------------------
function setupFilters(items) {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Activar botón
      document.querySelector(".filter-btn.active").classList.remove("active");
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      if (filter === "all") {
        renderMenu(items);
      } else if (filter === "Tartas") {
        // Mostrar tanto Tartas Clásicas como Tartas Especiales
        const filtrados = items.filter(
          (item) => item.categoria === "Tartas Clásicas" || item.categoria === "Tartas Especiales"
        );
        renderMenu(filtrados);
      } else {
        const filtrados = items.filter(
          (item) => item.categoria.toLowerCase() === filter.toLowerCase()
        );
        renderMenu(filtrados);
      }

      observeCards(); // reactivar animaciones
    });
  });
}

// -----------------------------------
// Animar cards con IntersectionObserver
// -----------------------------------
function observeCards() {
  const cards = document.querySelectorAll(".card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((card) => observer.observe(card));
}

// -----------------------------------
// FUNCIONES DEL CARRITO
// -----------------------------------

// Abrir modal para personalizar budín
function openBudinModal(budinName) {
  selectedBudin = allProducts.find(p => p.nombre === budinName);
  selectedBase = null;
  selectedAgregados = [];

  document.getElementById("modal-title").textContent = `Personalizar ${budinName}`;

  // Deshabilitar botón hasta seleccionar base
  document.getElementById("add-to-cart-btn").disabled = true;

  // Cargar bases
  const bases = allProducts.filter(p => p.categoria === "Base");
  const basesContainer = document.getElementById("bases-container");
  basesContainer.innerHTML = "";

  bases.forEach(base => {
    const baseOption = document.createElement("div");
    baseOption.className = "option-item";
    baseOption.onclick = (e) => selectBase(base, e);
    baseOption.innerHTML = `
      <h5>${base.nombre}</h5>
      <p>${base.descripcion || ""}</p>
    `;
    basesContainer.appendChild(baseOption);
  });

  // Cargar agregados
  const agregados = allProducts.filter(p => p.categoria === "Agregado");
  const agregadosContainer = document.getElementById("agregados-container");
  agregadosContainer.innerHTML = "";

  agregados.forEach(agregado => {
    const agregadoOption = document.createElement("div");
    agregadoOption.className = "option-item";
    agregadoOption.onclick = (e) => toggleAgregado(agregado, e);
    agregadoOption.innerHTML = `
      <h5>${agregado.nombre}</h5>
      <p>${agregado.descripcion || ""}</p>
    `;
    agregadosContainer.appendChild(agregadoOption);
  });

  document.getElementById("product-modal").classList.remove("hidden");
}

// Abrir modal para elegir sabor de tarta
function openTartaModal(tartaSize, tartaCategory) {
  selectedTarta = allProducts.find(p => p.nombre === tartaSize && p.categoria === tartaCategory);
  selectedSabor = null;

  document.getElementById("modal-title").textContent = `Elegir sabor para ${tartaSize}`;

  // Deshabilitar botón hasta seleccionar sabor
  document.getElementById("add-to-cart-btn").disabled = true;

  // Determinar qué sabores mostrar basado en la categoría
  const aplicaA = tartaCategory === "Tartas Clásicas" ? "tarta_clasica" : "tarta_especial";

  // Cargar sabores
  const sabores = allProducts.filter(p => p.categoria === "Sabores" && p.aplica_a === aplicaA);
  const basesContainer = document.getElementById("bases-container");
  basesContainer.innerHTML = "";

  sabores.forEach(sabor => {
    const saborOption = document.createElement("div");
    saborOption.className = "option-item";
    saborOption.onclick = (e) => selectSabor(sabor, e);
    saborOption.innerHTML = `
      <h5>${sabor.nombre}</h5>
      <p>${sabor.descripcion || ""}</p>
    `;
    basesContainer.appendChild(saborOption);
  });

  // Ocultar sección de agregados para tartas
  document.getElementById("agregados-section").style.display = "none";
  document.getElementById("bases-section").querySelector("h4").textContent = "Elige tu sabor";

  document.getElementById("product-modal").classList.remove("hidden");
}

// Seleccionar sabor para tarta
function selectSabor(sabor, event) {
  selectedSabor = sabor;

  // Actualizar UI
  document.querySelectorAll("#bases-container .option-item").forEach(item => {
    item.classList.remove("selected");
  });
  event.currentTarget.classList.add("selected");

  // Habilitar botón de agregar al carrito
  document.getElementById("add-to-cart-btn").disabled = false;
}

// Seleccionar base
function selectBase(base, event) {
  selectedBase = base;

  // Actualizar UI
  document.querySelectorAll("#bases-container .option-item").forEach(item => {
    item.classList.remove("selected");
  });
  event.currentTarget.classList.add("selected");

  // Habilitar botón de agregar al carrito
  document.getElementById("add-to-cart-btn").disabled = false;
}

// Toggle agregados
function toggleAgregado(agregado, event) {
  event.preventDefault();
  event.stopPropagation();

  const targetElement = event.target.closest('.option-item');
  const isCurrentlySelected = targetElement.classList.contains("selected");

  if (isCurrentlySelected) {
    // Está seleccionado, deseleccionar
    selectedAgregados.splice(selectedAgregados.findIndex(a => a.nombre === agregado.nombre), 1);
    targetElement.classList.remove("selected");
    targetElement.classList.add("force-deselected");
    targetElement.classList.remove("force-selected");
  } else {
    // No está seleccionado, seleccionar
    selectedAgregados.push(agregado);
    targetElement.classList.add("selected");
    targetElement.classList.add("force-selected");
    targetElement.classList.remove("force-deselected");
  }
}

// Agregar producto personalizado al carrito
function addToCart() {
  let cartItem;

  if (selectedBudin) {
    // Es un budín
    if (!selectedBase) {
      showToast("Por favor selecciona una base para tu budín");
      return;
    }

    cartItem = {
      budin: selectedBudin,
      base: selectedBase,
      agregados: [...selectedAgregados],
      quantity: 1,
      id: Date.now() // ID único
    };
  } else if (selectedTarta) {
    // Es una tarta
    if (!selectedSabor) {
      showToast("Por favor selecciona un sabor para tu tarta");
      return;
    }

    cartItem = {
      tarta: selectedTarta,
      sabor: selectedSabor,
      quantity: 1,
      id: Date.now() // ID único
    };
  } else {
    showToast("Error: no se seleccionó ningún producto");
    return;
  }

  cart.push(cartItem);
  updateCartCount();
  closeModal();

  // Mostrar mensaje de éxito
  showToast("¡Producto agregado al carrito!");
}

// Agregar productos directos al carrito (bases y agregados)
function addDirectToCart(productName) {
  const product = allProducts.find(p => p.nombre === productName);
  if (!product) return;

  const cartItem = {
    product: product,
    quantity: 1,
    id: Date.now()
  };

  cart.push(cartItem);
  updateCartCount();
  showToast("¡Producto agregado al carrito!");
}

// Mostrar/ocultar carrito
function toggleCart() {
  const cartModal = document.getElementById("cart-modal");
  const isHidden = cartModal.classList.contains("hidden");

  if (isHidden) {
    renderCart();
    cartModal.classList.remove("hidden");
  } else {
    cartModal.classList.add("hidden");
  }
}

// Actualizar contador del carrito
function updateCartCount() {
  const count = cart.length;
  document.getElementById("cart-count").textContent = count;

  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = count === 0;
}

// Renderizar contenido del carrito
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");

  if (cart.length === 0) {
    cartItems.innerHTML = "";
    cartEmpty.style.display = "block";
    return;
  }

  cartEmpty.style.display = "none";
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    const cartItemDiv = document.createElement("div");
    cartItemDiv.className = "cart-item";

    let itemName = "";
    let itemDescription = "";
    let priceBreakdown = "";

    if (item.budin) {
      // Item personalizado (budín)
      let basePrice = parseFloat(item.budin.precio) || 0;
      let additional = 0;
      if (item.agregados.length > 1) {
        additional = (item.agregados.length - 1) * 500;
      }
      let totalPrice = basePrice + additional;

      itemName = `${item.budin.nombre} - $${totalPrice}`;
      itemDescription = `Base: ${item.base.nombre}`;

      if (item.agregados.length > 0) {
        let agregadosText = item.agregados.map((a, idx) => {
          if (idx === 0) {
            return a.nombre;
          } else {
            return `${a.nombre} (+$500)`;
          }
        }).join(", ");
        itemDescription += `\nAgregados: ${agregadosText}`;

        if (item.agregados.length > 1) {
          priceBreakdown = `(Base: $${basePrice} + ${item.agregados.length - 1} × $500)`;
        }
      }
    } else if (item.tarta) {
      // Item personalizado (tarta)
      let price = parseFloat(item.tarta.precio) || 0;
      itemName = `${item.tarta.nombre} - $${price}`;
      itemDescription = `Sabor: ${item.sabor.nombre}`;
    } else {
      // Item directo
      let price = parseFloat(item.product.precio) || 0;
      itemName = `${item.product.nombre} - $${price}`;
      itemDescription = item.product.descripcion || "";
    }

    cartItemDiv.innerHTML = `
      <div class="cart-item-info">
        <h4>${itemName}</h4>
        <p>${itemDescription}</p>
        ${priceBreakdown ? `<p class="price-breakdown">${priceBreakdown}</p>` : ""}
      </div>
      <button class="btn-remove" onclick="removeFromCart(${index})">
        <i data-lucide="trash-2"></i>
      </button>
    `;

    cartItems.appendChild(cartItemDiv);
  });

  // Re-renderizar iconos
  lucide.createIcons();
}

// Remover item del carrito
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
  showToast("Producto removido del carrito");
}

// Checkout - enviar por WhatsApp
function checkout() {
  if (cart.length === 0) return;

  const message = generateWhatsAppMessage();
  const whatsappUrl = `https://wa.me/5493888604797?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Cerrar modal
function closeModal() {
  document.getElementById("product-modal").classList.add("hidden");

  // Resetear variables
  selectedBudin = null;
  selectedBase = null;
  selectedAgregados = [];
  selectedTarta = null;
  selectedSabor = null;

  // Mostrar sección de agregados nuevamente
  document.getElementById("agregados-section").style.display = "block";
  document.getElementById("bases-section").querySelector("h4").textContent = "Elige tu base";
}

// Mostrar toast de notificación
function showToast(message) {
  // Crear toast element si no existe
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// -----------------------------------
// FUNCIONES DEL MODAL DE INFORMACIÓN
// -----------------------------------

// Mostrar modal de información al cargar la página
function showInfoModal() {
  document.getElementById("info-modal").classList.remove("hidden");
}

// Cerrar modal de información
function closeInfoModal() {
  document.getElementById("info-modal").classList.add("hidden");
}

// -----------------------------------
// FUNCIONES DEL MODAL DE FECHA
// -----------------------------------

// Mostrar selector de fecha
function showDateSelector() {
  // Cerrar modal del carrito primero
  document.getElementById("cart-modal").classList.add("hidden");

  // Configurar el input de fecha
  setupDateInput();

  // Mostrar modal de fecha
  document.getElementById("date-modal").classList.remove("hidden");
}

// Configurar restricciones del input de fecha
function setupDateInput() {
  const dateInput = document.getElementById("delivery-date");
  const confirmBtn = document.getElementById("confirm-date-btn");

  // Calcular fechas límite
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 3); // Mínimo 3 días

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 21); // Máximo 3 semanas (21 días)

  // Formatear fechas para input date (YYYY-MM-DD)
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Establecer límites
  dateInput.min = formatDate(minDate);
  dateInput.max = formatDate(maxDate);

  // Resetear valor y estado del botón
  dateInput.value = "";
  confirmBtn.disabled = true;
  selectedDeliveryDate = null;

  // Event listener para validar fecha seleccionada
  dateInput.addEventListener('change', function() {
    const selectedDate = new Date(this.value);
    const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

    // Validar que sea día hábil (lunes a sábado)
    if (dayOfWeek === 0) { // Domingo no permitido
      showToast("Lo sentimos, no entregamos los domingos. Por favor selecciona otro día.");
      this.value = "";
      confirmBtn.disabled = true;
      selectedDeliveryDate = null;
    } else {
      selectedDeliveryDate = this.value;
      confirmBtn.disabled = false;
    }
  });
}

// Cerrar modal de fecha
function closeDateModal() {
  document.getElementById("date-modal").classList.add("hidden");
  // NO resetear fecha seleccionada aquí porque se usa en confirmOrder
}

// Confirmar pedido y enviar por WhatsApp
function confirmOrder() {
  if (!selectedDeliveryDate) {
    showToast("Por favor selecciona una fecha de entrega");
    return;
  }

  // Cerrar modal de fecha
  closeDateModal();

  // Generar y enviar mensaje por WhatsApp
  const message = generateWhatsAppMessage();
  const whatsappUrl = `https://wa.me/5493888604797?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  // Mostrar confirmación
  showToast("¡Pedido enviado! Te contactaremos pronto.");

  // Limpiar carrito y fecha después del envío
  cart = [];
  selectedDeliveryDate = null;
  updateCartCount();
}
