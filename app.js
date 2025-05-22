import express from 'express';
import dotenv from 'dotenv';
import cors from  'cors';
import { connectDB } from './config/database.js';

import empleadosRoutes from './routes/empleados.route.js';
import authRoute from './routes/auth.route.js';
import asistenciaRoute from './routes/asistencia.route.js';
import registrarAsistenciaRoute from './routes/registrarAsistencia.route.js';
import horariosRoute from './routes/horarios.route.js';
import perfilRoute from './routes/perfil.route.js';
import dashboardRoute from './routes/dashbord.route.js';
import resumenRoute from './routes/resumen.route.js';

//cargar las variables de entorno
dotenv.config();

//configuracion de los cors
const corsConfig = {
    origin: '*',
    credentials : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

//inicializar express
const app = express();

app.use(cors(corsConfig));
//mildedware para recibir json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API is running'
    });
});

//puesto de escucha
const port = process.env.PORT || 5000;

//usar las rutas importadas
app.use('/api', empleadosRoutes);

app.use('/api', authRoute);

app.use('/api', asistenciaRoute);

app.use('/api', registrarAsistenciaRoute);

app.use('/api', horariosRoute);

app.use('/api', perfilRoute);

app.use('/api', dashboardRoute);

app.use('/api', resumenRoute);



//inicializar la base de datos
connectDB().then(() => {
    console.log('Conexión a la base de datos establecida correctamente');

    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}).catch(error => {
    console.error('No se pudo conectar a la base de datos:', error);
});