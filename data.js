// -----------------------------------
// FUNCIONES DE DATOS Y CSV
// -----------------------------------

// URL del CSV (Google Sheet publicado)
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFrIKFQyQ3rLiGF5gdfocs8liE5FoFfY40R_etZmN8abtl9sDrJHWWu73K-5ySjZ5pid7w1_9wDyrW/pub?output=csv";

// -----------------------------------
// Fetch + Parse del CSV
// -----------------------------------
function loadMenu() {
  loader.classList.remove("hidden");

  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    complete: (results) => {
      // Filtrar items válidos y excluir categoría "Regla"
      allProducts = results.data.filter(
        (row) => row.nombre && row.categoria && row.nombre.trim() !== "" && row.categoria.toLowerCase() !== "regla"
      );

      renderMenu(allProducts);
      setupFilters(allProducts);
      observeCards();
      loader.classList.add("hidden");
    },
    error: (error) => {
      console.error("Error loading CSV:", error);
      loader.innerText = `Error cargando menú. Verifica que tu Google Sheet esté publicado correctamente.`;
    },
  });
}

// Generar mensaje para WhatsApp
function generateWhatsAppMessage() {
  let totalGeneral = 0;

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  let message = "_______________________\n";
  message += "DETALLE DEL PEDIDO\n";
  message += "_______________________\n\n";

  // Agregar fecha de entrega
  if (selectedDeliveryDate) {
    const formattedDate = formatDisplayDate(selectedDeliveryDate);
    message += `📅 FECHA DE ENTREGA: ${formattedDate}\n\n`;
  }

  message += "PODES ABONAR A ESTE CVU:\n";
  message += "CVU : 4530000800014429630591\n";
  message += "ALIAS: Dulceslanona24\n";
  message += "TITULAR: Abigail Sajama\n\n";

  cart.forEach((item, index) => {
    let pedidoNum = index + 1;
    message += `PEDIDO ${pedidoNum}\n`;

    if (item.budin) {
      let basePrice = parseFloat(item.budin.precio) || 0;
      let additional = 0;
      let agregadosCount = item.agregados.length;

      if (agregadosCount > 1) {
        additional = (agregadosCount - 1) * 500;
      }
      let totalPrice = basePrice + additional;

      message += `${item.budin.nombre}\n`;
      message += `BASE: ${item.base.nombre}\n`;

      // Listar agregados numerados
      item.agregados.forEach((agregado, idx) => {
        message += `AGREGADO ${idx + 1}: ${agregado.nombre}\n`;
      });

      let adicionalTexto = "";
      if (agregadosCount > 1) {
        let montoAdicional = (agregadosCount - 1) * 500;
        adicionalTexto = ` (+$${montoAdicional})`;
      }
      message += `TOTAL AGREGADOS: ${agregadosCount}${adicionalTexto}\n`;
      message += `SUBTOTAL: $${totalPrice}\n\n`;

      totalGeneral += totalPrice;
    } else if (item.tarta) {
      // Es una tarta
      let price = parseFloat(item.tarta.precio) || 0;

      message += `${item.tarta.nombre}\n`;
      message += `SABOR: ${item.sabor.nombre}\n`;
      message += `SUBTOTAL: $${price}\n\n`;

      totalGeneral += price;
    } else {
      // Item directo
      let price = parseFloat(item.product.precio) || 0;
      message += `${item.product.nombre}\n`;
      message += `SUBTOTAL: $${price}\n\n`;

      totalGeneral += price;
    }
  });

  message += `TOTAL: $${totalGeneral}\n\n`;

  // Calcular seña del 50%
  const senia = Math.ceil(totalGeneral * 0.5); // Redondear hacia arriba
  message += `💰 SEÑA REQUERIDA: $${senia} (50% del total)\n`;
  message += `⚠️ El pedido se confirma únicamente al recibir el comprobante de pago de la seña.`;

  return message;
}
