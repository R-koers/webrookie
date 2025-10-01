// Minimal, shared notification system
(function () {
	function ensureContainer() {
		let container = document.getElementById('toast-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'toast-container';
			container.style.position = 'fixed';
			container.style.right = '16px';
			container.style.bottom = '16px';
			container.style.display = 'flex';
			container.style.flexDirection = 'column';
			container.style.gap = '8px';
			container.style.zIndex = '9999';
			document.body.appendChild(container);
		}
		return container;
	}

	function notify(message, type = 'success') {
		const container = ensureContainer();
		const toast = document.createElement('div');
		toast.textContent = message;
		toast.style.cursor = 'pointer';
		toast.style.padding = '10px 16px';
		toast.style.borderRadius = '8px';
		toast.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
		toast.style.color = '#fff';
		toast.style.fontSize = '14px';
		toast.style.opacity = '0';
		toast.style.transition = 'opacity 200ms ease-in-out, transform 200ms ease-in-out';
		toast.style.transform = 'translateY(8px)';
		toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#16a34a';
		container.appendChild(toast);
		// enter
		requestAnimationFrame(() => {
			toast.style.opacity = '1';
			toast.style.transform = 'translateY(0)';
		});
		// exit
		const remove = () => {
			toast.style.opacity = '0';
			toast.style.transform = 'translateY(8px)';
			setTimeout(() => {
				if (toast.parentNode) toast.parentNode.removeChild(toast);
			}, 220);
		};
		toast.addEventListener('click', remove);
		setTimeout(remove, 3500);
	}

	window.notify = notify;
})();


