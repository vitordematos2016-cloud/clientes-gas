import * as ftp from "basic-ftp";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis do .env
dotenv.config();

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    
    try {
        console.log(`Conectando ao FTP: ${process.env.FTP_SERVER}...`);
        await client.access({
            host: process.env.FTP_SERVER,
            user: process.env.FTP_USERNAME,
            password: process.env.FTP_PASSWORD,
            port: process.env.FTP_PORT ? parseInt(process.env.FTP_PORT) : 21,
            secure: false
        });
        
        console.log(`Conectado! Limpando e enviando para o diretório: ${process.env.FTP_SERVER_DIR}`);
        
        // Garante que o diretório de destino existe e entra nele
        await client.ensureDir(process.env.FTP_SERVER_DIR);
        
        // Limpa o diretório remoto antes do upload
        console.log('Limpando diretório remoto...');
        await client.clearWorkingDir();
        
        console.log('Enviando arquivos do diretório /dist ...');
        // Faz upload de todo o conteúdo da pasta dist/ local
        await client.uploadFromDir(path.join(__dirname, 'dist'));
        
        console.log('Upload concluído com sucesso!');
    }
    catch(err) {
        console.error('Erro durante o deploy FTP:', err);
        process.exit(1);
    }
    client.close();
}

deploy();
