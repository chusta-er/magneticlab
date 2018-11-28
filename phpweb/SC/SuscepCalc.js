var BOTON=0;
function bt_pulsado(){
	if(document.getElementById("rtierra").value != "" || document.getElementById("rluna").value != "" || document.getElementById("rmarte").value != "")
    	{
		document.getElementById('boton').style.display = 'none';
		document.getElementById('rtierra').style.display = 'none';
		document.getElementById('rluna').style.display = 'none';
		document.getElementById('rmarte').style.display = 'none';
		document.getElementById('Values').style.display = 'inherit';
		generar_tabla();
		document.getElementById('botonRecargar').style.visibility = 'visible';
		document.getElementById('Tresultado').style.display = 'inherit';
	}
}

function bt_tierra() {
	document.getElementById('rtierra').style.visibility = 'visible';
	document.getElementById('rluna').style.display = 'none';
	document.getElementById('rmarte').style.display = 'none';
	document.getElementById('boton').style.visibility = 'visible';
	document.getElementById('bt_tierra').style.background = '#2196F3';
	document.getElementById('bt_tierra').style.color = 'white';
	if(BOTON == "L" || BOTON == "M")
	{
		document.getElementById('botonRecargar').style.visibility = 'visible';
		document.getElementById('boton').style.display = 'none';
	}
	BOTON = "T";
}

function bt_luna() {
	document.getElementById('rluna').style.visibility = 'visible';
	document.getElementById('rtierra').style.display = 'none';
	document.getElementById('rmarte').style.display = 'none';
	document.getElementById('boton').style.visibility = 'visible';
	document.getElementById('bt_luna').style.background = 'grey';
	document.getElementById('bt_luna').style.color = 'white';
	if(BOTON == "T" || BOTON == "M")
	{
		document.getElementById('botonRecargar').style.visibility = 'visible';
		document.getElementById('boton').style.display = 'none';
	}
	BOTON = "L";
}

function bt_marte() {
	document.getElementById('rmarte').style.visibility = 'visible';
	document.getElementById('rtierra').style.display = 'none';
	document.getElementById('rluna').style.display = 'none';
	document.getElementById('boton').style.visibility = 'visible';
	document.getElementById('bt_marte').style.background = '#f44336';
	document.getElementById('bt_marte').style.color = 'white';
	if(BOTON == "T" || BOTON == "L")
	{
		document.getElementById('botonRecargar').style.visibility = 'visible';
		document.getElementById('boton').style.display = 'none';
	}
	BOTON = "M";
}

