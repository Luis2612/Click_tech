const PRODUCTOS_INICIALES = [
  {
    "id": 1,
    "nombre": "Teclado Mecánico RGB Pro",
    "descripcion": "Teclado mecánico switches Red, retroiluminación RGB por tecla, chasis de aluminio pulido y cable trenzado USB-C desmontable.",
    "precio": 289900,
    "categoria": "Teclados",
    "stock": 25,
    "imagen": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 2,
    "nombre": "Mouse Gaming Ultra 16K",
    "descripcion": "Mouse ergonómico con sensor óptico de 16000 DPI, 8 botones programables, switches ópticos de 80M de clicks y peso ajustable.",
    "precio": 179900,
    "categoria": "Mouses",
    "stock": 40,
    "imagen": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 3,
    "nombre": "Monitor Curvo 27\" 165Hz",
    "descripcion": "Monitor gaming curvo QHD 2560x1440, panel VA 1500R, 1ms de tiempo de respuesta, HDR10 y tecnología FreeSync Premium.",
    "precio": 1149900,
    "categoria": "Monitores",
    "stock": 12,
    "imagen": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 4,
    "nombre": "Audífonos Inalámbricos ANC",
    "descripcion": "Audífonos over-ear con cancelación activa de ruido híbrida, 30 horas de batería, sonido espacial Hi-Res y micrófono estéreo.",
    "precio": 349900,
    "categoria": "Audio",
    "stock": 18,
    "imagen": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 5,
    "nombre": "Webcam 4K AutoFocus",
    "descripcion": "Cámara web Ultra HD 4K con enfoque automático inteligente, corrección automática de luz baja, tapa de privacidad y doble micrófono.",
    "precio": 259900,
    "categoria": "Streaming & Video",
    "stock": 30,
    "imagen": "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 6,
    "nombre": "SSD NVMe 1TB Gen4",
    "descripcion": "Unidad de estado sólido M.2 PCIe Gen4 x4 de alto rendimiento. Lectura secuencial de hasta 7000 MB/s y disipador de aluminio.",
    "precio": 419900,
    "categoria": "Almacenamiento",
    "stock": 35,
    "imagen": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 7,
    "nombre": "Mousepad XL RGB",
    "descripcion": "Alfombrilla de escritorio extendida 900x400mm con superficie de tela micro-texturizada, bordes RGB con 14 modos y base antideslizante.",
    "precio": 129900,
    "categoria": "Accesorios",
    "stock": 50,
    "imagen": "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 8,
    "nombre": "Micrófono Condensador USB",
    "descripcion": "Micrófono estudio cardioide con conexión USB Plug & Play, perilla de ganancia, botón Mute táctil e iluminación RGB reactiva.",
    "precio": 299900,
    "categoria": "Audio",
    "stock": 22,
    "imagen": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 9,
    "nombre": "Hub USB-C 7 en 1",
    "descripcion": "Estación de acoplamiento compacta en aluminio con salida HDMI 4K@60Hz, 3 puertos USB 3.0, lector SD/MicroSD y Power Delivery 100W.",
    "precio": 159900,
    "categoria": "Accesorios",
    "stock": 45,
    "imagen": "https://images.unsplash.com/photo-1616440342232-017fb7c4a45a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 10,
    "nombre": "Router WiFi 6 Mesh Dual Band",
    "descripcion": "Sistema mesh WiFi 6 de alta potencia con velocidad combinada de 3000 Mbps, cobertura hasta 450m² y tecnología OFDMA para 150 dispositivos.",
    "precio": 689900,
    "categoria": "Redes",
    "stock": 8,
    "imagen": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 11,
    "nombre": "Teclado Inalámbrico 60% Compacto",
    "descripcion": "Teclado mecánico ultrasimplificado 60% con conectividad tri-modo (Bluetooth 5.0, 2.4Ghz y cable USB-C) y switches intercambiables.",
    "precio": 199900,
    "categoria": "Teclados",
    "stock": 15,
    "imagen": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 12,
    "nombre": "Teclado Ergonómico Split Bluetooth",
    "descripcion": "Teclado con diseño dividido ergonómico y descanso para muñecas alcochado integrado, emparejamiento con hasta 3 dispositivos.",
    "precio": 249900,
    "categoria": "Teclados",
    "stock": 10,
    "imagen": "https://images.unsplash.com/photo-1541140596738-9273c52e4e1a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 13,
    "nombre": "Teclado Mecánico Custom Hot-Swap",
    "descripcion": "Teclado 75% con perilla metálica multifunción, switches lubricados de fábrica, PCB Hot-Swappable y espuma amortiguadora de sonido por capas.",
    "precio": 429900,
    "categoria": "Teclados",
    "stock": 14,
    "imagen": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 14,
    "nombre": "Teclado Gamer Membrana RGB Silencioso",
    "descripcion": "Teclado full-size con teclas de membrana ultrasilenciosas de tacto suave, iluminación RGB estática por zonas y resistencia a derrames.",
    "precio": 99900,
    "categoria": "Teclados",
    "stock": 60,
    "imagen": "https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 15,
    "nombre": "Mouse Inalámbrico Ultra Ligero 59g",
    "descripcion": "Mouse gamer ultraligero sin perforaciones, peso de solo 59 gramos, sensor PixArt 3395 de 26000 DPI y batería de 80 horas seguidas.",
    "precio": 229900,
    "categoria": "Mouses",
    "stock": 28,
    "imagen": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 16,
    "nombre": "Mouse Vertical Ergonómico Anti-Fatiga",
    "descripcion": "Mouse con postura vertical ergonómica de 57°, diseñado para prevenir la tensión muscular en muñeca y antebrazo. Conexión inalámbrica 2.4G.",
    "precio": 139900,
    "categoria": "Mouses",
    "stock": 22,
    "imagen": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 17,
    "nombre": "Mouse Gaming Ambidiestro Pro",
    "descripcion": "Mouse simétrico de alto rendimiento con botones laterales magnéticos intercambiables a ambos lados, tasa de sondeo de 4000 Hz.",
    "precio": 319900,
    "categoria": "Mouses",
    "stock": 16,
    "imagen": "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 18,
    "nombre": "Mousepad Rígido de Vidrio Templado",
    "descripcion": "Superficie de deslizamiento extremo fabricada en cristal templado satinado grabado al ácido. Máxima velocidad de deslizamiento para esports.",
    "precio": 189900,
    "categoria": "Accesorios",
    "stock": 19,
    "imagen": "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 19,
    "nombre": "Monitor Ultrawide 34\" 144Hz 2K",
    "descripcion": "Monitor panorámico 21:9 QHD 3440x1440, curvatura 1000R, tasa de refresco 144Hz, tecnología Quantum Dot y soporte regulable en altura.",
    "precio": 1899900,
    "categoria": "Monitores",
    "stock": 6,
    "imagen": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 20,
    "nombre": "Monitor Gamer 24\" 240Hz Fast IPS",
    "descripcion": "Monitor esports de 24.5 pulgadas FHD 1920x1080, panel Fast IPS con 240Hz nativos y 0.5ms GtG, certificación G-Sync Compatible.",
    "precio": 949900,
    "categoria": "Monitores",
    "stock": 14,
    "imagen": "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 21,
    "nombre": "Monitor 4K UHD 27\" IPS Creadores",
    "descripcion": "Monitor profesional 4K 3840x2160 con cobertura de color 99% sRGB y DCI-P3, puerto USB-C con Power Delivery de 90W e inclinación pivotante 90°.",
    "precio": 1499900,
    "categoria": "Monitores",
    "stock": 9,
    "imagen": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 22,
    "nombre": "Soporte Doble Neumático para Monitores",
    "descripcion": "Brazo articulado doble con resorte de gas resistente para monitores de 17 a 32 pulgadas. Gestión interna de cables y abrazadera C resistente.",
    "precio": 219900,
    "categoria": "Accesorios",
    "stock": 33,
    "imagen": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 23,
    "nombre": "Audífonos Gamer 7.1 Surround RGB",
    "descripcion": "Headset gaming con sonido envolvente virtual 7.1, controladores de 50mm de neodimio, micrófono flexible con cancelación de ruido pasiva.",
    "precio": 219900,
    "categoria": "Audio",
    "stock": 27,
    "imagen": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 24,
    "nombre": "Audífonos Studio Pro Monitor",
    "descripcion": "Auriculares profesionales abiertos para mezcla y masterización. Respuesta de frecuencia ultraplana de 5Hz a 40kHz y almohadillas de velur.",
    "precio": 599900,
    "categoria": "Audio",
    "stock": 11,
    "imagen": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 25,
    "nombre": "Barra de Sonido Gaming RGB",
    "descripcion": "Soundbar compacto estéreo de 20W con conectividad Bluetooth 5.3 y auxiliar 3.5mm, perilla de volumen frontal y 6 modos de iluminación LED.",
    "precio": 189900,
    "categoria": "Audio",
    "stock": 32,
    "imagen": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 26,
    "nombre": "DAC Amplificador USB Hi-Res",
    "descripcion": "Convertidor Digital a Analógico estéreo portátil con chip ESS Sabre, decodificación MQA y salida balanceada de 4.4mm para audífonos de alta impedancia.",
    "precio": 279900,
    "categoria": "Audio",
    "stock": 13,
    "imagen": "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 27,
    "nombre": "Disco Duro Externo 4TB Rugged",
    "descripcion": "Disco duro portátil con carcasa antichoque de goma militar, resistente a agua y polvo IP54, transferencia USB 3.2 Gen 1.",
    "precio": 389900,
    "categoria": "Almacenamiento",
    "stock": 21,
    "imagen": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 28,
    "nombre": "SSD NVMe 2TB PCIe 4.0 con Heatsink",
    "descripcion": "SSD ultrarápido compatible con consolas PS5 y PC. Velocidades de hasta 7300 MB/s lectura y disipador de calor pasivo integrado.",
    "precio": 789900,
    "categoria": "Almacenamiento",
    "stock": 17,
    "imagen": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 29,
    "nombre": "Memoria USB 3.2 256GB Dual Type-C",
    "descripcion": "Pen drive metálico giratorio con doble conector USB Tipo-A y Tipo-C. Velocidades de transferencia de hasta 400 MB/s.",
    "precio": 119900,
    "categoria": "Almacenamiento",
    "stock": 55,
    "imagen": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 30,
    "nombre": "Tarjeta Capturadora 4K60 HDR USB 3.0",
    "descripcion": "Capturadora de video para streaming y grabación a 1080p60fps sin latencia con pass-through 4K60 HDR. Compatible con OBS, Twitch y YouTube.",
    "precio": 499900,
    "categoria": "Streaming & Video",
    "stock": 15,
    "imagen": "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 31,
    "nombre": "Anillo de Luz LED 12\" con Trípode",
    "descripcion": "Ring Light LED de 12 pulgadas con 3 tonos de luz (cálido, neutro, frío), 10 niveles de brillo, soporte giratorio para smartphone y control remoto Bluetooth.",
    "precio": 89900,
    "categoria": "Streaming & Video",
    "stock": 42,
    "imagen": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 32,
    "nombre": "Stream Control Deck 15 Teclas LCD",
    "descripcion": "Consola de control para creadores de contenido con 15 teclas LCD totalmente personalizables para cambiar escenas, lanzar medios y ajustar audio.",
    "precio": 629900,
    "categoria": "Streaming & Video",
    "stock": 7,
    "imagen": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 33,
    "nombre": "Brazo Articulado para Micrófono Studio",
    "descripcion": "Brazo de micrófono prémium con resortes internos ocultos, gestión de cables por riel integrado y rotación completa de 360 grados.",
    "precio": 139900,
    "categoria": "Streaming & Video",
    "stock": 26,
    "imagen": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 34,
    "nombre": "Router Gaming Tri-Band WiFi 6E",
    "descripcion": "Router de alto rendimiento con banda exclusiva de 6 GHz, procesador quad-core de 2.0 GHz, puerto WAN 2.5G y acelerador de paquetes para gaming online.",
    "precio": 1199900,
    "categoria": "Redes",
    "stock": 5,
    "imagen": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 35,
    "nombre": "Switch Gigabit Ethernet 8 Puertos Metal",
    "descripcion": "Switch de red Plug & Play de 8 puertos 10/100/1000 Mbps con chasis de acero robusto sin ventilador silencioso y optimización de tráfico QoS.",
    "precio": 109900,
    "categoria": "Redes",
    "stock": 38,
    "imagen": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 36,
    "nombre": "Adaptador WiFi 6 USB 1800Mbps",
    "descripcion": "Antena USB WiFi 6 dual band de alta ganancia con dos antenas desplegables de 5dBi para mayor cobertura y estabilidad de conexión.",
    "precio": 129900,
    "categoria": "Redes",
    "stock": 48,
    "imagen": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 37,
    "nombre": "Silla Gamer Ergonómica Pro Reclinable",
    "descripcion": "Silla de juego ergonómica con pistón de gas Clase 4, reclinación hasta 180°, cojín lumbar con espuma de memoria y apoya brazos 4D.",
    "precio": 899900,
    "categoria": "Sillas & Escritorios",
    "stock": 10,
    "imagen": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 38,
    "nombre": "Escritorio Gamer Standing Desk Eléctrico",
    "descripcion": "Escritorio elevable con motor doble silencioso, panel digital con memoria de 4 posiciones, tablero de 140x70cm con acabado en fibra de carbono.",
    "precio": 1699900,
    "categoria": "Sillas & Escritorios",
    "stock": 4,
    "imagen": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 39,
    "nombre": "Silla Ergonómica Mesh Oficina & Setup",
    "descripcion": "Silla de oficina ergonómica de malla elástica transpirable, soporte lumbar dinámico auto-ajustable y reposacabezas regulable en altura.",
    "precio": 1199900,
    "categoria": "Sillas & Escritorios",
    "stock": 8,
    "imagen": "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 40,
    "nombre": "Cargador Inalámbrico Magsafe 3 en 1 15W",
    "descripcion": "Estación de carga rápida inalámbrica de 15W para smartphone, smartwatch y audífonos al mismo tiempo, fabricado en aleación de aluminio.",
    "precio": 149900,
    "categoria": "Accesorios",
    "stock": 35,
    "imagen": "https://images.unsplash.com/photo-1616440342232-017fb7c4a45a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 41,
    "nombre": "Soporte Regulable de Aluminio para Laptop",
    "descripcion": "Base plegable ergonómica con 6 ángulos de altura ajustables para computadores portátiles de 10 a 17.3 pulgadas, diseño de disipación abierta.",
    "precio": 99900,
    "categoria": "Accesorios",
    "stock": 60,
    "imagen": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 42,
    "nombre": "Lámpara Monitor LED Anti-Reflejo USB",
    "descripcion": "Barra de luz para pantalla con iluminación asimétrica que elimina el deslumbramiento en pantalla, control táctil de brillo y temperatura de color.",
    "precio": 139900,
    "categoria": "Accesorios",
    "stock": 40,
    "imagen": "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 43,
    "nombre": "Organizador de Cables Magnético Desk",
    "descripcion": "Set de 5 clips magnéticos para fijar cables de cargador e periféricos al borde del escritorio sin enredos ni caídas al suelo.",
    "precio": 49900,
    "categoria": "Accesorios",
    "stock": 80,
    "imagen": "https://images.unsplash.com/photo-1616440342232-017fb7c4a45a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 44,
    "nombre": "Fuente de Poder 850W 80 Plus Gold Modular",
    "descripcion": "Fuente de alimentación completamente modular ATX 3.0 con certificación 80+ Gold, condensadores japoneses 105°C y ventilador FDB de 135mm.",
    "precio": 549900,
    "categoria": "Componentes",
    "stock": 14,
    "imagen": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 45,
    "nombre": "Refrigeración Líquida AIO 360mm ARGB",
    "descripcion": "Kit de enfriamiento líquido con radiador triple de 360mm, 3 ventiladores PWM de alto flujo estático y pantalla LCD personalizable en el bloque de agua.",
    "precio": 649900,
    "categoria": "Componentes",
    "stock": 9,
    "imagen": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 46,
    "nombre": "Gabinete Gamer ATX Cristal Templado 4 Fans",
    "descripcion": "Chasis Mid-Tower con panel frontal de malla de alto flujo de aire, panel lateral de vidrio templado magnético y 4 ventiladores ARGB preinstalados.",
    "precio": 329900,
    "categoria": "Componentes",
    "stock": 18,
    "imagen": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 47,
    "nombre": "Kit RAM DDR5 32GB (2x16GB) 6000MHz RGB",
    "descripcion": "Kit de memoria RAM de alta velocidad DDR5 con soporte para Intel XMP 3.0 y AMD EXPO, disipador térmico de aluminio cepillado y barra de luz RGB.",
    "precio": 589900,
    "categoria": "Componentes",
    "stock": 23,
    "imagen": "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 48,
    "nombre": "Soporte Vertical Tarjeta Gráfica PCIe 4.0",
    "descripcion": "Kit de montaje vertical para GPU con cable riser ultra flexible PCIe 4.0 x16 sin pérdida de rendimiento y estructura de acero de calibre pesado.",
    "precio": 179900,
    "categoria": "Componentes",
    "stock": 15,
    "imagen": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 49,
    "nombre": "Teclado Numérico Inalámbrico Bluetooth",
    "descripcion": "Pad numérico independiente de 22 teclas con conectividad Bluetooth para laptops y diseño ultradelgado en aluminio pulido.",
    "precio": 79900,
    "categoria": "Teclados",
    "stock": 30,
    "imagen": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 50,
    "nombre": "Kit Mantenimiento & Limpieza Teclados/Pantallas",
    "descripcion": "Kit profesional 7 en 1 con extractor de keycaps, cepillo de cerdas suaves, spray limpiador de pantallas y paño de microfibra de alta densidad.",
    "precio": 39900,
    "categoria": "Accesorios",
    "stock": 100,
    "imagen": "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 51,
    "nombre": "Controlador Inalámbrico Hall Effect Pro",
    "descripcion": "Mando inalámbrico multiplataforma (PC, Switch, Android, iOS) con joysticks magnéticos de efecto Hall anti-drift y gatillos analógicos ajustables.",
    "precio": 239900,
    "categoria": "Accesorios",
    "stock": 25,
    "imagen": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": 52,
    "nombre": "Base Enfriadora RGB para Laptop 6 Ventiladores",
    "descripcion": "Base con 6 motores silenciosos de alta velocidad, pantalla LCD reguladora de RPM, 2 puertos USB passthrough y soporte para laptops hasta 17.3 pulgadas.",
    "precio": 119900,
    "categoria": "Accesorios",
    "stock": 35,
    "imagen": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80"
  }
];
