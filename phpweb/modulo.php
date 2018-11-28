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
	//$arr2[$j] = trim($cad[1]);
	$arr2[$j] = sqrt(trim($cad[0])*trim($cad[0]) + trim($cad[1])*trim($cad[1]) + trim($cad[2])*trim($cad[2]));
	//$arr2[$j] = trim(fgets($var));
	echo "myData[$j] = [$j, $arr2[$j]];";
	$j++;
 }
 fclose($var);
 //echo "window.alert(myData);";

	//echo "var myData = new Array([0, $arr2[0]], [1, $arr2[1]], [2, $arr2[2]], [3, $arr2[3]], [4, $arr2[4]], [5, $arr2[5]], [6, $arr2[6]], [7, $arr2[7]], [8, $arr2[8]], [9, $arr2[9]], [10, $arr2[10]], [11, $arr2[11]], [12, $arr2[12]], [13, $arr2[13]], [14, $arr2[14]], [15, $arr2[15]], [16, $arr2[16]], [17, $arr2[17]], [18, $arr2[18]], [19, $arr2[19]], [20, $arr2[20]], [21, $arr2[21]], [22, $arr2[22]], [23, $arr2[23]]);";	
	echo "var myChart = new JSChart('graph', 'line');";
	echo "myChart.setDataArray(myData);";
	echo "myChart.setTitle('Mod (Bx, By, Bz) (nT)');";
	//echo "myChart.setTitleColor('#006600');";
	echo "myChart.setTitleColor('#000000');";
	echo "myChart.setTitleFontSize(11);";
	echo "myChart.setAxisNameX('Tiempo (Horas)');";
	echo "myChart.setAxisNameY('');";
	/*echo "myChart.setAxisValuesNumberY(5);";
	echo "myChart.setIntervalStartY(-0.75);";
	echo "myChart.setIntervalEndY(-0.65);";*/
	//echo "myChart.setAxisColor('#006600');";
	echo "myChart.setAxisColor('#000000');";
	echo "myChart.setAxisValuesColor('#000000');";
	//echo "myChart.setAxisValuesColor('#949494');";
	echo "myChart.setAxisPaddingLeft(100);";
	echo "myChart.setAxisPaddingRight(100);";
	echo "myChart.setAxisPaddingTop(50);";
	echo "myChart.setAxisPaddingBottom(40);";
	echo "myChart.setAxisValuesDecimals(0);";
	echo "myChart.setAxisValuesNumberX(24);";
	echo "myChart.setShowXValues(false);";
	echo "myChart.setGridColor('#000000');";
	//echo "myChart.setGridColor('#C5A2DE');";
	echo "myChart.setLineColor('#000000');";
	//echo "myChart.setLineColor('#BBBBBB');";
	echo "myChart.setLineWidth(2);";
	echo "myChart.setFlagColor('#0080ff');";
	echo "myChart.setFlagRadius(4);";
	echo "myChart.setLabelColor('#000000');";
	$j = 0;
	while($j < 24)
	{
		echo "myChart.setLabelX([$i, '$j']);";
		//echo "myChart.setTooltip([$i, 'D = $arr2[$i]']);";
		$i = $i+2;
		$j++;
	}
	//echo "myChart.setSize(616, 321);";
	//echo "myChart.setSize(1200, 621);";
	echo "myChart.setSize(900, 400);";
	//echo "myChart.setBackgroundImage('chart_bg.jpg');";
	echo "myChart.draw();";

echo "</script>";
?>

</body>
</html>