function generar_tabla() {
	
	// Cargar array de valores del cuerpo celeste seleccionado
	
	if(document.getElementById("rtierra").value != "")
	{
		var roca = document.getElementById("rtierra").value;
		var rT = valoresTierra(roca);
	}
	
	if(document.getElementById("rluna").value != "")
	{
		var roca = document.getElementById("rluna").value;
		var rT = valoresLuna(roca);
	}
	
	if(document.getElementById("rmarte").value != "")
	{
		var roca = document.getElementById("rmarte").value;
		var rT = valoresMarte(roca);
	}
	
	// Obtener la referencia del elemento body
	var body = document.getElementById("aqui");
	
	// Crea un elemento <table> y un elemento <tbody>
	var tabla = document.createElement("table");
	var tblBody = document.createElement("tbody");
	
	// Ponemos en una celda el nombre de la roca que se esta usando
	var nombreRoca = document.createElement("tr");
	var nRoca = document.createElement("td");
	var textoRoca = document.createTextNode(roca);
	nRoca.appendChild(textoRoca);
	nombreRoca.appendChild(nRoca);
	tblBody.appendChild(nombreRoca);
	
	// Añadimos los nombres de las celdas 
	var enunciado = document.createElement("tr");
	
	for (var i=0; i<6; i++)
	{
		
		var enunc = ["Mineral", "Fórmula", "Wt%min", "Wt%max", "Xmin(SI)", "Xmax(SI)"];
		var en = document.createElement("td");
		var textoEn = document.createTextNode(enunc[i]);
		
		en.appendChild(textoEn);
		enunciado.appendChild(en);
		tblBody.appendChild(enunciado);
	}
	
	// Crea las celdas
	for(var i=0; (8*i)<rT.length; i++)
	{
		// Creamos la hilera
		var hilera = document.createElement("tr");
		
		for(var j=0; j<1; j++)
		{
			// Variables de los distintos campos
			var mineral = document.createElement("td");
			var textoMineral = document.createTextNode(rT[8*i]);
			var formula = document.createElement("td");
			var textoFormula = document.createTextNode(rT[(8*i)+1]);
			var wtmin = document.createElement("td");
			var textoWtmin = document.createTextNode(rT[(8*i)+2]);
			var wtmax = document.createElement("td");
			var textoWtmax = document.createTextNode(rT[(8*i)+3]);
			var xmin =  document.createElement("td");
			var textoXmin = document.createTextNode(rT[(8*i)+5]);
			var xmax = document.createElement("td");
			var textoXmax = document.createTextNode(rT[(8*i)+6]);
			
			mineral.appendChild(textoMineral);
			formula.appendChild(textoFormula);
			wtmin.appendChild(textoWtmin);
			wtmax.appendChild(textoWtmax);
			xmin.appendChild(textoXmin);
			xmax.appendChild(textoXmax);
			hilera.appendChild(mineral);
			hilera.appendChild(formula);
			hilera.appendChild(wtmin);
			hilera.appendChild(wtmax);
			hilera.appendChild(xmin);
			hilera.appendChild(xmax);
			
		}
		
		tblBody.appendChild(hilera);
	}
	
	tabla.appendChild(tblBody);
	body.appendChild(tabla);
	
	myValues(rT);

	document.getElementById("info").innerHTML = "(*Las celdas con valor NA son valores no conocidos, por defecto se trata como 0)";

}

function myValues(variable){
	
	var rT = variable;
	var i = 0;

	for(var x = 0; (8*x)<rT.length; x++)
	{
		p = "p" + i;
		document.getElementById(p).value = rT[8*x];
		p = "p" + (i+1);
		document.getElementById(p).value = rT[(8*x)+1];
		i = i + 2;
		if(rT[(8*x)+2] == rT[(8*x)+3] && document.getElementById("suggested").checked == true)
		{
			m = "mineral" + (x+1);
			document.getElementById(m).value = rT[(8*x)+2];
		}
		if(rT[(8*x)+5] == rT[(8*x)+6] && document.getElementById("suggested").checked == true)
		{
			m = "mineral" + (x+1) + "2";
			if(rT[(8*x)+5] == "NA")
			{
				document.getElementById(m).value = 0;
			}else{
				document.getElementById(m).value = rT[(8*x)+5];
			}
		}
	}
	for(var j = (i/2)+1; j < 8; j++)
    {
    	f = "f" + j;
        document.getElementById(f).style.display = 'none';
    }
}

