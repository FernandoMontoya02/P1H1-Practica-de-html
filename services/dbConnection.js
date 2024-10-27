const express = require('express');
const { Pool } = require('pg');
const app = express();
const cors = require('cors');
const port = 3000;
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'practicahtml',
    password: 'programacion',
    port: 5432,
});

// Middleware para permitir el acceso desde el frontend (CORS)s
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


const jwt = require('jsonwebtoken');
  app.use(express.json());
const JWT_SECRET = 'PFq3OZ4d6RPtxigs4Te133LD8SpLF_qha-nWQLLU-8uuolU_oKvMI0MymyIzv1B7';


// Endpoint para obtener los productos
app.get('/productos', async (req, res) => {
    try {
      const result = await pool.query('SELECT pro_id, pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock FROM productos');
      res.json(result.rows);
    } catch (err) {
      console.error('Error al cargar los productos', err);
      res.status(500).send('No se a podido obtener ningun producto');
    }
  });

// Endpoint para obtener los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query(` SELECT usu_id, usu_ced, usu_nom, usu_ape, usu_correo, usu_img, usu_rol, usu_est, usu_contra FROM usuario`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).send({ error: 'Error al obtener los datos de los usuarios' });
    }
});

// Endpoint para actualizar el stock producto
app.post('/actualizarStock', async (req, res) => {
    const productos = req.body;

    try {
        for (const producto of productos) {
            await pool.query(
                'UPDATE productos SET pro_stock = pro_stock - $1 WHERE pro_id = $2',
                [producto.cantidad, producto.pro_id]
            );
        }

        res.send('Stock actualizado correctamente');
    } catch (err) {
        console.error('Error al actualizar el stock:', err);
        res.status(500).send({ error: 'Error al actualizar el stock' });
    }
});

// Endpoint para agregar nuevo producto
app.post('/agregarProducto', async (req, res) => {
    const { pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock } = req.body;

    try {
        await pool.query(
            'INSERT INTO productos (pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock) VALUES ($1, $2, $3, $4, $5, $6)',
            [pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock]
        );
        res.status(201).send('Producto agregado correctamente');
    } catch (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).send('Error al agregar el producto');
    }
});

// Endpoint para iniciar sesion
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT usu_id, usu_nom, usu_ape, usu_contra FROM usuario WHERE usu_correo = $1 AND usu_est = 'Activo'`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).send('Correo no encontrado o usuario inactivo');
        }
        const usuario = result.rows[0];
        if (password === usuario.usu_contra) {
            res.status(200).send('Inicio de sesión exitoso');
        } else {
            res.status(401).send('Contraseña incorrecta');
        }
    } catch (error) {
        console.error('Error al verificar las credenciales:', error);
        res.status(500).send('Error en el servidor');
    }
});

//Endpoint para eliminar el producto
app.delete('/eliminarProducto/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM productos WHERE pro_id = $1', [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Producto eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
});


// Endpoint para obtener un solo producto
app.get('/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT pro_id, pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock FROM productos WHERE pro_id = $1', [id]);
        if (result.rowCount > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (err) {
        console.error('Error al obtener el producto:', err);
        res.status(500).send('Error al obtener el producto');
    }
});

// Endpoint para editar un producto
app.put('/editarProducto/:id', async (req, res) => {
    const { id } = req.params;
    const { pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock } = req.body;

    try {
        const result = await pool.query(
            'UPDATE productos SET pro_nom = $1, pro_des = $2, pro_est = $3, pro_img = $4, pro_pre = $5, pro_stock = $6 WHERE pro_id = $7',
            [pro_nom, pro_des, pro_est, pro_img, pro_pre, pro_stock, id]
        );

        if (result.rowCount > 0) {
            res.status(200).send('Producto actualizado correctamente');
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (err) {
        console.error('Error al editar el producto:', err);
        res.status(500).send('Error al editar el producto');
    }
});


  // // Endpoint para iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });