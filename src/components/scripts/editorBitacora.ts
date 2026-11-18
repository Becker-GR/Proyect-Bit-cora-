// Listas Desplegables
const allDropdown = document.querySelectorAll<HTMLDetailsElement>('.custom-dropdown');

allDropdown.forEach((dropdown) => {
	const label = dropdown.querySelector('.dropdown-label');
	const options = dropdown?.querySelectorAll('.dropdown-option');

	options?.forEach((btn) => {
		btn.addEventListener('click', () => {
			const valor = btn.getAttribute('data-value') || btn.textContent?.trim() || '';
			dropdown.dataset.value = valor;

			if (label && btn.textContent) {
				label.textContent = btn.textContent.trim();
				label.classList.remove('text-slate-300', 'text-slate-400', 'font-medium');
				label.classList.add('text-teal-300', 'font-medium');
			}
			dropdown.removeAttribute('open');
		});
	});
});

document.addEventListener('click', (e) => {
	if (e.target instanceof Node) {
		allDropdown.forEach((dropdown) => {
			if (!dropdown.contains(e.target as Node)) {
				dropdown.removeAttribute('open');
			}
		});
	}
});

// Control de Notificaciones Snackbar
const mostrarSnackbar = (mensaje: string, tipo: 'exito' | 'editado' | 'error' = 'exito') => {
	window.dispatchEvent(
		new CustomEvent('mostrar-snackbar', {
			detail: { mensaje, tipo },
		})
	);
};

// Control de Confirmación de Eliminación
const confirmarBorrado = document.getElementById('confirmar-borrado');
const confirmarBorradoContenido = document.getElementById('confirmar-borrado-contenido');
const btnCancelarBorrado = document.getElementById('btn-cancelar-borrado');
const btnConfirmarBorrado = document.getElementById('btn-confirmar-borrado');
let tarjetaAEliminar: HTMLElement | null = null;

const abrirConfirmacionBorrado = (tarjeta: HTMLElement) => {
	tarjetaAEliminar?.classList.remove('ring-2', 'ring-rose-400/70');
	tarjetaAEliminar = tarjeta;
	tarjetaAEliminar.classList.add('ring-2', 'ring-rose-400/70');

	confirmarBorrado?.classList.remove('opacity-0', 'pointer-events-none');
	confirmarBorrado?.classList.add('opacity-100');
	confirmarBorradoContenido?.classList.remove('scale-95');
	confirmarBorradoContenido?.classList.add('scale-100');
};

const cerrarConfirmacionBorrado = () => {
	tarjetaAEliminar?.classList.remove('ring-2', 'ring-rose-400/70');
	tarjetaAEliminar = null;

	confirmarBorrado?.classList.remove('opacity-100');
	confirmarBorrado?.classList.add('opacity-0', 'pointer-events-none');
	confirmarBorradoContenido?.classList.remove('scale-100');
	confirmarBorradoContenido?.classList.add('scale-95');
};

confirmarBorrado?.addEventListener('click', (e) => {
	if (e.target === confirmarBorrado) cerrarConfirmacionBorrado();
});

btnCancelarBorrado?.addEventListener('click', cerrarConfirmacionBorrado);

btnConfirmarBorrado?.addEventListener('click', () => {
	if (!tarjetaAEliminar) return;

	if (tarjetaAEliminar === tarjetaEnEdicion) {
		cerrarModal();
	}

	tarjetaAEliminar.remove();
	cerrarConfirmacionBorrado();
	window.dispatchEvent(new CustomEvent('actualizar-metricas'));
	mostrarSnackbar('Tarjeta eliminada correctamente.', 'exito');
});

// Control del Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalContenido = document.getElementById('modal-contenido');
const modalTitulo = document.getElementById('modal-titulo');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const formEditor = document.getElementById('form-editor') as HTMLFormElement | null;

const btnNuevo = document.getElementById('btn-nuevo');
const btnConfirmar = document.getElementById('btn-confirmar');
const contenedor = document.getElementById('contenedor-registros');
let tarjetaEnEdicion: HTMLElement | null = null;

