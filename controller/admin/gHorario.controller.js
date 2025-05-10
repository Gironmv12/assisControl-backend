import express from 'express';
import { sequelize } from '../../config/database.js';
import initModels from '../../models/init-models.js';
import { body, validationResult } from 'express-validator';

const { empleados: Empleados, horarios_laborales: HorariosLaborales } = initModels(sequelize);
const horarios = express.Router();

// Endpoint para asignar un nuevo horario a un empleado
horarios.post('/crear', [
    body('empleado_id').notEmpty().withMessage('empleado_id es requerido'),
    body('dia_semana').notEmpty().withMessage('dia_semana es requerido'),
    body('hora_inicio').notEmpty().withMessage('hora_inicio es requerido'),
    body('hora_fin').notEmpty().withMessage('hora_fin es requerido')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { empleado_id, dia_semana, hora_inicio, hora_fin } = req.body;
        
        // Verificar que el empleado exista
        const empleado = await Empleados.findByPk(empleado_id);
        if (!empleado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        
        // Crear el nuevo horario asignado
        const nuevoHorario = await HorariosLaborales.create({
            empleado_id,
            dia_semana,
            hora_inicio,
            hora_fin
        });
        
        res.status(201).json({ mensaje: 'Horario asignado correctamente', horario: nuevoHorario });
    } catch (error) {
        console.error('Error al asignar horario:', error);
        res.status(500).json({ error: 'Error al asignar horario', detail: error.message });
    }
});

// Endpoint para actualizar un horario existente (horarios/{id})
horarios.put('/:id', [
    body('empleado_id').optional().notEmpty().withMessage('empleado_id debe ser válido'),
    body('dia_semana').optional().notEmpty().withMessage('dia_semana debe ser válido'),
    body('hora_inicio').optional().notEmpty().withMessage('hora_inicio debe ser válido'),
    body('hora_fin').optional().notEmpty().withMessage('hora_fin debe ser válido')
], async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()){
       return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        // Buscar el horario existente por su id
        const horario = await HorariosLaborales.findByPk(id);
        if (!horario) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }
        
        // Si se actualiza el empleado_id, se valida que el empleado exista
        if (req.body.empleado_id) {
            const empleado = await Empleados.findByPk(req.body.empleado_id);
            if (!empleado) {
                return res.status(404).json({ error: 'Empleado no encontrado' });
            }
        }
        
        // Actualizar los campos enviados en el body
        const updatedFields = {};
        if (req.body.empleado_id) updatedFields.empleado_id = req.body.empleado_id;
        if (req.body.dia_semana) updatedFields.dia_semana = req.body.dia_semana;
        if (req.body.hora_inicio) updatedFields.hora_inicio = req.body.hora_inicio;
        if (req.body.hora_fin) updatedFields.hora_fin = req.body.hora_fin;

        await horario.update(updatedFields);
        
        res.status(200).json({ mensaje: 'Horario actualizado correctamente', horario });
    } catch (error) {
        console.error('Error al actualizar horario:', error);
        res.status(500).json({ error: 'Error al actualizar horario', detail: error.message });
    }
});

//eliminar un horario
horarios.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Buscar el horario por su id
        const horario = await HorariosLaborales.findByPk(id);
        if (!horario) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }
        
        // Eliminar el horario
        await horario.destroy();
        
        res.status(200).json({ mensaje: 'Horario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar horario:', error);
        res.status(500).json({ error: 'Error al eliminar horario', detail: error.message });
    }
});

export default horarios;