function valoresTierra(roca){
	
	var rTierra = ["Basalt plataform lavas", "Basalt2",  "Island Arc Basalt", "Cont. Marg. Basalt"];
	
	// Basalt plataform lavas
	if(roca == rTierra[0])
	{
		var rT = ['Magnetita','Fe3O4','1','7.5','0','2','5.6','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','11.5','60.6','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','0.6','13.2','0','0.001','0','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','21.8','58.8','0','0','0','0'];
		return (rT);
	}
	
	// Basalt2
	if(roca == rTierra[1])
	{
		var rT = ['Magnetita','Fe3O4','3','5','0','2','5.6','0',
                'Clinopyroxene','Ca(Fe,Mg)Si2O6','15','25','0','0.000555','0.0013','0',
                'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','50','60','0','0','0','0'];
		return (rT);
	}
	
	// Island Arc Basalt
	if(roca == rTierra[2])
	{
		var rT = ['Magnetita','Fe3O4','0.4','0.4','0','2','5.6','0',
                'Clinopyroxene','Ca(Fe,Mg)Si2O6','4.7','4.7','0','0.000555','0.0013','0',
                'Olivine','(Fe,Mg)2SiO4','4','4','0','0','0.001','0',
                'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','20','20','0','0','0','0'];
		return (rT);
	}
	
	// Cont. Marg. Basalt
	if(roca == rTierra[3])
	{
		var rT = ['Magnetita','Fe3O4','0.2','0.2','0','2','5.6','0',
                'Clinopyroxene','Ca(Fe,Mg)Si2O6','2.7','2.7','0','0.000555','0.0013','0',
                'Olivine','(Fe,Mg)2SiO4','4','4','0','0.001','0','0',
                'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','15','15','0','0','0','0'];
		return (rT);
	}
	
}

function valoresLuna(roca) {
	
	var rLuna = ['Basalt Type A','Gabro Type B','Anorthosite','Dunite'];
	
	// Basalt Type A
	if(roca == rLuna[0])
	{
		var rL = ['Ilmenite','FeTiO3','10','18','0','0.00804','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','50','59','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','0.001','7','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','20','29','0','NA','NA','0',
                 'Quartz','SiO2','0.0001','1','0','-0.00015','NA','0'];
		return (rL);
	}
	
	// Gabro Type B
	if(roca == rLuna[1])
	{
		var rL = ['Ilmenite','FeTiO3','10','14','0','0.00804','NA','0',
                'Clinopyroxene','Ca(Fe,Mg)Si2O6','45','52','0','0.000555','0.0013','0'];
		return (rL);
	}
	
	// Anorthosite
	if(roca == rLuna[2])
	{
		var rL = ['Clinopyroxene','Ca(Fe,Mg)Si2O6','0.05','0.3','0','0.000555','0.0013','0',
                'Ortopyroxene','(Fe,Mg)2SiO6','0.4','1.7','0','0.0037','NA','0',
                'Alcalifeldespar','(Ca,K)(AlSi)4O3','72','99.6','0','-0.00013','0','0'];
		return (rL);
	}
	
	// Dunite
	if(roca == rLuna[3])
	{
		var rL = ['Clinopyroxene','Ca(Fe,Mg)Si2O6','1','1','0','0.000555','0.0013','0',
                'Ortopyroxene','(Fe,Mg)2SiO6','2.1','2.1','0','0.0037','NA','0',
                 'Olivine','(Fe,Mg)2SiO4','93','93','0','0.001','NA','0'];
		return (rL);
	}
}