const abrirModal = (titulo = 'Registro de Mantenimiento') => {
	if (modalTitulo) modalTitulo.textContent = titulo;
	modalOverlay?.classList.remove('opacity-0', 'pointer-events-none');
	modalOverlay?.classList.add('opacity-100');
	modalContenido?.classList.remove('scale-95');
	modalContenido?.classList.add('scale-100');

	const primerInput = formEditor?.querySelector('input');
	setTimeout(() => primerInput?.focus(), 150);
};

const cerrarModal = () => {
	modalOverlay?.classList.remove('opacity-100');
	modalOverlay?.classList.add('opacity-0', 'pointer-events-none');
	modalContenido?.classList.remove('scale-100');
	modalContenido?.classList.add('scale-95');
	resetEditor();
};

const resetEditor = () => {
	tarjetaEnEdicion = null;

	formEditor?.querySelectorAll('input').forEach((input) => (input.value = ''));

	allDropdown.forEach((dd) => {
		delete dd.dataset.value;
		dd.removeAttribute('open');
		const label = dd.querySelector('.dropdown-label');
		if (label && dd.dataset.placeholder) {
			label.textContent = dd.dataset.placeholder;
			label.classList.remove('text-teal-300', 'font-medium');
			label.classList.add('text-slate-300');
		}
	});
};

// Helper para asignar valor a dropdowns personalizados
const setDropdownVal = (field: string, valor: string) => {
	const dd = document.querySelector<HTMLDetailsElement>(`.custom-dropdown[data-field="${field}"]`);
	if (!dd) return;
	dd.dataset.value = valor;
	const label = dd.querySelector('.dropdown-label');
	if (label) {
		label.textContent = valor;
		label.classList.remove('text-slate-300', 'text-slate-400');
		label.classList.add('text-teal-300', 'font-medium');
	}
};

// Eventos de apertura / cierre
btnNuevo?.addEventListener('click', () => {
	resetEditor();
	abrirModal('Nuevo Registro');
});

btnCancelarModal?.addEventListener('click', cerrarModal);

// Cerrar al hacer clic en el fondo borroso (fuera de la tarjeta modal)
modalOverlay?.addEventListener('click', (e) => {
	if (e.target === modalOverlay) {
		cerrarModal();
	}
});

// Delegación de eventos en las tarjetas: Editar y Borrar directos
contenedor?.addEventListener('click', (e) => {
	const target = e.target as HTMLElement;

	// 1. Botón Editar de la tarjeta (icono lápiz)
	const btnEdit = target.closest<HTMLElement>('.btn-editar-tarjeta');
	if (btnEdit) {
		const tarjeta = btnEdit.closest<HTMLElement>('.tarjeta-registro');
		if (!tarjeta) return;

		tarjetaEnEdicion = tarjeta;

		const getSlot = (slot: string) =>
			tarjetaEnEdicion?.querySelector(`[data-slot="${slot}"]`)?.textContent?.trim() || '';

		const fechaTexto = getSlot('fecha');
		const fechaInput = document.querySelector<HTMLInputElement>('input[name="fecha"]');
		if (fechaInput && fechaTexto) {
			fechaInput.value = fechaTexto.split('/').reverse().join('-');
		}

		const inputPersona = document.getElementById('input-persona') as HTMLInputElement | null;
		const inputModelo = document.getElementById('input-modelo') as HTMLInputElement | null;
		const inputSerie = document.getElementById('input-serie') as HTMLInputElement | null;

		if (inputPersona) inputPersona.value = getSlot('persona');
		if (inputModelo) inputModelo.value = getSlot('marcaModelo');
		if (inputSerie) inputSerie.value = getSlot('serie');

		setDropdownVal('sucursal', getSlot('sucursal'));
		setDropdownVal('area', getSlot('area'));
		setDropdownVal('tipoEquipo', getSlot('tipoEquipo'));
		setDropdownVal('tipoServicio', getSlot('tipoServicio'));
		setDropdownVal('estatus', getSlot('estatusTexto'));

		abrirModal('Editar Registro');
		return;
	}

	// 2. Botón Borrar de la tarjeta (icono bote de basura)
	const btnDel = target.closest<HTMLElement>('.btn-borrar-tarjeta');
	if (btnDel) {
		const tarjeta = btnDel.closest<HTMLElement>('.tarjeta-registro');
		if (!tarjeta) return;

		abrirConfirmacionBorrado(tarjeta);
		return;
	}
});

