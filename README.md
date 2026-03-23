Parte 1: Fundamentos y Conocimientos Técnicos 
1.	¿Cómo manejarías un flujo de errores en una API con Express usando middleware centralizado en Node.js?
Usaría una clase personalizada como AppError para encapsular información relevante del error, como el statusCode y el tipo de error, lo que permite diferenciar errores operativos de errores inesperados.
Luego implementaría un middleware centralizado de manejo de errores, definido con cuatro parámetros (err, req, res, next), y lo registraría después de todas las rutas para asegurar que cualquier error propagado mediante next() sea capturado y procesado en un único punto.

2.	¿Qué ventajas ofrece un ORM como Sequelize o TypeORM contra un modelo de consultas con SQL plano y cuáles son sus limitaciones?
El ORM Sequelize o TypeORM ofrece mayor productividad que trabaja con modelos en lugar de escribir SQL manual, lo que reduce errores al momento de gestionar las relaciones, migraciones, validaciones. 

3.	¿Cómo implementarías lazy loading en AngularJS o cómo modularizarías una aplicación grande?
Utilizaría lazy loading para cargar los diferentes módulos bajo demanda según la navegación entre las diferentes rutas que accede el usuario mejorando el tiempo de arranque y la carga inicial de la aplicación. 

4.	¿Qué diferencias hay entre $scope, $rootScope y servicios en AngularJS?
El $scope es el objeto que conecta el controlador con la vista, permite exponer datos y funciones específicas de un componente. 
El $rootScope es el scope global de la aplicación, es utilizado para compartir datos globales. 
5.	¿Cómo integrarías una librería de machine learning en un microservicio Python?
La integraría dentro de un microservicio construido con algún framework que soporte Phyton como FastAPI, exponiendo un servicio REST para recibir y devolver peticiones del usuario. 
6.	¿En Bases de Datos relacionales, qué son índices compuestos y cuándo los usarías?
Un índice compuesto es creado sobre dos o más columnas de una tabla donde el orden de las columnas es relevante para su uso. 
Lo utilizaría en consultas frecuentes donde apliquen condiciones combinadas en un “WHERE” o cuando se requiera un ordenamiento sobre varias columnas. 
7.	¿Cómo manejarías una migración de datos entre ambientes productivos para no afectar la integridad?
Se realiza en primer un respaldo completo de toda la información que se va migrar, después con el uso de herramientas de migración ya sea un framework como .Net o script para garantizar la calidad de la información, esto sería utilizando transacciones para validar todos los datos posibles como constrains, claves foráneas y índices necesarios. 
8.	Diferencias entre blockchain pública y privada.
Una blockchain pública es abierta y descentralizada, esto quiere decir, que cualquier persona puede participar y ofrecer una transparencia para el uso de criptomonedas. 
Una blockchain privada están restringidas solamente para un grupo selecto de participantes proporcionando un mayor control y privacidad. 
9.	¿Qué es un hash y en qué proceso tecnológico lo aplicarías?
Un hash es el resultado de aplicar criptografía lo cual transforma una cadena de datos de cualquier tamaño a una cadena de caracteres de longitud fija. Su función principal es garantizar seguridad e integridad en los datos que se tiene. 
Lo aplicaría al momento de realizar un registro de usuario para que la contraseña este almacenada como caracteres aleatorios y no sea visible directamente. Otro uso sería al momento de guardar firmas digitales, de esta manera crear un hash para la clave privada. 
10.	Si tuvieras que integrar la API de OpenAI para enriquecer datos, ¿qué técnicas usarías para controlar costos y latencia?
Técnicas para el control de costos: 
-	Modelo: Seleccionar el modelo correcto dependiendo de las tareas que se van a requerir y el tipo de promts que se van a ejecutar. 
-	Optimización de promts: Limitar el tamaño del prompt y la cantidad de tokens en la respuesta.
-	Cache en la respuesta: Con el uso de Redis se puede almacenar respuestas de consultas idénticas.
Técnicas para el control de latencia: 
-	Procesamiento asíncrono: Usar colas de mensajes para realizar las consultas en segundo plano evitando bloquear el flujo de la aplicación. 
-	Monitoreo: Evitar que se disparen múltiples peticiones innecesarias y utilizar métricas que evalúen los tokens consumidos. 

Parte 3: Soft Skills y Cultura Zeyo 

13.	¿Cómo garantizarías trazabilidad y resiliencia en una arquitectura de microservicios?
Implementaría trazabilidad distribuida usando correlation IDs propagados por headers y herramientas como OpenTelemetry + Jaeger para visualizar el flujo entre servicios. Utilizar también el servicio /healt para verificar que los servicios estén correctamente activos.

14.	Describe un caso real de uso de IA + Blockchain que te parezca viable a corto plazo.
Un caso viable es validación de identidad y scoring crediticio descentralizado.
La IA puede analizar comportamiento financiero y generar un score dinámico, mientras que la blockchain almacena el hash de los resultados y el historial de validaciones para garantizar integridad y no repudio sin exponer datos sensibles.
Ejemplo práctico: microcréditos en fintech donde el modelo ML evalúa riesgo en tiempo real y la blockchain registra auditorías del scoring, evitando manipulación y mejorando transparencia regulatoria.

