import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
	const { data, error } = await supabase
		.from('bitacora')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();

		const fecha = formData.get('fecha')?.toString() || '';
		const sucursal = formData.get('sucursal')?.toString() || '';
		const area = formData.get('area')?.toString() || '';
		const persona = formData.get('persona')?.toString() || '';
		const tipoEquipo = formData.get('tipoEquipo')?.toString() || '';
		const marcaModelo = formData.get('marcaModelo')?.toString() || '';
		const serie = formData.get('serie')?.toString() || '';
		const tipoServicio = formData.get('tipoServicio')?.toString() || '';
		const estatus = formData.get('estatus')?.toString() || 'Pendiente';
		const perfilTecnico = formData.get('perfilTecnico')?.toString() || 'Admin TI';

		let evidencia_url: string | null = null;
		const foto = formData.get('foto') as File | null;

		if (foto && foto.size > 0 && foto.name) {
			const extension = foto.name.split('.').pop() || 'jpg';
			const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`;

			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('evidencias')
				.upload(nombreArchivo, foto, {
					contentType: foto.type,
					upsert: true,
				});

			if (!uploadError && uploadData) {
				const { data: urlData } = supabase.storage
					.from('evidencias')
					.getPublicUrl(nombreArchivo);
				evidencia_url = urlData.publicUrl;
			} else if (uploadError) {
				console.error('Error subiendo imagen a bucket evidencias:', uploadError);
			}
		}

		const { data, error } = await supabase
			.from('bitacora')
			.insert([
				{
					fecha,
					sucursal,
					area,
					trabajador_asignado: persona,
					tipo_equipo: tipoEquipo,
					marca_modelo: marcaModelo,
					num_serie: serie,
					tipo_servicio: tipoServicio,
					estatus,
					perfil_tecnico: perfilTecnico,
					evidencia_url,
				},
			])
			.select()
			.single();

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true, data }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const PUT: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return new Response(JSON.stringify({ error: 'ID es requerido para actualizar' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const updates: Record<string, any> = {};
		if (formData.has('fecha')) updates.fecha = formData.get('fecha')?.toString();
		if (formData.has('sucursal')) updates.sucursal = formData.get('sucursal')?.toString();
		if (formData.has('area')) updates.area = formData.get('area')?.toString();
		if (formData.has('persona')) updates.trabajador_asignado = formData.get('persona')?.toString();
		if (formData.has('tipoEquipo')) updates.tipo_equipo = formData.get('tipoEquipo')?.toString();
		if (formData.has('marcaModelo')) updates.marca_modelo = formData.get('marcaModelo')?.toString();
		if (formData.has('serie')) updates.num_serie = formData.get('serie')?.toString();
		if (formData.has('tipoServicio')) updates.tipo_servicio = formData.get('tipoServicio')?.toString();
		if (formData.has('estatus')) updates.estatus = formData.get('estatus')?.toString();
		if (formData.has('perfilTecnico')) updates.perfil_tecnico = formData.get('perfilTecnico')?.toString();

		const foto = formData.get('foto') as File | null;
		if (foto && foto.size > 0 && foto.name) {
			const extension = foto.name.split('.').pop() || 'jpg';
			const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`;

			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('evidencias')
				.upload(nombreArchivo, foto, {
					contentType: foto.type,
					upsert: true,
				});

			if (!uploadError && uploadData) {
				const { data: urlData } = supabase.storage
					.from('evidencias')
					.getPublicUrl(nombreArchivo);
				updates.evidencia_url = urlData.publicUrl;
			}
		} else if (formData.get('eliminarFoto') === 'true') {
			updates.evidencia_url = null;
		}

		const { data, error } = await supabase
			.from('bitacora')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true, data }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const DELETE: APIRoute = async ({ request }) => {
	try {
		const { id } = await request.json();

		if (!id) {
			return new Response(JSON.stringify({ error: 'ID es requerido' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { error } = await supabase
			.from('bitacora')
			.delete()
			.eq('id', id);

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
