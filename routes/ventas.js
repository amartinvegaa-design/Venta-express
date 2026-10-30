import {Router} from 'express'
import {pool} from '../db.js'


const routes = Router();

routes.get('/consolidado', async (req, res) => {
    try {

    const { sucursal, anio } = req.query;


    //Validacion de parametros
    if (!sucursal || !anio) {
        return res.status(400).json({error: 'Bad Request', message: 'Debe Enviar Ambos Parametros'})
    }

    //Se ejecuta el SP en DB
    const [rows] = await pool.query('CALL db_ventas_tech (?, ?)',[sucursal, anio]);

    res.status(200).json({
        status: 'success',
        total_registros: rows[0] ? rows[0].length : 0,
        data: rows[0]
    })

    }catch (error) {
        console.error('Error en GET /api/v1/ventas/consolidado:', error);
        res.status(500).json({error: 'Internal Server Error', message: 'Error En MySQL'})
    }
})

routes.get('/:id', async (req, res) => {
    try {

    const id_venta = parseInt(req.params.id);

    // Validacion del parametro
    if (isNaN(id_venta)) {
        return res.status(400).json({error: 'Bad Request', message: 'El ID debe ser un numero'})
    }

    //Se ejecuta el SP en DB
    const [rows] = await pool.query('CALL sp_venta_id (?)',[id_venta]);

    // Si el SP no devuelve filas, la venta no existe
    if (!rows[0] || rows[0].length === 0) {
        return res.status(404).json({error: 'Not Found', message: 'No existe una venta con ese ID'})
    }

    res.status(200).json({
        status: 'success',
        data: rows[0][0]
    })

    }catch (error) {
        console.error('Error en GET /api/v1/ventas/:id:', error);
        res.status(500).json({error: 'Internal Server Error', message: 'Error En MySQL'})
    }
})

routes.post('/consolidado', async (req, res) => {
    try {
        const { id_producto, id_cliente, cantidad, fecha_venta } = req.body;

        // Validar datos
        if (!id_producto || !id_cliente || !cantidad || !fecha_venta) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Todos los campos son obligatorios'
            });
        }

        await pool.query('CALL db_registrar_venta(?, ?, ?, ?)', [
            id_producto,
            id_cliente,
            cantidad,
            fecha_venta
        ]);

        return res.status(201).json({
            status: 'success',
            message: 'Venta registrada exitosamente',
            datos_registrados: { id_producto, id_cliente, cantidad, fecha_venta }
        });
    } catch (error) {
        console.error('Error en POST /api/v1/consolidado:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error al registrar la venta en la base de datos'
        });
    }
});

export default routes