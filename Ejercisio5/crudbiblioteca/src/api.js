const express = require("express");
const { openDb } = require("./db.js");

function apiRouter() {
  const router = express.Router();
  const db = openDb();

  
  const toInt = (v) => {
    const n = parseInt(v);
    return isNaN(n) ? 0 : n;
  };

  // =========================
  // LIBROS
  // =========================
  router.get("/libros", (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      const rows = db.prepare(`
        SELECT ID, TITULO, 'N/A' AS ISBN, 'N/A' AS AUTORES, 
        (SELECT COUNT(*) FROM EJEMPLAR WHERE LIBRO_ID = LIBRO.ID) AS TOTAL_EJEMPLARES,
        (SELECT COUNT(*) FROM EJEMPLAR WHERE LIBRO_ID = LIBRO.ID AND ESTADO = 'disponible') AS DISPONIBLES
        FROM LIBRO
        WHERE (?='' OR TITULO LIKE '%'||?||'%')
        ORDER BY ID DESC
      `).all(q, q);
      res.json({ ok: true, data: rows });
    } catch (e) { res.json({ ok: true, data: [] }); }
  });

  router.post("/libros", (req, res) => {
    try {
      const { titulo } = req.body;
      const info = db.prepare(`INSERT INTO LIBRO (TITULO) VALUES (?)`).run(titulo);
      res.status(201).json({ ok: true, id: info.lastInsertRowid });
    } catch (e) { res.status(500).json({ ok: false, message: "Error al crear libro: " + e.message }); }
  });

  // =========================
 
  // =========================
  router.get("/ejemplares", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT J.ID, J.CODIGO_BARRAS, L.TITULO AS LIBRO_TITULO, J.ESTADO, J.UBICACION
        FROM EJEMPLAR J
        LEFT JOIN LIBRO L ON L.ID = J.LIBRO_ID
        ORDER BY J.ID DESC
      `).all();
      res.json({ ok: true, data: rows });
    } catch (e) { res.json({ ok: true, data: [] }); }
  });

  router.post("/ejemplares", (req, res) => {
    try {
      const { edicion_id, codigo_barras, ubicacion, estado } = req.body;
      
      const info = db.prepare(`
        INSERT INTO EJEMPLAR (LIBRO_ID, CODIGO_BARRAS, UBICACION, ESTADO) 
        VALUES (?, ?, ?, ?)
      `).run(toInt(edicion_id), codigo_barras, ubicacion || 'Estante G', estado || 'disponible');
      
      res.status(201).json({ ok: true, id: info.lastInsertRowid });
    } catch (e) { 
      console.error(e);
      res.status(500).json({ ok: false, message: "Error al crear ejemplar. Verifica que la tabla EJEMPLAR exista." }); 
    }
  });

  // =========================
  // SELECTS (
  // =========================
  router.get("/select/ediciones", (req, res) => {
    try {
      
      const rows = db.prepare(`SELECT ID, TITULO AS LABEL FROM LIBRO ORDER BY TITULO`).all();
      res.json({ ok: true, data: rows });
    } catch (e) { res.json({ ok: true, data: [] }); }
  });

  router.get("/select/usuarios", (req, res) => {
    try { res.json({ ok: true, data: db.prepare(`SELECT ID, NOMBRE FROM USUARIO`).all() }); } 
    catch(e) { res.json({ ok: true, data: [] }); }
  });

  router.get("/autores", (req, res) => res.json({ ok: true, data: [] }));
  router.get("/editoriales", (req, res) => res.json({ ok: true, data: [] }));
  router.get("/usuarios", (req, res) => res.json({ ok: true, data: [] }));
  router.get("/prestamos", (req, res) => res.json({ ok: true, data: [] }));
  router.get("/reservas", (req, res) => res.json({ ok: true, data: [] }));

  return router;
}

module.exports = { apiRouter };