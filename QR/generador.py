import qrcode


base_url = "https://slingshot-atrium-stubble.ngrok-free.dev/index.html?codigo="

# Lista de prueba con el código EXACTO que está en tu base de datos SQLite
productos = [
    {"codigo": "123456789", "nombre": "Gansito"}
]

for p in productos:
    # Genera el enlace completo con el código del producto
    url_final = base_url + p["codigo"]
    
    # Crea el código QR
    img = qrcode.make(url_final)
    
    # Guarda la imagen
    nombre_archivo = f"QR_{p['nombre']}.png"
    img.save(nombre_archivo)
    print(f"Generado: {nombre_archivo} -> {url_final}")