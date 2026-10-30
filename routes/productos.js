import {Router} from 'express'
import {pool} from '../db.js'

const routes = Router();


routes.get('/productos', async (req, res) => {
    try {

    const { id_producto } = req.query;


    //Validacion de parametros
    if (!id_producto) {
        return res.status(400).json({error: 'Bad Request', message: 'Debe Enviar El Parametro'})
    }

    //Se ejecuta el SP en DB
    const [rows] = await pool.query('CALL db_productos_tech (?)',[id_producto]);

    res.status(200).json({
        status: 'success',
        total_registros: rows[0] ? rows[0].length : 0,
        data: rows[0]
    })  

    }catch (error) {
        console.error('Error en GET /api/v1/productos:', error);
        res.status(500).json({error: 'Internal Server Error', message: 'Error En MySQL'})
    }
})

routes.post('/productos', async (req, res) => {
    try {
        const { id_producto, id_categoria, nombre_producto, precio_unitario, precio_provedor, ubicacion_pasillo } = req.body;

        // Validar datos
        if (!id_producto || !id_categoria || !nombre_producto || !precio_unitario || !precio_provedor || !ubicacion_pasillo) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Todos los campos son obligatorios'
            });
        }

        await pool.query('CALL db_registar_productos(?, ?, ?, ?, ?, ?)', [
            id_producto,
            id_categoria,
            nombre_producto,
            precio_unitario,
            precio_provedor,
            ubicacion_pasillo
        ]);

        return res.status(201).json({
            status: 'success',
            message: 'Producto registrado exitosamente',
            datos_registrados: { id_producto, id_categoria, nombre_producto, precio_unitario, precio_provedor, ubicacion_pasillo }
        });
    } catch (error) {
        console.error('Error en POST /api/v1/productos:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error al registrar el producto en la base de datos'
        });
    }
});

export default routes