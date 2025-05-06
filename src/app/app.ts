
import dotenv from 'dotenv';
import whatsappClient from '../infrastructure/chatbot/chatbot.client'; // Importa el bot desde el archivo separado
import Server from './server';

// Configurar las variables de entorno del archivo .env
dotenv.config();


// Crear una instancia del servidor y arrancarlo
const server = new Server();


