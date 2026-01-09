document.addEventListener("DOMContentLoaded", () => {
  // إعدادات المتجر/المنتج
  const STORE = "صحراء | SAHRĀ";
  const PRODUCT_NAME = "هودي SAHRĀ";
  const PRICE = "199 د.ل";
  const PHONE = "905348818654"; // بدون +

  // عناصر الصفحة
  const cartCountEl = document.getElementById("cartCount");
  const sizeEl = document.getElementById("size");
  const colorEl = document.getElementById("color");
  const addBtn = document.getElementById("addToCart");
  const buyBtn = document.getElementById("buyNow");

  const modal = document.getElementById("modal");
  const mBody = document.getElementById("mBody");
  const closeModal = document.getElementById("closeModal");

  const yearEl = document.getElementById("year");
  const waLink = document.getElementById("waLink");

  // لو أي عنصر أساسي ناقص، وقف بدون ما يكسر الصفحة
  if (!cartCountEl || !sizeEl || !colorEl || !addBtn || !buyBtn) {
    console.error("Missing required elements. Check IDs in index.html");
    return;
  }

  // ===== Modal =====
  function openModal(text) {
    if (!modal || !mBody) return;
    mBody.textContent = text;
    modal.classList.add("show");
  }
  function hideModal() {
    if (!modal) return;
    modal.classList.remove("show");
  }

  if (closeModal) closeModal.addEventListener("click", hideModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

  // ===== Cart الحقيقي =====
  let cart = []; // [{name,size,color,qty}]

  function cartTotalQty() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function addToCartItem(size, color) {
    const found = cart.find(i => i.name === PRODUCT_NAME && i.size === size && i.color === color);
    if (found) found.qty += 1;
    else cart.push({ name: PRODUCT_NAME, size, color, qty: 1 });
  }

  // ===== WhatsApp =====
  function buildWhatsAppLink() {
    // لو السلة فاضية، يبعت الاختيار الحالي
    if (cart.length === 0) {
      const msg = encodeURIComponent(
        `سلام عليكم، نبي نطلب من ${STORE}\n` +
        `المنتج: ${PRODUCT_NAME}\n` +
        `المقاس: ${sizeEl.value}\n` +
        `اللون: ${colorEl.value}\n` +
        `السعر: ${PRICE}\n` +
        `التوصيل: جميع أنحاء ليبيا\n` +
        `الاستبدال: خلال 7 أيام`
      );
      return `https://wa.me/${PHONE}?text=${msg}`;
    }

    // لو في سلة، يبعت السلة كاملة
    const totalQty = cartTotalQty();
    const lines = cart.map((i, idx) =>
      `${idx + 1}) ${i.name} — مقاس: ${i.size} — لون: ${i.color} — الكمية: ${i.qty}`
    ).join("\n");

    const msg = encodeURIComponent(
      `سلام عليكم، نبي نطلب من ${STORE}\n\n` +
      `طلبية السلة (${totalQty} قطعة):\n` +
      `${lines}\n\n` +
      `السعر (للقطعة): ${PRICE}\n` +
      `التوصيل: جميع أنحاء ليبيا\n` +
      `الاستبدال: خلال 7 أيام`
    );

    return `https://wa.me/${PHONE}?text=${msg}`;
  }

  function refreshWaLink() {
    if (!waLink) return;
    waLink.href = buildWhatsAppLink();
  }

  sizeEl.addEventListener("change", refreshWaLink);
  colorEl.addEventListener("change", refreshWaLink);

  // ===== Buttons =====
  addBtn.addEventListener("click", () => {
    const size = sizeEl.value;
    const color = colorEl.value;

    addToCartItem(size, color);
    cartCountEl.textContent = cartTotalQty();
    refreshWaLink();

    openModal(`تمت الإضافة للسلة ✅\n${PRODUCT_NAME}\nالمقاس: ${size}\nاللون: ${color}`);
  });

  buyBtn.addEventListener("click", () => {
    window.open(buildWhatsAppLink(), "_blank");
  });

  // ===== Gallery thumbs =====
  const mainImg = document.getElementById("productImg");
  document.querySelectorAll(".thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".thumb").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (mainImg && btn.dataset.img) mainImg.src = btn.dataset.img;
    });
  });

  // ===== Footer year =====
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // أول تشغيل
  refreshWaLink();
});

// ===== IMAGE ZOOM (DESKTOP) =====
const imgBox = document.getElementById("imgZoom");
const img = document.getElementById("productImg");
const lens = document.getElementById("zoomLens");
const result = document.getElementById("zoomResult");

const zoomLevel = 2.2;

function updateZoomBackground(){
  if (!img || !result) return;
  const r = img.getBoundingClientRect();
  if (!r.width || !r.height) return;

  result.style.backgroundImage = `url('${img.src}')`;
  result.style.backgroundSize = `${r.width * zoomLevel}px ${r.height * zoomLevel}px`;
}

if (imgBox && img && lens && result) {
  imgBox.addEventListener("mouseenter", () => {
    updateZoomBackground();
    lens.style.display = "block";
    result.style.display = "block";
  });

  imgBox.addEventListener("mouseleave", () => {
    lens.style.display = "none";
    result.style.display = "none";
  });

  imgBox.addEventListener("mousemove", (e) => {
    const rect = img.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    const lw = lens.offsetWidth / 2;
    const lh = lens.offsetHeight / 2;

    let lensX = x - lw;
    let lensY = y - lh;

    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > rect.width - lens.offsetWidth) lensX = rect.width - lens.offsetWidth;
    if (lensY > rect.height - lens.offsetHeight) lensY = rect.height - lens.offsetHeight;

    lens.style.left = lensX + "px";
    lens.style.top = lensY + "px";

    const fx = (lensX / rect.width) * (rect.width * zoomLevel);
    const fy = (lensY / rect.height) * (rect.height * zoomLevel);

    result.style.backgroundPosition = `-${fx}px -${fy}px`;
  });

  img.addEventListener("load", updateZoomBackground);
  window.addEventListener("resize", updateZoomBackground);
}