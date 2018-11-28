<html>
<head>

<title>Campo Bx</title>

<script type="text/javascript" src="sources/jscharts.js"></script>

</head>
<body>

<div id="graph">Loading graph...</div>

<?php
echo "<script type='text/javascript'>";
 // Abrir fichero que contiene los datos
 $var = fopen("Campo.txt", "r") or die("No se puede abrir");
 $arr2 = array();
 $j = 0;
 $i = 0;
 echo "var myData = new Array();";
 // Mientras no se llega al final del fichero
 while(!feof($var)){
	// Dividir la cada línea del fichero en campos distintos y copiar los datos en un array
	$cad = preg_split("/[\s,]+/", fgets($var));
	// Si queda algún espacio en blanco (en este caso en el primero campo que es Bx), lo eliminamos para que solo queden los valores y lo introducimos en el array
	$arr2[$j] = trim($cad[0]);
	// Pasamos el número de dato y el valor del Bx al array que usa la librería JSChart para representar en la gráfica
	echo "myData[$j] = [$j, $arr2[$j]];";
	$j++;
 }
 // Se cierra el fichero
 fclose($var);
	// Dibujamos el gráfico
	echo "var myChart = new JSChart('graph', 'line');";
	// Le añadimos los valores
	echo "myChart.setDataArray(myData);";
	// Le añadimos el título
	echo "myChart.setTitle('Campo Magnetico Bx (nT)');";
	// Ponemos el color del título
	echo "myChart.setTitleColor('#0000ff');";
	// Tamaño de la fuente
	echo "myChart.setTitleFontSize(11);";
	// Etiqueta del nombre del eje X e Y
	echo "myChart.setAxisNameX('Tiempo (Horas)');";
	echo "myChart.setAxisNameY('');";
	// Ponemos los distintos colores para la gráfica
	echo "myChart.setAxisColor('#0000ff');";
	echo "myChart.setAxisValuesColor('#000000');";
	// Introducimos los márgenes
	echo "myChart.setAxisPaddingLeft(100);";
	echo "myChart.setAxisPaddingRight(100);";
	echo "myChart.setAxisPaddingTop(50);";
	echo "myChart.setAxisPaddingBottom(40);";
	// Ponemos cuantos decimales queremos ver en las etiquetas del eje Y
	echo "myChart.setAxisValuesDecimals(0);";
	// Ponemos cuantos valores se van a representar en el eje X (24 horas)
	echo "myChart.setAxisValuesNumberX(24);";
	echo "myChart.setShowXValues(false);";
	echo "myChart.setGridColor('#000000');";
	// Color de las líneas de fondo del gráfico
	echo "myChart.setLineColor('#000000');";
	// Ancho de las líneas
	echo "myChart.setLineWidth(2);";
	// Color de las etiquetas con valores en cada hora en punto (Descomentar en el while para usar)
	echo "myChart.setFlagColor('#0080ff');";
	// Forma de las etiquetas, en círculo (Descomentar en el while para usar)
	echo "myChart.setFlagRadius(4);";
	// Color de las etiquetas
	echo "myChart.setLabelColor('#000000');";
	$j = 0;
	while($j < 24)
	{
		// Etiquetas del eje X, para que quede bien la escala debe tenerse en cuenta los datos que representa por hora con la variable i
		echo "myChart.setLabelX([$i, '$j']);";
		//echo "myChart.setTooltip([$i, 'H = $arr2[$i]']);"; //(Etiquetas con valores en cada hora)
		$i = $i+2; //(Dependiendo el valor que le sumemos a i, será la escala para las etiquetas, el valor sumado será el número de datos que se representa por hora
		$j++;
	}
	// Tamaño de la gráfica
	echo "myChart.setSize(900, 400);";
	// Añadir una imagen de fondo a la gráfica (Descomentar para activar)
	//echo "myChart.setBackgroundImage('chart_bg.jpg');";
	// Dibujar
	echo "myChart.draw();";

echo "</script>";
?>

</body>
</html>