// Confirmar registro (Nuevo o Editado)
const getDropdownVal = (field: string) =>
	document.querySelector<HTMLElement>(`.custom-dropdown[data-field="${field}"]`)?.dataset.value || '';

btnConfirmar?.addEventListener('click', () => {
	const fechaRaw = document.querySelector<HTMLInputElement>('input[name="fecha"]')?.value || '';
	const fecha = fechaRaw ? fechaRaw.split('-').reverse().join('/') : '';

	const registro = {
		fecha,
		sucursal: getDropdownVal('sucursal'),
		area: getDropdownVal('area'),
		persona: (document.getElementById('input-persona') as HTMLInputElement | null)?.value.trim() || '',
		tipoEquipo: getDropdownVal('tipoEquipo'),
		marcaModelo: (document.getElementById('input-modelo') as HTMLInputElement | null)?.value.trim() || '',
		serie: (document.getElementById('input-serie') as HTMLInputElement | null)?.value.trim() || '',
		tipoServicio: getDropdownVal('tipoServicio'),
		estatus: getDropdownVal('estatus'),
	};

	if (Object.values(registro).some((valor) => !valor)) {
		mostrarSnackbar('Por favor completa todos los campos antes de confirmar.', 'error');
		return;
	}

	const estilosEstatus: Record<string, { badge: string; dot: string }> = {
		'concluido': {
			badge: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
			dot: 'bg-teal-400'
		},
		'concluidos': {
			badge: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
			dot: 'bg-teal-400'
		},
		'en proceso': {
			badge: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
			dot: 'bg-cyan-400'
		},
		'pendiente': {
			badge: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
			dot: 'bg-amber-400'
		},
		'pendientes': {
			badge: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
			dot: 'bg-amber-400'
		}
	};

	const llenarTarjeta = (objetivo: ParentNode) => {
		const setSlot = (slot: string, texto: string) => {
			const el = objetivo.querySelector(`[data-slot="${slot}"]`);
			if (el) el.textContent = texto;
		};

		setSlot('fecha', registro.fecha);
		setSlot('sucursal', registro.sucursal);
		setSlot('area', registro.area);
		setSlot('persona', registro.persona);
		setSlot('tipoEquipo', registro.tipoEquipo);
		setSlot('marcaModelo', registro.marcaModelo);
		setSlot('serie', registro.serie);
		setSlot('tipoServicio', registro.tipoServicio);
		setSlot('estatusTexto', registro.estatus);

		const estatusKey = registro.estatus.toLowerCase().trim();
		const estilo = estilosEstatus[estatusKey] || estilosEstatus['concluido'];

		const badgeEl = objetivo.querySelector<HTMLElement>('[data-slot="estatusBadge"]');
		const dotEl = objetivo.querySelector<HTMLElement>('[data-slot="estatusDot"]');

		if (badgeEl && dotEl) {
			badgeEl.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] 2xl:text-xs font-medium border ${estilo.badge}`;
			dotEl.className = `w-1.5 h-1.5 rounded-full ${estilo.dot}`;
		}
	};

	if (tarjetaEnEdicion) {
		llenarTarjeta(tarjetaEnEdicion);
		tarjetaEnEdicion = null;
		mostrarSnackbar('Tarjeta actualizada correctamente.', 'editado');
	} else {
		const template = document.getElementById('template-registro') as HTMLTemplateElement | null;
		if (template && contenedor) {
			const clone = template.content.cloneNode(true) as DocumentFragment;
			llenarTarjeta(clone);
			contenedor.prepend(clone);
			mostrarSnackbar('Tarjeta guardada correctamente.', 'exito');
		} else {
			mostrarSnackbar('Error: No se pudo guardar la tarjeta.', 'error');
		}
	}

	window.dispatchEvent(new CustomEvent('actualizar-metricas'));
	cerrarModal();
});
