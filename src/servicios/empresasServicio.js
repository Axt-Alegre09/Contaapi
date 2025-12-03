/**
 * Servicio de Empresas - ContaAPI v2
 * Manejo completo de operaciones CRUD para empresas
 */

import { supabase } from '../configuracion/supabase'

class EmpresasServicio {
    /**
     * Obtener todas las empresas del usuario actual
     */
    async obtenerEmpresas() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No hay usuario autenticado')

            const { data, error } = await supabase
                .from('usuarios_empresas')
                .select(`
          *,
          empresas (
            id,
            nombre_comercial,
            razon_social,
            ruc,
            direccion,
            telefono,
            email,
            tipo_contribuyente,
            moneda_base,
            estado,
            created_at,
            updated_at
          )
        `)
                .eq('user_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Formatear datos
            return data
                .filter(item => item.empresas && item.empresas.estado === 'activa')
                .map(item => ({
                    ...item.empresas,
                    rol: item.rol,
                    fecha_desde: item.fecha_desde,
                    fecha_hasta: item.fecha_hasta,
                    periodo_fiscal: item.periodo_fiscal
                }))
        } catch (error) {
            console.error('Error al obtener empresas:', error)
            throw new Error('Error al cargar las empresas')
        }
    }

    /**
     * Obtener una empresa por ID
     */
    async obtenerEmpresaPorId(empresaId) {
        try {
            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('id', empresaId)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error al obtener empresa:', error)
            throw new Error('Error al cargar los datos de la empresa')
        }
    }

    /**
     * Crear nueva empresa
     */
    async crearEmpresa(datosEmpresa) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No hay usuario autenticado')

            // Insertar empresa
            const { data: empresa, error: errorEmpresa } = await supabase
                .from('empresas')
                .insert({
                    user_id: user.id,
                    nombre_comercial: datosEmpresa.nombreComercial,
                    razon_social: datosEmpresa.razonSocial,
                    ruc: datosEmpresa.ruc,
                    direccion: datosEmpresa.direccion || null,
                    telefono: datosEmpresa.telefono || null,
                    email: datosEmpresa.email || null,
                    tipo_contribuyente: datosEmpresa.tipoContribuyente || 'general',
                    moneda_base: datosEmpresa.monedaBase || 'PYG',
                    pais: 'Paraguay',
                    estado: 'activa'
                })
                .select()
                .single()

            if (errorEmpresa) throw errorEmpresa

            // Crear relación usuario-empresa como propietario
            const { error: errorRelacion } = await supabase
                .from('usuarios_empresas')
                .insert({
                    user_id: user.id,
                    empresa_id: empresa.id,
                    rol: 'propietario',
                    periodo_fiscal: datosEmpresa.periodoFiscal,
                    fecha_desde: datosEmpresa.fechaDesde || new Date().toISOString().split('T')[0],
                    estado: 'activo'
                })

            if (errorRelacion) {
                // Si falla la relación, eliminar la empresa
                await supabase.from('empresas').delete().eq('id', empresa.id)
                throw errorRelacion
            }

            return empresa
        } catch (error) {
            console.error('Error al crear empresa:', error)
            throw new Error(error.message || 'Error al crear la empresa')
        }
    }

    /**
     * Actualizar empresa
     */
    async actualizarEmpresa(empresaId, datosEmpresa) {
        try {
            const { data, error } = await supabase
                .from('empresas')
                .update({
                    nombre_comercial: datosEmpresa.nombreComercial,
                    razon_social: datosEmpresa.razonSocial,
                    ruc: datosEmpresa.ruc,
                    direccion: datosEmpresa.direccion || null,
                    telefono: datosEmpresa.telefono || null,
                    email: datosEmpresa.email || null,
                    tipo_contribuyente: datosEmpresa.tipoContribuyente,
                    moneda_base: datosEmpresa.monedaBase,
                    updated_at: new Date().toISOString()
                })
                .eq('id', empresaId)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error al actualizar empresa:', error)
            throw new Error('Error al actualizar la empresa')
        }
    }

    /**
     * Eliminar empresa (soft delete)
     */
    async eliminarEmpresa(empresaId) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No hay usuario autenticado')

            // 1. Cambiar estado de la empresa a inactiva
            const { error: errorEmpresa } = await supabase
                .from('empresas')
                .update({
                    estado: 'inactiva',
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', empresaId)

            if (errorEmpresa) {
                console.error('Error al actualizar empresa:', errorEmpresa)
                throw errorEmpresa
            }

            // 2. Marcar TODAS las relaciones de la empresa como eliminadas
            // (no solo las del usuario actual, sino todas)
            const { error: errorRelaciones } = await supabase
                .from('usuarios_empresas')
                .update({
                    estado: 'eliminado',
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('empresa_id', empresaId)
                .is('deleted_at', null) // Solo actualizar las que no están ya eliminadas

            if (errorRelaciones) {
                console.error('Error al actualizar relaciones:', errorRelaciones)
                throw errorRelaciones
            }

            return true
        } catch (error) {
            console.error('Error al eliminar empresa:', error)
            throw new Error('Error al eliminar la empresa')
        }
    }

    /**
     * Obtener estadísticas de empresas
     */
    async obtenerEstadisticas() {
        try {
            const empresas = await this.obtenerEmpresas()

            // Contar por rol de forma segura
            const porRol = empresas.reduce((acc, empresa) => {
                const rol = empresa.rol || 'sin_rol'
                acc[rol] = (acc[rol] || 0) + 1
                return acc
            }, {})

            return {
                total: empresas.length,
                activas: empresas.filter(e => e.estado === 'activa').length,
                propietario: porRol.propietario || 0,
                administrador: porRol.administrador || 0,
                contador: porRol.contador || 0,
                ultimaCreada: empresas.length > 0 ? empresas[0] : null
            }
        } catch (error) {
            console.error('Error al obtener estadísticas:', error)
            return {
                total: 0,
                activas: 0,
                propietario: 0,
                administrador: 0,
                contador: 0,
                ultimaCreada: null
            }
        }
    }
}

export const empresasServicio = new EmpresasServicio()