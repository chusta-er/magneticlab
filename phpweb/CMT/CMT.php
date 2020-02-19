<!DOCTYPE html>
<html>
<!--!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"-->
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Laboratorio de Magnetismo Espacial</title>
<!--script type="text/javascript" src="/sources/jscharts.js"></script -->
<!--script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.js"></script -->
<link href="Menu.css" title="text/css" rel="stylesheet" />
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> 
</head>
<body>
	<div id="contenedor" style="margin:20px 80px; background-color: #b3d9ff;">
        <br />
		<h1 align="center">LABORATORIO DE MAGNETISMO ESPACIAL&emsp;<a href="/"><img height="100" width="100" src="../Images/logo-inta.png" /></a></h1>
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
        <div id="descripcion" style="margin-left:90px; margin-right:90px">
    		<p align="left">Las medidas del campo magnético terrestre se realizan en el Laboratorio de Ensayos Magnéticos en tiempo real. Mediante un sensor, un circuito de adquisición y un ordenador que procesa los datos medidos y se presentan en una página web. Se miden los valores de campo magnético con referencia al norte geográfico (Bx,  By, Bz), además de su módulo y la declinación (ángulo entre el norte magnético y el norte geográfico). <!--La información puede consultarse en la siguiente dirección de internet: <a href="http://magneticlab.inta.es/">http://magneticlab.inta.es/</a>--></p>
        </div>
		<br />
        <div class="w3-container w3-center">
            <div class="w3-panel w3-sand w3-center w3-round-xlarge">
                <p><a href="/grafana"><input type="button" value="Visualizar datos magnéticos"/></a></p>
            </div>
        </div>
		<br />
        <!--canvas id="chartjs-0" class="chartjs" width="770" height="385" style="display: block; width: 770px; height: 385px;" >Loading graph...</canvas -->
        <script type="text/javascript" >
        <!-- ?php
            $dbconn = pg_connect("dbname=magneticter") or die("cannot connet to DB!");

            $result = pg_query($dbconn, "select * from web_magnetic_info;");
            $all_data = pg_fetch_all($result);
            $numrows = count($all_data);
            $txt_B = ""; $txt_Bx = ""; $txt_Bz = ""; $txt_Bz = "";
            for ( $i = 0; $i < $numrows - 1; $i++ )
                {
                $txt_B .= "{$all_data[$i]["b_median"]},";
                $txt_Bx .= "{$all_data[$i]["b_median_x"]},";
                $txt_By .= "{$all_data[$i]["b_median_y"]},";
                $txt_Bz .= "{$all_data[$i]["b_median_z"]},";
                }
            $txt_B .= "{$all_data[$i]["b_median"]}";
            $txt_Bx .= "{$all_data[$i]["b_median_x"]}";
            $txt_By .= "{$all_data[$i]["b_median_y"]}";
            $txt_Bz .= "{$all_data[$i]["b_median_z"]}";
            pg_close($dbconn);

            //echo "magnetic_data=[{$txt_data}];";

            $dbconn = pg_connect("dbname=magneticter") or die("cannot connet to DB!");
        ? -->
        <!--
            new Chart(
               document.getElementById("chartjs-0"),
               {
               "type": "line",
               "data":
                   {
                   "labels": ["00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45",
                              "03:00", "03:15", "03:30", "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45",
                              "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45",
                              "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
                              "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45",
                              "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45",
                              "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45",
                              "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45", "24:00"],
                   "datasets":
                      [
                         {
                         "label": "|B| median",
                         "data": [<?php echo "{$txt_B}" ?>],
                         "fill": false,
                         "borderColor": "rgb(192, 192, 192)",
                         "lineTension": 0,
                         "showLines": false
                         },
                         {
                         "label": "B median, x",
                         "data": [<?php echo "{$txt_Bx}" ?>],
                         "fill": false,
                         "borderColor": "rgb(75, 192, 192)",
                         "lineTension": 0,
                         "showLines": false
                         },
                         {
                         "label": "B median, y",
                         "data": [<?php echo "{$txt_By}" ?>],
                         "fill": false,
                         "borderColor": "rgb(192, 75, 192)",
                         "lineTension": 0,
                         "showLines": false
                         },
                         {
                         "label": "B median, z",
                         "data": [<?php echo "{$txt_Bz}" ?>],
                         "fill": false,
                         "borderColor": "rgb(192, 192, 75)",
                         "lineTension": 0,
                         "showLines": false
                         }
                      ]
                   },
               "options": {}
               }
            );
        -->
        </script>
    </div>
</body>
</html>
