<!DOCTYPE html>
<html>
<!--!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"-->
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Laboratorio de Magnetismo Espacial</title>
<script type="text/javascript" src="/sources/jscharts.js"></script>
<link href="Menu.css" title="text/css" rel="stylesheet" />
</head>
<body>
	<div id="contenedor" style="margin:20px 80px; background-color: #b3d9ff;">
    <br />
		<h1 align="center">LABORATORIO DE MAGNETISMO ESPACIAL&emsp;<a href="../Index.html"><img height="100" width="100" src="../Images/logo-inta.png" /></a></h1>
    	<br />
        <div class="navbar">
			<a class="active">Campo Magnético Terrestre</a>
		<a href="../EM/EM.html">Ensayos Magnéticos</a>
		<a href="../PID/PID.html">Proyectos I+D</a>
		<a href="../SM/SM.html">Susceptibilidad Magnética</a>
		</div>
        <br />
        <br />
        <h2 style="margin:20px 80px">Campo Magnético Terrestre</h2>
        <div id"descripcion" style="margin-left:90px; margin-right:90px">
    		<p align="left">Las medidas del campo magnético terrestre se realizan en el Laboratorio de Ensayos Magnéticos en tiempo real. Mediante un sensor, un circuito de adquisición y un ordenador que procesa los datos medidos y se presentan en una página web. Se miden los valores de campo magnético con referencia al norte geográfico (Bx,  By, Bz), además de su módulo y la declinación (ángulo entre el norte magnético y el norte geográfico). <!--La información puede consultarse en la siguiente dirección de internet: <a href="http://magneticlab.inta.es/">http://magneticlab.inta.es/</a>--></p>
        </div>
		<br />
		<br />
		<div id="graph" align="center">Loading graph...</div>
            <!--iframe src="../bfield.php" width="100%" frameborder=1 scrolling=yes></iframe-->
<?php
    //echo "<script type='text/javascript'>";
    // Abrir fichero que contiene los datos
    $dbconn = pg_connect("dbname=magneticter") or die("cannot connet to DB!");
    //$arr2 = array();
    //$j = 0;
    //$i = 0;
    //echo "var myData = new Array();";

    $result = pg_query($dbconn, "select * from web_magnetic_info;");
    var_dump(pg_fetch_all($result));
    pg_close($dbconn)
/*
    // Mientras no se llega al final del fichero
    while (!feof($var))
          {
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
		//echo "myChart.setTooltip([$i, 'Bx = $arr2[$i]']);"; //(Etiquetas con valores en cada hora)
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
*/
?>
        <br />
    </div>
</body>
</html>
