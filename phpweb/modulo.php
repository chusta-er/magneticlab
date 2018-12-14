<html>
<head>

<title>Campo D</title>

<script type="text/javascript" src="sources/jscharts.js"></script>

</head>
<body>

<div id="graph">Loading graph...</div>

<?php
echo "<script type='text/javascript'>";
 $var = fopen("Campo.txt", "r") or die("No se puede abrir");
 $arr2 = array();
 $j = 0;
 $i = 0;
 echo "var myData = new Array();";
 while(!feof($var)){
	$cad = preg_split("/[\s,]+/", fgets($var));
	$arr2[$j] = sqrt(trim($cad[0])*trim($cad[0]) + trim($cad[1])*trim($cad[1]) + trim($cad[2])*trim($cad[2]));
	echo "myData[$j] = [$j, $arr2[$j]];";
	$j++;
 }
 fclose($var);
	
	echo "var myChart = new JSChart('graph', 'line');";
	echo "myChart.setDataArray(myData);";
	echo "myChart.setTitle('Mod (Bx, By, Bz) (nT)');";
	echo "myChart.setTitleColor('#000000');";
	echo "myChart.setTitleFontSize(11);";
	echo "myChart.setAxisNameX('Tiempo (Horas)');";
	echo "myChart.setAxisNameY('');";
	echo "myChart.setAxisColor('#000000');";
	echo "myChart.setAxisValuesColor('#000000');";
	echo "myChart.setAxisPaddingLeft(100);";
	echo "myChart.setAxisPaddingRight(100);";
	echo "myChart.setAxisPaddingTop(50);";
	echo "myChart.setAxisPaddingBottom(40);";
	echo "myChart.setAxisValuesDecimals(0);";
	echo "myChart.setAxisValuesNumberX(24);";
	echo "myChart.setShowXValues(false);";
	echo "myChart.setGridColor('#000000');";
	echo "myChart.setLineColor('#000000');";
	echo "myChart.setLineWidth(2);";
	echo "myChart.setFlagColor('#0080ff');";
	echo "myChart.setFlagRadius(4);";
	echo "myChart.setLabelColor('#000000');";
	$j = 0;
	while($j < 24)
	{
		echo "myChart.setLabelX([$i, '$j']);";
		//echo "myChart.setTooltip([$i, 'Mod = $arr2[$i]']);";
		$i = $i+2;
		$j++;
	}
	echo "myChart.setSize(900, 400);";
	echo "myChart.draw();";

echo "</script>";
?>

</body>
</html>