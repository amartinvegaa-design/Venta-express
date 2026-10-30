import 'dotenv/config';
import express from 'express';
import ventasRoutes from "./routes/ventas.js";

const app = express();


app.use(express.json());

app.use('/api/v1/ventas', ventasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
})