function valoresMarte(roca) {
	
	var rMarte = ['Olivine Clinopyroxenite','Gabro','Basalt','Lherzolite','Nakhla','NWA 817','Shergotty','Zagami',
    'EETA79001B','QUE94201','Los Angeles','NWA 480','ALH77005','LEW88516','GRV99027','NWA1950',
    'EETA79001A','DaG476','Sau005','Dhofar019','Chassigny','NWA2737','ALH84001','Humphrey(Gusev)',
    'Irvine(Gusev)','Wishstone(Gusev)','Backstay(Gusev)','Jahe_M(Gusev)','Bathurst(Gusev)','Gusev Soil','Meridiani Soil'];
	
	// Olivine Clinopyroxenite
	if(roca == rMarte[0])
	{
		var rM = ['Pyrrhotite','Fe7S8','0.2','0.2','0','0.001','0.23','0',
                 'Ilmenite','FeTiO3','0.1','0.1','0','0.00804','NA','0',
                 'Chromite','FeCr204','0.9','0.9','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','53','53','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','31','31','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','8.6','8.6','0','NA','NA','0'];
		return (rM);
	}
	
	// Gabro
	if(roca == rMarte[1])
	{
		var rM = ['Pyrrhotite','Fe7S8','0.1','0.1','0','0.001','0.23','0',
                 'Ilmenite','FeTiO3','0.1','0.1','0','0.00804','NA','0',
                 'Chromite','FeCr204','1','1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','58.2','58.2','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','22.1','22.1','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','13.7','13.7','0','NA','NA','0'];
		return (rM);
	}
	
	// Basalt
	if(roca == rMarte[2])
	{
		var rM = ['Pyrrhotite','Fe7S8','0','0.6','0','0.001','0.23','0',
                 'Chromite','FeCr204','0.6','0.6','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','55.3','64.6','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','10.4','24','0','0.001','NA','0',
                 'Ortopyroxene','(Fe,Mg)2SiO6','1.5','4','0','0.0037','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','1.5','1.5','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','12','17','0','NA','NA','0'];
		return (rM);
	}
	
	// Lherzolite
	if(roca == rMarte[3])
	{
		var rM = ['Pyrrhotite','Fe7S8','1','1','0','0.001','0.23','0',
                 'Chromite','FeCr204','0.8','3','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','20','42.5','0','0.000555','1.3e-3','0',
                 'Olivine','(Fe,Mg)2SiO4','39.2','55','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','0.9','1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','10','16','0','NA','NA','0'];
		return (rM);
	}
	
	// Nakhla
	if(roca == rMarte[4])
	{
		var rM = ['Magnetita','Fe3O4','2','2','0','2','5.6','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','78','78','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','15','15','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','0.1','0.1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','NA','4','0','NA','NA','0'];
		return (rM);
	}
	
	// NWA 817
	if(roca == rMarte[5])
	{
		var rM = ['Magnetita','Fe3O4','1','1','0','2','5.6','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','76','76','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','15','15','0','0.001','NA','0'];
		return (rM);
	}
	
	// Shergotty
	if(roca == rMarte[6])
	{
		var rM = ['Chromite','FeCr204','2.5','2.5','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','60','71','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','0.3','0.3','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','1','1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','23','23','0','NA','NA','0'];
		return (rM);
	}
	
	// Zagami
	if(roca == rMarte[7])
	{
		var rM = ['Chromite','FeCr204','2.6','2.6','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','80','80','0','0.000555','0.0013','0',
                 'Ca-Phosphate(Merrillite)','Apatite','1.3','1.3','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','10','10','0','NA','NA','0'];
		return (rM);
	}
	
	// EETA79001B
	if(roca == rMarte[8])
	{
		var rM = ['Magnetita','Fe3O4','3.5','3.5','0','2','5.6','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','59','59','0','0.000555','0.0013','0',
                 'Ca-Phosphate(Merrillite)','Apatite','0.4','0.4','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','29','29','0','NA','NA','0'];
		return (rM);
	}
	
	// QUE94201
	if(roca == rMarte[9])
	{
		var rM = ['Magnetita','Fe3O4','3','3','0','2','5.6','0',
                 'Chromite','FeCr204','1','1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','43','43','0','0.000555','0.0013','0',
                 'Ca-Phosphate(Merrillite)','Apatite','6','6','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','42','42','0','NA','NA','0'];
		return (rM);
	}
	
	// Los Angeles
	if(roca == rMarte[10])
	{
		var rM = ['Magnetita','Fe3O4','1','1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','41','41','0','0.000555','0.0013','0',
                 'Ca-Phosphate(Merrillite)','Apatite','1','1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','54','54','0','NA','NA','0'];
		return (rM);
	}
	
	// NWA 480
	if(roca == rMarte[11])
	{
		var rM = ['Chromite','FeCr204','1','1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','72','72','0','0.000555','0.0013','0',
                 'Ca-Phosphate(Merrillite)','Apatite','1','1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','25','25','0','NA','NA','0'];
		return (rM);
	}
	
	// ALH77005
	if(roca == rMarte[12])
	{
		var rM = ['Chromite','FeCr204','2.1','2.1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','17','17','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','61','61','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','12','12','0','NA','NA','0'];
		return (rM);
	}
	
	// LEW88516
	if(roca == rMarte[13])
	{
		var rM = ['Chromite','FeCr204','3','3','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','22','22','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','57','57','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','NA','0.9','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','16','16','0','NA','NA','0'];
		return (rM);
	}
	
	// GRV99027
	if(roca == rMarte[14])
	{
		var rM = ['Chromite','FeCr204','1.1','1.1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','55','55','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','39','39','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','4.4','4.4','0','NA','NA','0'];
		return (rM);
	}
	
	// NWA1950
	if(roca == rMarte[15])
	{
		var rM = ['Chromite','FeCr204','0.1','0.1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','35','35','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','55','55','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','8','8','0','NA','NA','0'];
		return (rM);
	}
	
	// EETA79001A
	if(roca == rMarte[16])
	{
		var rM = ['Chromite','FeCr204','3','3','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','63','63','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','9','9','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','NA','0.2','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','17','17','0','NA','NA','0'];
		return (rM);
	}
	
	// DaG476
	if(roca == rMarte[17])
	{
		var rM = ['Chromite','FeCr204','2','2','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','60','60','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','15','15','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','NA','1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','15','15','0','NA','NA','0'];
		return (rM);
	}
	
	// Sau005
	if(roca == rMarte[18])
	{
		var rM = ['Chromite','FeCr204','1','1','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','53','53','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','25','25','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','NA','0.1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','17','17','0','NA','NA','0'];
		return (rM);
	}
	
	// Dhofar019
	if(roca == rMarte[19])
	{
		var rM = ['Chromite','FeCr204','1.8','1.8','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','60','60','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','10','10','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','24','24','0','NA','NA','0'];
		return (rM);
	}
	
	// Chassigny
	if(roca == rMarte[20])
	{
		var rM = ['Chromite','FeCr204','1.4','1.4','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','5','5','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','89','89','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','2','2','0','NA','NA','0'];
		return (rM);
	}
	
	// NWA2737
	if(roca == rMarte[21])
	{
		var rM = ['Chromite','FeCr204','4.6','4.6','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','4','4','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','81','81','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','NA','0.2','0','NA','NA','0'];
		return (rM);
	}
	
	// ALH84001
	if(roca == rMarte[22])
	{
		var rM = ['Chromite','FeCr204','2','2','0','NA','NA','0',
                 'Ortopyroxene','(Fe,Mg)2SiO6','91','91','0','0.0037','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','NA','0.15','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','1','1','0','NA','NA','0'];
		return (rM);
	}
	
	// Humphrey(Gusev)
	if(roca == rMarte[23])
	{
		var rM = ['Magnetita','Fe3O4','2','2','0','2','5.6','0',
                 'Chromite','FeCr204','3','3','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','25','25','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','23','23','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','1','1','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','36','36','0','NA','NA','0'];
		return (rM);
	}
	
	// Irvine(Gusev)
	if(roca == rMarte[24])
	{
		var rM = ['Magnetita','Fe3O4','3','3','0','2','5.6','0',
                 'Chromite','FeCr204','6','6','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','36','36','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','5','5','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','2','2','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','30','30','0','NA','NA','0'];
		return (rM);
	}
	
	// Wishstone(Gusev)
	if(roca == rMarte[25])
	{
		var rM = ['Magnetita','Fe3O4','2','2','0','2','5.6','0',
                 'Chromite','FeCr204','6','6','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','13','13','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','7','7','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','10','10','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','44','44','0','NA','NA','0'];
		return (rM);
	}
	
	// Backstay(Gusev)
	if(roca == rMarte[26])
	{
		var rM = ['Magnetita','Fe3O4','3','3','0','2','5.6','0',
                 'Chromite','FeCr204','5','5','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','18','18','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','11','11','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','3','3','0','NA','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','45','45','0','NA','NA','0'];
		return (rM);
	}
	
	// Jahe_M(Gusev)
	if(roca == rMarte[27])
	{
		var rM = ['Magnetita','Fe3O4','2','2','0','2','5.6','0',
                 'Chromite','FeCr204','2','2','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','19','19','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','13','13','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','3','3','0','NA','NA','0',
                  'Alcalifeldespar','[Na,K](AlSi)4O3','10','10','0','-1.3e-4','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','44','44','0','NA','NA','0'];
		return (rM);
	}
	
	// Bathurst(Gusev)
	if(roca == rMarte[28])
	{
		var rM = ['Magnetita','Fe3O4','2','2','0','2','5.6','0',
                 'Chromite','FeCr204','5','5','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','20','20','0','0.000555','0.0013','0',
                 'Olivine','(Fe,Mg)2SiO4','23','23','0','0.001','NA','0',
                 'Ca-Phosphate(Merrillite)','Apatite','2','2','0','NA','NA','0',
                  'Alcalifeldespar','[Na,K](AlSi)4O3','9','9','0','-0.00013','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','23','23','0','NA','NA','0'];
		return (rM);
	}
	
	// Gusev Soil
	if(roca == rMarte[29])
	{
		var rM = ['Magnetita','Fe3O4','0.1','0.1','0','2','5.6','0',
                 'Chromite','FeCr204','0.2','0.2','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','0','0','0','0.000555','0.0013','0',
                 'Ortopyroxene','(Fe,Mg)2SiO6','37','37','0','3.7e-3','NA','0',
                 'Olivine','(Fe,Mg)2SiO4','24','24','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','23','23','0','NA','NA','0'];
		return (rM);
	}
	
	// Meridiani Soil
	if(roca == rMarte[30])
	{
		var rM = ['Magnetita','Fe3O4','0.2','0.2','0','2','5.6','0',
                 'Chromite','FeCr204','0.3','0.3','0','NA','NA','0',
                 'Clinopyroxene','Ca(Fe,Mg)Si2O6','7','7','0','0.000555','0.0013','0',
                 'Ortopyroxene','(Fe,Mg)2SiO6','23','23','0','0.0037','NA','0',
                 'Olivine','(Fe,Mg)2SiO4','18','18','0','0.001','NA','0',
                 'Plagioclase','NaAlSi3O8 - CaAl2Si2O8','28','28','0','NA','NA','0'];
		return (rM);
	}
	
	
	
}
//Funcion para ver cual de las opciones se ha elegido si Personal Values o Suggested Values
function OptPerSug(){
	
	var Personal = document.getElementById("personal").checked;
	var Suggested = document.getElementById("suggested").checked;
	
	if(document.getElementById("rtierra").value != "")
	{
		var roca = document.getElementById("rtierra").value;
		var rT = valoresTierra(roca);
	}
	
	if(document.getElementById("rluna").value != "")
	{
		var roca = document.getElementById("rluna").value;
		var rT = valoresLuna(roca);
	}
	
	if(document.getElementById("rmarte").value != "")
	{
		var roca = document.getElementById("rmarte").value;
		var rT = valoresMarte(roca);
	}
	
	if (Personal == true)
	{
		//Funcion de Personal Values
		PersonalValues(rT);
	}
	if (Suggested == true)
	{
		//Funcion de Suggested Values
		SuggestedValues(rT);
	}
	
}

