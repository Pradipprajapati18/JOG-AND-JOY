export const flyToCart = (event, imageUrl) => {
  if (!event || !imageUrl) return;
  try {
    const startRect = event.currentTarget.getBoundingClientRect();
    const desktopCart = document.getElementById('cart-icon-desktop');
    const mobileCart = document.getElementById('cart-icon-mobile');
    
    let targetEl = desktopCart;
    if (mobileCart && window.innerWidth < 768) {
       targetEl = mobileCart;
    }

    if (!targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.position = 'fixed';
    img.style.zIndex = '99999';
    img.style.left = `${startRect.left}px`;
    img.style.top = `${startRect.top}px`;
    img.style.width = `${startRect.width || 50}px`;
    img.style.height = `${startRect.height || 50}px`;
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    img.style.pointerEvents = 'none';
    img.style.transition = 'all 0.7s cubic-bezier(0.2, 1, 0.3, 1)';
    
    document.body.appendChild(img);

    // Trigger reflow
    img.getBoundingClientRect();

    img.style.left = `${targetRect.left + targetRect.width / 2 - 15}px`;
    img.style.top = `${targetRect.top + targetRect.height / 2 - 15}px`;
    img.style.width = '30px';
    img.style.height = '30px';
    img.style.opacity = '0.1';

    setTimeout(() => {
      if (document.body.contains(img)) document.body.removeChild(img);
      targetEl.style.transition = 'transform 0.2s ease-out';
      targetEl.style.transform = 'scale(1.2)';
      setTimeout(() => targetEl.style.transform = 'scale(1)', 200);
    }, 700);
  } catch (e) {
    console.warn("Fly animation failed", e);
  }
};
