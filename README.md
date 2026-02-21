# Zyphro: Zero-Knowledge Secret Sharing Infrastructure

![Zyphro Banner](./assets/banner-zyphro.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)]()
[![Encryption](https://img.shields.io/badge/Encryption-XChaCha20--Poly1305-blueviolet)]()
[![Security](https://img.shields.io/badge/Security-Zero--Knowledge-success)]()

**Zyphro** es una infraestructura de código abierto para el intercambio de secretos con arquitectura **Zero-Knowledge**. Permite enviar contraseñas, claves privadas y mensajes confidenciales que se autodestruyen permanentemente tras su lectura ("Burn on read").

A diferencia de otros servicios, **las llaves de cifrado nunca tocan el servidor**. Todas las operaciones criptográficas ocurren localmente en el navegador del usuario utilizando librerías auditadas de alto rendimiento.

## 🔐 Arquitectura de Seguridad (Military-Grade)

Zyphro no confía en nadie, ni siquiera en sus propios administradores:

- **XChaCha20-Poly1305:** Hemos migrado de AES a XChaCha20 para eliminar los riesgos de reutilización de nonces, utilizando nonces de 192 bits para una seguridad probabilística superior.
- **Derivación Robusta (PBKDF2):** Las claves se derivan mediante PBKDF2 con 100,000 iteraciones y SHA-256, garantizando resistencia contra ataques de fuerza bruta.
- **Zero-Knowledge:** El servidor solo almacena *blobs* cifrados e identificadores anónimos. La Master Key viaja únicamente en el fragmento URL (`#`), el cual el navegador jamás envía al servidor.
- **Autodestrucción Garantizada:** Los datos se eliminan físicamente de la base de datos (Hard Delete) inmediatamente después de alcanzar el límite de visitas o la fecha de expiración.



## 🚀 Tech Stack Industrial

- **Frontend:** React 19 + Vite + TailwindCSS (Cyberpunk UI)
- **Autenticación:** Clerk Auth (Gestión de identidad segura)
- **Criptografía:** `@noble/ciphers` & `@noble/hashes` (JS Auditado)
- **Backend:** Node.js (Express) + Prisma ORM
- **Base de Datos:** PostgreSQL (Neon Tech)
- **Infraestructura:** Vercel (Edge Runtime)

## 🗺️ Roadmap de Seguridad 2026

### Fase 1: Consolidación (Completada ✅)
- [x] Migración a **XChaCha20-Poly1305**.
- [x] Implementación de **PBKDF2** para derivación de claves.
- [x] Dashboard de gestión de Vórtices para usuarios autenticados.
- [x] Persistencia local de llaves para el creador.

### Fase 2: Blindaje de Red (Próximamente)
- [ ] **Rate Limiting Avanzado:** Protección contra ataques de enumeración de IDs.
- [ ] **Secret Brushing:** Añadido de ruido aleatorio (padding) para ocultar el tamaño real del secreto cifrado.
- [ ] **SDK para Desarrolladores:** Librería NPM para integrar el cifrado de Zyphro en otras apps.

### Fase 3: Cumplimiento & Auditoría
- [ ] **Auditoría Externa:** Revisión de código por firmas independientes.
- [ ] **SOC 2 Type II:** Certificación de procesos de seguridad operativa.

## 🛠️ Instalación y Despliegue Local

```bash
# 1. Clonar el repositorio
git clone [https://github.com/tu-usuario/zyphro-core.git](https://github.com/tu-usuario/zyphro-core.git)
cd zyphro-core

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env)
# DATABASE_URL=...
# CLERK_SECRET_KEY=...
# VITE_CLERK_PUBLISHABLE_KEY=...

# 4. Iniciar en modo desarrollo
npm run dev