//Funcion para usar los Suggested Values
function SuggestedValues(rT){
	
	var resultado = 0;
	var wt = 0;
	var rango = 0;
	
	for(var i = 1; (8*(i-1))<rT.length; i++)
	{
		var m1 = "mineral" + i;
		var m2 = "mineral" + i + "2";

		if (document.getElementById(m1).value != "")
		{
			var mineral_1 = document.getElementById(m1).value;
			
			if(rT[8*(i-1)+2] > mineral_1 || rT[8*(i-1)+3] < mineral_1)
			{
				rango = 1; // Como flag para que no escriba un valor erroneo en el resultado
				document.getElementById(m1).style.background = 'red';
			}else
			{
				wt = wt + (1*mineral_1);
				document.getElementById(m1).style.background = 'white';
			}
			
			if(document.getElementById(m2).value != "")
			{
				var mineral_2 = document.getElementById(m2).value;

				for( var j=2; j<7; j++)
				{
					if(rT[8*(i-1)+j] == "NA")
					{
						rT[8*(i-1)+j] = 0;
					}
				}
				if(rT[8*(i-1)+5] > rT[8*(i-1)+6])
				{
					var aux = rT[8*(i-1)+5];
					rT[8*(i-1)+5] = rT[8*(i-1)+6];
					rT[8*(i-1)+6] = aux;
				}
				if(rT[8*(i-1)+5] > mineral_2 || rT[8*(i-1)+6] < mineral_2)
				{
					rango = 1; // Como flag para que no escriba un valor erroneo en el resultado
					document.getElementById(m2).style.background = 'red';
				}else
				{
					resultado = resultado + mineral_1*mineral_2;
					document.getElementById(m2).style.background = 'white';
				}
			}
		}
	}
	if(resultado == "")
	{
		if(rango == 1)
		{
			window.alert("Los valores estan fuera del rango que se permiten para valores sugeridos");
		}else
		{
			window.alert("Rellene los campos del Volumen, Wt% = ?, y de la Susceptibilidad, X (SI) = ?");
			document.getElementById("Resultado").value = "";
		}
	}else{
		if(wt > 100)
		{
			document.getElementById("Wt").value = "Wt % = " + wt;
			window.alert("Wt% > 100");
		}else
		{
			if(rango == 1)
            {
				window.alert("Los valores estan fuera del rango que se permiten para valores sugeridos");
            	document.getElementById("Resultado").value = "";
            }else
            {
				document.getElementById("Resultado").value = "Resultado = " + resultado/100;
				document.getElementById("Wt").value = "Wt % = " + wt;
            	grafica(rT);
           	}
		}
	}
}

