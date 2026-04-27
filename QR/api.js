const express = require('express');
const cors = require('cors');
const { 
    buscarProductoPorCodigo, 
    agregarProducto, 
    insertarProducto, 
    reacomodarlos 
} = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Telefono

// Endpoint 1: Leer código de barras desde el teléfono
app.get('/api/escaner/:codigo', async (req, res) => {
    try {
        const codigo = req.params.codigo;
        const producto = await buscarProductoPorCodigo(codigo);
        
        if (producto) {
            res.json({ success: true, data: producto });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint 2: Agregar producto nuevo
app.post('/api/productos/agregar', async (req, res) => {
    try {
        const { nombre, precio, stock, id_proveedor, codigo_barras } = req.body;
        const id = await agregarProducto(nombre, precio, stock, id_proveedor, codigo_barras);
        res.json({ success: true, message: 'Producto agregado', id: id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint 3: Insertar producto 
app.post('/api/productos/insertar', async (req, res) => {
    try {
        const id = await insertarProducto(req.body);
        res.json({ success: true, message: 'Producto insertado', id: id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint 4: Reacomodar stock de los productos
app.put('/api/productos/reacomodar', async (req, res) => {
    try {
        const { id_producto, nuevo_stock } = req.body;
        const cambios = await reacomodarlos(id_producto, nuevo_stock);
        res.json({ success: true, message: `Productos reacomodados. Filas afectadas: ${cambios}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en el puerto ${PORT}`);
});