//Funcion para usar los Personal Values
function PersonalValues(rT){
	
	var resultado = 0;
	var wt = 0;
	var rango = 0;
	
	for(var i = 1; (8*(i-1))<rT.length; i++)
	{
		var m1 = "mineral" + i;
		var m2 = "mineral" + i + "2";
		if (document.getElementById(m1).value != "")
		{
			var mineral_1 = document.getElementById(m1).value;

			if(mineral_1 < 0)
			{
				rango = 1; // Como flag para que no escriba un valor erroneo en el resultado
				document.getElementById(m1).style.background = 'red';
				mineral_1 = "";
			}else
			{
				wt = wt + (1*mineral_1);
				document.getElementById(m1).style.background = 'white';
			}

			if(document.getElementById(m2).value != "")
			{
				var mineral_2 = document.getElementById(m2).value;
				resultado = resultado + mineral_1*mineral_2;
			}
			//wt = wt + (1*mineral_1);
		}
		
	}
	if(resultado == "")
	{
		if(rango == 1)
		{
			window.alert("Hay valores negativos en el Volumen (Wt%)");
		}else
		{
			window.alert("Rellene los campos del Volumen, Wt% = ?, y de la Susceptibilidad, X (SI) = ?");
			document.getElementById("Resultado").value = "";
		}
	}else{
		if(wt > 100)
		{
			document.getElementById("Wt").value = "Wt % = " + wt;
			window.alert("El Volumen (Wt%) supera el 100%");
		}else
		{
			if(rango == 1)
			{
				window.alert("Hay valores negativos en el Volumen (Wt%)");
			}else{
				document.getElementById("Resultado").value = "Resultado = " + resultado/100;
				document.getElementById("Wt").value = "Wt % = " + wt;
				grafica(rT);
			}
		}
	}
}
function restaurar()
{
	var i = 0;
	document.getElementById("rtierra").value = "";
	document.getElementById("rluna").value = "";
	document.getElementById("rmarte").value = "";
	
	for(var x = 0; x < 8; x++)
	{
		p = "p" + i;
		document.getElementById(p).value = "";
		p = "p" + (i+1);
		document.getElementById(p).value = "";
		i = i + 2;
		
		var m1 = "mineral" + (x+1);
		var m2 = "mineral" + (x+1) + "2";

		document.getElementById(m1).value = "";
		document.getElementById(m2).value = "";
	}
}

function grafica(tam) {

	var volumen = [ '0' ];
	var nombre = [ 'Inicio' ];
	for ( var x = 0; x < 7; x++)
	{
		var m1 = "mineral" + (x+1);
		var aux = document.getElementById(m1).value;
	    if (8*x < tam.length)
	    {
	    	nombre.push(tam[8*x]);
	    }else
	    {
	    	nombre.push(" ");
	    }
	    if (aux != "")
	    {
			volumen.push(aux);
	    }else
	    {
	    	volumen.push(0);
	    }
	}
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 500, 500);
	// Lineas de los ejes
	ctx.fillStyle = "white";
	// Línea vertical (x, y, tam, z)
	ctx.fillRect(28,82,2,200);
	// Línea horizontal (x, y, z, tam) donde empieza en x hasta y, hasta donde llega en z y con que tam
	ctx.fillRect(8,282,442,2);
	// Escala
	ctx.font = "10px Arial";
	var j = 85;
	var c = 100;
	while( j != 305)
	{
		ctx.fillText(c,0,j);
	    j = j + 20;
	    c = c - 10;
	}
	var i=82;
	while( i != 302)
	{
		ctx.fillRect(18,i,10,2);
	    i = i +20;
	}
	// ----
	// Color
	ctx.fillStyle = "#3399ff";
	ctx.fillRect(30,282-2*volumen[1],60,2*volumen[1]);
	// Leyenda
	ctx.font = "15px Arial";
	ctx.fillText(nombre[1],480,80);
	// Porcentajes
	ctx.fillText(volumen[1] + "%",40,80);
	// ----
	ctx.fillStyle = "#66ffff";
	ctx.fillRect(90,282-2*volumen[2],60,2*volumen[2]);
	ctx.fillText(nombre[2],480,110);
	ctx.fillText(volumen[2] + "%",100,80);
	// ----
	ctx.fillStyle = "#66ff66";
	ctx.fillRect(150,282-2*volumen[3],60,2*volumen[3]);
	ctx.fillText(nombre[3],480,140);
	ctx.fillText(volumen[3] + "%",160,80);
	// ----
	ctx.fillStyle = "#99ff99";
	ctx.fillRect(210,282-2*volumen[4],60,2*volumen[4]);
	ctx.fillText(nombre[4],480,170);
	ctx.fillText(volumen[4] + "%",220,80);
	// ----
	ctx.fillStyle = "#3399ff";
	ctx.fillRect(270,282-2*volumen[5],60,2*volumen[5]);
	ctx.fillText(nombre[5],480,200);
	ctx.fillText(volumen[5] + "%",280,80);
	// ----
	ctx.fillStyle = "#66ffff";
	ctx.fillRect(330,282-2*volumen[6],60,2*volumen[6]);
	ctx.fillText(nombre[6],480,230);
	ctx.fillText(volumen[6] + "%",340,80);
	// ----
	ctx.fillStyle = "#66ff66";
	ctx.fillRect(390,282-2*volumen[7],60,2*volumen[7]);
	ctx.fillText(nombre[7],480,260);
	ctx.fillText(volumen[7] + "%",400,80);
}

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function PreSumaWt() {
	var presuma = 0;
	
	for(var i = 1; i < 8; i++)
	{
		presuma = presuma + 1*document.getElementById("mineral" + i).value;
	}
	
	document.getElementById("Wt").value = "Wt % = " + presuma;
}