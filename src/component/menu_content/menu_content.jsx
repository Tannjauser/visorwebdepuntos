import React, { useCallback } from "react";
import * as THREE from 'three';
import './menu_content.css';
import { returnedDots, realativeHeight, negativeRelaHeight, maxHeight, scene, jsonQuadTree, jsonMaterial, lasMaterial } from '../../container/threeJs/ThreeJs';
import { loadSkybox, restartTree, changeSelectionType, modificarClasificacion, setCameraPosition } from "../../container/threeJs/ThreeJs";
import { useDropzone } from 'react-dropzone';
import { LASLoader, options } from '@loaders.gl/las';
import { load } from '@loaders.gl/core';

export { renderDistanceValueOutput, sectorBoxDraw, bgColor, isSinglePointSelect };

var renderDistanceValueOutput = 1;
var sectorBoxDraw;
var bgColor;
var pointType;
var isSinglePointSelect = true;

window.addEventListener("load", function (e) {
    var slider = document.getElementById("pointSize");
    var sliderHeightPositive = document.getElementById("pointHeightPositive");
    var sliderHeightNegative = document.getElementById("pointHeightNegative");
    var renderDistanceSlider = document.getElementById("renderDistance")
    var colorIntensidadSlider = document.getElementById("colorIntensidadSlider");


    var groupColorClassDrop = document.getElementById("groupColorClassDrop")

    var colorDropDown = document.getElementById("colorDropDown");

    var pointsAppearence = document.getElementById("pointsAppearence");
    var pointsColor = document.getElementById("pointsColor");
    var visualizacion = document.getElementById("visualizacion");
    var selectPuntos = document.getElementById("selectPuntos");
    var puntoGroupSelect = document.getElementById("puntoGroupSelect");
    var sectorBox = document.getElementById("sectorBox");

    sliderHeightPositive.max = maxHeight;
    sliderHeightNegative.max = maxHeight;

    var output = document.getElementById("pointSizeValue");
    var outputHeight = document.getElementById("pointHeightPositiveValue");
    var outputNegativeHeight = document.getElementById("pointHeightNegativeValue");

    var colorSecundario = this.document.getElementById("colorSecundario");
    var colorPrimario = this.document.getElementById("colorPrimario");

    pointType = this.document.getElementById("pointType");
    pointType.innerHTML = "Punto único";
    isSinglePointSelect = true;

    colorSecundario.value = "#000000";
    colorPrimario.value = "#ffffff";


    var borderBox = document.getElementById("borderBox");

    document.getElementById("colorClasifNoClass").value = getColorMappedValue(0);
    document.getElementById("colorClasifNoAsig").value = getColorMappedValue(1);
    document.getElementById("colorClasifTerreno").value = getColorMappedValue(2);
    document.getElementById("colorClasifVegB").value = getColorMappedValue(3);
    document.getElementById("colorClasifVegM").value = getColorMappedValue(4);
    document.getElementById("colorClasifVegA").value = getColorMappedValue(5);
    document.getElementById("colorClasifEdificio").value = getColorMappedValue(6);
    document.getElementById("colorClasifPuntoB").value = getColorMappedValue(7);
    document.getElementById("colorClasifReservado").value = getColorMappedValue(8);
    document.getElementById("colorClasifAgua").value = getColorMappedValue(9);
    document.getElementById("colorClasifFerrocarril").value = getColorMappedValue(10);
    document.getElementById("colorClasifCarretera").value = getColorMappedValue(11);
    document.getElementById("colorClasifReservado2").value = getColorMappedValue(12);
    document.getElementById("colorClasifProtCable").value = getColorMappedValue(13);
    document.getElementById("colorClasifCondCable").value = getColorMappedValue(14);
    document.getElementById("colorClasifTorreTran").value = getColorMappedValue(15);
    document.getElementById("colorClasifCondEst").value = getColorMappedValue(16);
    document.getElementById("colorClasifPuente").value = getColorMappedValue(17);
    document.getElementById("colorClasifRuidoAlto").value = getColorMappedValue(18);



    var pointIntensityRange = document.getElementById("pointIntensityRange");
    var pointIntensityRangeValue = document.getElementById("pointIntensityRangeValue");
    pointIntensityRangeValue.innerHTML = pointIntensityRange.value;

    output.innerHTML = slider.value;
    outputHeight.innerHTML = sliderHeightPositive.value;
    outputNegativeHeight.innerHTML = sliderHeightNegative.value;

    pointIntensityRange.oninput = function () {
        pointIntensityRangeValue.innerHTML = this.value;
        if (this.value !== 0) {
            let valuetoAdd = 2 ** this.value;
            jsonMaterial.uniforms.intensityRange.value = valuetoAdd;
            lasMaterial.uniforms.intensityRange.value = valuetoAdd;

            jsonMaterial.uniforms.intensityRange.needsUpdate = true;
            lasMaterial.uniforms.intensityRange.needsUpdate = true;
        }
    }

    pointsAppearence.onclick = function () {
        document.getElementById("aparienciaContainer").classList.toggle("open");
    }

    pointsColor.onclick = function () {
        document.getElementById("colorContainer").classList.toggle("openLarge");
    }

    visualizacion.onclick = function () {
        document.getElementById("visualContainer").classList.toggle("open");
    }
    selectPuntos.onclick = function () {
        document.getElementById("selectPuntosContainer").classList.toggle("openLarge");
    }
    puntoGroupSelect.onclick = function () {
        document.getElementById("puntoGroupSelectContainer").classList.toggle("hidden");
    }




    slider.oninput = function () {
        output.innerHTML = this.value;
        jsonMaterial.uniforms.pointSize.value = this.value;
        lasMaterial.uniforms.pointSize.value = this.value;
    }
    sliderHeightPositive.oninput = function () {
        outputHeight.innerHTML = this.value;
        jsonMaterial.uniforms.realativeHeight.value = this.value;
        jsonMaterial.uniforms.realativeHeight.needsUpdate = true;

        lasMaterial.uniforms.realativeHeight.value = this.value;
        lasMaterial.uniforms.realativeHeight.needsUpdate = true;
    }
    sliderHeightNegative.oninput = function () {
        outputNegativeHeight.innerHTML = this.value;
        jsonMaterial.uniforms.negativeRelaHeight.value = this.value;
        jsonMaterial.uniforms.negativeRelaHeight.needsUpdate = true;

        lasMaterial.uniforms.negativeRelaHeight.value = this.value;
        lasMaterial.uniforms.negativeRelaHeight.needsUpdate = true;
    }

    renderDistanceSlider.oninput = function () {
        renderDistanceValueOutput = this.value;
    }

    colorIntensidadSlider.oninput = function () {
        let valorInt = parseFloat(this.value);
        let valorConRango = Math.min(255, valorInt * 255);
        document.getElementById("groupColorIntensidadIndicator").style.background = rgbToHex(valorConRango, valorConRango, valorConRango);

    }

    groupColorClassDrop.oninput = function () {
        document.getElementById("groupColorClasificacionSelect").style.background = getColorMappedValue(this.value);
    }

    sectorBox.onchange = function () {
        if (this.checked == false) {
            sectorBoxDraw = false;
        } else {
            sectorBoxDraw = true;
        }
    }

    colorSecundario.oninput = function () {
        const r = parseInt(this.value.slice(1, 3), 16);
        const g = parseInt(this.value.slice(3, 5), 16);
        const b = parseInt(this.value.slice(5, 7), 16);

        jsonMaterial.uniforms.r2.value = r / 255;
        jsonMaterial.uniforms.r2.needsUpdate = true;
        jsonMaterial.uniforms.g2.value = g / 255;
        jsonMaterial.uniforms.g2.needsUpdate = true;
        jsonMaterial.uniforms.b2.value = b / 255;
        jsonMaterial.uniforms.b2.needsUpdate = true;

        lasMaterial.uniforms.r2.value = r / 255;
        lasMaterial.uniforms.r2.needsUpdate = true;
        lasMaterial.uniforms.g2.value = g / 255;
        lasMaterial.uniforms.g2.needsUpdate = true;
        lasMaterial.uniforms.b2.value = b / 255;
        lasMaterial.uniforms.b2.needsUpdate = true;
    }

    colorPrimario.oninput = function () {
        const r = parseInt(this.value.slice(1, 3), 16);
        const g = parseInt(this.value.slice(3, 5), 16);
        const b = parseInt(this.value.slice(5, 7), 16);

        jsonMaterial.uniforms.r.value = r / 255;
        jsonMaterial.uniforms.r.needsUpdate = true;
        jsonMaterial.uniforms.g.value = g / 255;
        jsonMaterial.uniforms.g.needsUpdate = true;
        jsonMaterial.uniforms.b.value = b / 255;
        jsonMaterial.uniforms.b.needsUpdate = true;

        lasMaterial.uniforms.r.value = r / 255;
        lasMaterial.uniforms.r.needsUpdate = true;
        lasMaterial.uniforms.g.value = g / 255;
        lasMaterial.uniforms.g.needsUpdate = true;
        lasMaterial.uniforms.b.value = b / 255;
        lasMaterial.uniforms.b.needsUpdate = true;
    }

    borderBox.onchange = function () {
        if (this.checked == false) {
            jsonMaterial.uniforms.border.value = 0.0;
            lasMaterial.uniforms.border.value = 0.0;
        } else {
            jsonMaterial.uniforms.border.value = 2.0;
            lasMaterial.uniforms.border.value = 2.0;
        }
    }

    colorDropDown.onchange = function () {
        jsonMaterial.uniforms.isClassification.value = false;
        jsonMaterial.uniforms.isIntensity.value = false;
        jsonMaterial.uniforms.isRGB.value = false;

        lasMaterial.uniforms.isClassification.value = false;
        lasMaterial.uniforms.isIntensity.value = false;
        lasMaterial.uniforms.isRGB.value = false;

        switch (this.value) {
            case "clasificacion":
                jsonMaterial.uniforms.isClassification.value = true;
                lasMaterial.uniforms.isClassification.value = true;
                if (!document.getElementById("intensitySliders").classList.contains('hidden')) {
                    document.getElementById("intensitySliders").classList.toggle("hidden");
                }
                if (!document.getElementById("ranges").classList.contains('hidden')) {
                    document.getElementById("ranges").classList.toggle("hidden");
                }
                document.getElementById("classificationValues").classList.toggle("hidden");
                break;
            case "intensidad":
                jsonMaterial.uniforms.isIntensity.value = true;
                lasMaterial.uniforms.isIntensity.value = true;
                if (!document.getElementById("ranges").classList.contains('hidden')) {
                    document.getElementById("ranges").classList.toggle("hidden");
                }
                if (!document.getElementById("classificationValues").classList.contains('hidden')) {
                    document.getElementById("classificationValues").classList.toggle("hidden");
                }

                document.getElementById("intensitySliders").classList.toggle("hidden");
                break;
            case "rango":
                if (!document.getElementById("intensitySliders").classList.contains('hidden')) {
                    document.getElementById("intensitySliders").classList.toggle("hidden");
                }
                if (!document.getElementById("classificationValues").classList.contains('hidden')) {
                    document.getElementById("classificationValues").classList.toggle("hidden");
                }
                document.getElementById("ranges").classList.toggle("hidden");
                break;
            case "rgb":
                jsonMaterial.uniforms.isRGB.value = true;
                lasMaterial.uniforms.isRGB.value = true;
                if (!document.getElementById("intensitySliders").classList.contains('hidden')) {
                    document.getElementById("intensitySliders").classList.toggle("hidden");
                }
                if (!document.getElementById("classificationValues").classList.contains('hidden')) {
                    document.getElementById("classificationValues").classList.toggle("hidden");
                }
                if (!document.getElementById("ranges").classList.contains('hidden')) {
                    document.getElementById("ranges").classList.toggle("hidden");
                }
                break;

        }

    }



    window.onclick = function (event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }

    function singlePointSelectedDropdownMenu() {
        var menuGrouped = document.getElementById("groupColorClassDrop")
        for (var i = 0; i < 255; i++) {
            menuGrouped.options[menuGrouped.options.length] = new Option(i + 1, i + 1);
        }
    }

    singlePointSelectedDropdownMenu();
});


export function pointSelectedFunction(object, classificationColor, index) {
    if (object === false) {
        document.getElementById("puntoGroupSelect").classList.add("hidden");
        document.getElementById("puntoGroupSelectContainer").classList.add("hidden");
    } else {
        document.getElementById("puntoGroupSelect").classList.remove("hidden");
        document.getElementById("puntoGroupSelectContainer").classList.remove("hidden");
        //pointSelected = object;
        let intensityRange = lasMaterial.uniforms.intensityRange.value;
        let colorClasificacionSelect = document.getElementById("groupColorClasificacionSelect");
        let colorIntensidadDisplay = document.getElementById("groupColorIntensidadIndicator");
        let colorRGBSelect = document.getElementById("groupColorRGBSelect");
        let colorRGBalpha = document.getElementById("groupColorRGBalpha");
        let classificationType = document.getElementById("groupColorClassDrop");
        let intensidadSlider = document.getElementById("colorIntensidadSlider");
        let intensityColor = object.geometry.attributes.intensity.array;
        let classification = object.geometry.attributes.classification.array;
        classificationType.value = classification[index];
        colorClasificacionSelect.style.background = rgbToHex(Math.round(classificationColor[0]), Math.round(classificationColor[1]), Math.round(classificationColor[2]));
        colorIntensidadDisplay.style.background = rgbToHex(Math.min(255, Math.round((intensityColor[index] / intensityRange) * 255)),
            Math.min(255, Math.round((intensityColor[index] / intensityRange) * 255)),
            Math.min(255, Math.round((intensityColor[index] / intensityRange) * 255)));
        intensidadSlider.value = intensityColor[index] / intensityRange;
        if (object.geometry.attributes.COLOR_0) {
            let colorRGB = object.geometry.attributes.COLOR_0.array;
            colorRGBSelect.value = rgbToHex(colorRGB[index], colorRGB[index + 1], colorRGB[index, +2]);
            colorRGBalpha.value = colorRGB[index + 3] / 255;
        }

    }
}

export function pointGroupSelectedFunction(object) {
    if (object === false) {
        document.getElementById("puntoGroupSelect").classList.add("hidden");
        document.getElementById("puntoGroupSelectContainer").classList.add("hidden");
    } else {
        document.getElementById("puntoGroupSelect").classList.remove("hidden");
        document.getElementById("puntoGroupSelectContainer").classList.remove("hidden");

    }
}

function getColorMappedValue(mappedValue) {
    let r = Math.round(lasMaterial.uniforms.colorMap.value[mappedValue * 3] * 255);
    let g = Math.round(lasMaterial.uniforms.colorMap.value[mappedValue * 3 + 1] * 255);
    let b = Math.round(lasMaterial.uniforms.colorMap.value[mappedValue * 3 + 2] * 255);
    return rgbToHex(r, g, b);
}

function valueToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const asignarValoresPuntos = (event) => {
    let classifType = document.getElementById("groupColorClassDrop").value;
    let intensityValue = document.getElementById("colorIntensidadSlider").value;
    let rgbaValueColor = document.getElementById("groupColorRGBSelect").value;
    let rgbaValueSlider = document.getElementById("groupColorRGBalpha").value;
    modificarClasificacion(classifType, intensityValue, hex2rgbFullValue(rgbaValueColor), Math.round(rgbaValueSlider * 255));
};

const asignarValoresGrupoPuntos = (event) => {

    let intensityRange = lasMaterial.uniforms.intensityRange.value;
    let classifType = document.getElementById("groupColorClassDrop").value;
    let intensityValue = document.getElementById("colorIntensidadSlider").value;
    let rgbaValueColor = document.getElementById("groupColorRGBSelect").value;
    let rgbaValueSlider = document.getElementById("groupColorRGBalpha").value;
    modificarClasificacion(parseFloat(classifType), intensityValue * intensityRange, hex2rgbFullValue(rgbaValueColor), Math.round(rgbaValueSlider * 255));
};

function rgbToHex(r, g, b) {
    return "#" + valueToHex(r) + valueToHex(g) + valueToHex(b);
}

function hex2rgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // return {r, g, b} 
    return { r, g, b };
}
function hex2rgbFullValue(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // return {r, g, b} 
    return { r, g, b };
}

function seleccionTipoPunto(event) {
    if (event.target.value === "true") {
        document.getElementById("puntoGroupSelectContainer").classList.add("hidden");
        document.getElementById("puntoGroupSelect").classList.add("hidden");
        document.getElementById("singleGroupTitle").textContent = "Punto seleccionado";
        document.getElementById("buttonPuntoUnico").classList.toggle("selected");
        document.getElementById("buttonPuntoGrupo").classList.toggle("selected");
        pointType.innerHTML = "Punto único";
        isSinglePointSelect = true;
        changeSelectionType();
    } else {
        document.getElementById("puntoGroupSelectContainer").classList.add("hidden");
        document.getElementById("puntoGroupSelect").classList.add("hidden");
        document.getElementById("singleGroupTitle").textContent = "Grupo de puntos seleccionados";
        document.getElementById("buttonPuntoUnico").classList.toggle("selected");
        document.getElementById("buttonPuntoGrupo").classList.toggle("selected");
        pointType.innerHTML = "Selección de puntos";
        isSinglePointSelect = false;
        changeSelectionType();
    }
}

function seleccionCamara(event) {
    let offset;
    const center = new THREE.Vector3();
    let boundingBox;
    let distance;
    if(jsonQuadTree.fileName){
        jsonQuadTree.pointObject.geometry.computeBoundingBox();
        boundingBox = jsonQuadTree.pointObject.geometry.boundingBox;

        distance = new THREE.Box3().setFromObject(jsonQuadTree.pointObject).getSize(new THREE.Vector3()).length();
        boundingBox.getCenter(center);
    }else{
        returnedDots.geometry.computeBoundingBox()
        boundingBox = returnedDots.geometry.boundingBox;

        distance = new THREE.Box3().setFromObject(returnedDots).getSize(new THREE.Vector3()).length();
        boundingBox.getCenter(center);
    }
    distance = distance * 1.5;
    switch (event.target.value) {
        case "left":
            console.log("left");
            offset = new THREE.Vector3(center.x - distance, center.y, center.z);
            break;
        case "right":
            console.log("right");
            offset = new THREE.Vector3(center.x + distance, center.y, center.z);
            break;
        case "top":
            console.log("top");
            offset = new THREE.Vector3(center.x, center.y + distance, center.z);
            break;
        case "bottom":
            console.log("bottom");
            offset = new THREE.Vector3(center.x, center.y - distance, center.z);
            break;
        case "front":
            console.log("front");
            offset = new THREE.Vector3(center.x, center.y, center.z + distance);
            break;
        case "back":
            console.log("back");
            offset = new THREE.Vector3(center.x, center.y, center.z - distance);
            break;
    }
    
    setCameraPosition(center, offset, boundingBox, distance);
}

const colorChange = (e) => {
    if (e.target.value === "skybox") {
        loadSkybox();
    }
    scene.background = new THREE.Color(parseInt(e.target.value));
};

const classificationColorChange = (e) => {

    let color = hex2rgb(e.target.value);
    let mappedValue = 0;
    switch (e.target.id) {
        case "colorClasifNoClass":
            mappedValue = 0;
            break;
        case "colorClasifNoAsig":
            mappedValue = 1;
            break;
        case "colorClasifTerreno":
            mappedValue = 2;
            break;
        case "colorClasifVegB":
            mappedValue = 3;
            break;
        case "colorClasifVegM":
            mappedValue = 4;
            break;
        case "colorClasifVegA":
            mappedValue = 5;
            break;
        case "colorClasifEdificio":
            mappedValue = 6;
            break;
        case "colorClasifPuntoB":
            mappedValue = 7;
            break;
        case "colorClasifReservado":
            mappedValue = 8;
            break;
        case "colorClasifAgua":
            mappedValue = 9;
            break;
        case "colorClasifFerrocarril":
            mappedValue = 10;
            break;
        case "colorClasifCarretera":
            mappedValue = 11;
            break;
        case "colorClasifReservado2":
            mappedValue = 12;
            break;
        case "colorClasifProtCable":
            mappedValue = 13;
            break;
        case "colorClasifCondCable":
            mappedValue = 14;
            break;
        case "colorClasifTorreTran":
            mappedValue = 15;
            break;
        case "colorClasifCondEst":
            mappedValue = 16;
            break;
        case "colorClasifPuente":
            mappedValue = 17;
            break;
        case "colorClasifRuidoAlto":
            mappedValue = 18;
            break;
    }

    lasMaterial.uniforms.colorMap.value[mappedValue * 3] = color.r;
    lasMaterial.uniforms.colorMap.value[mappedValue * 3 + 1] = color.g;
    lasMaterial.uniforms.colorMap.value[mappedValue * 3 + 2] = color.b;
    lasMaterial.uniforms.colorMap.needsUpdate = true;
};

const rgbaColorChange = (e) => {
    let rgbaValueColor = hex2rgbFullValue(document.getElementById("groupColorRGBSelect").value);
    let rgbaValueSlider = document.getElementById("groupColorRGBalpha").value;
    let r = rgbaValueColor.r;
    let g = rgbaValueColor.g;
    let b = rgbaValueColor.b;
    let colorIndicator = "rgba(" + r + "," + g + "," + b + "," + rgbaValueSlider + ")";
    document.getElementById("rgbaIndicator").style.background = colorIndicator;

};


const MenuContent = () => {
    const onDrop = useCallback(async acceptedFiles => {
        if (acceptedFiles.length === 1) {
            let pointCloud;
            try {
                const file = acceptedFiles[0];
                pointCloud = await load(file.path, LASLoader);
            } catch {
                const file = acceptedFiles[0];
                const data = await file.arrayBuffer();
                pointCloud = await load(data, LASLoader, {
                    las: {
                        colorDepth: 16,
                        skip: 10
                    }
                });
            }
            restartTree(true, pointCloud);

            var sliderHeightPositive = document.getElementById("pointHeightPositive");
            var sliderHeightNegative = document.getElementById("pointHeightNegative");


            var outputHeight = document.getElementById("pointHeightPositiveValue");
            var outputNegativeHeight = document.getElementById("pointHeightNegativeValue");

            sliderHeightNegative.value = Math.round(returnedDots.material.uniforms.negativeRelaHeight.value);
            sliderHeightPositive.max = Math.round(returnedDots.material.uniforms.realativeHeight.value);
            sliderHeightNegative.max = Math.round(returnedDots.material.uniforms.realativeHeight.value);
            sliderHeightPositive.min = Math.round(returnedDots.material.uniforms.negativeRelaHeight.value);
            sliderHeightNegative.min = Math.round(returnedDots.material.uniforms.negativeRelaHeight.value);
            sliderHeightPositive.value = Math.round(returnedDots.material.uniforms.realativeHeight.value);
            outputHeight.innerHTML = Math.round(returnedDots.material.uniforms.realativeHeight.value);
            outputNegativeHeight.innerHTML = Math.round(returnedDots.material.uniforms.negativeRelaHeight.value);
        } else {
            const file = acceptedFiles[0];
            restartTree(false, file);

            var sliderHeightPositive = document.getElementById("pointHeightPositive");
            var sliderHeightNegative = document.getElementById("pointHeightNegative");


            var outputHeight = document.getElementById("pointHeightPositiveValue");
            var outputNegativeHeight = document.getElementById("pointHeightNegativeValue");

            sliderHeightNegative.value = Math.round(jsonQuadTree.material.uniforms.negativeRelaHeight.value);
            sliderHeightPositive.max = Math.round(jsonQuadTree.material.uniforms.realativeHeight.value);
            sliderHeightNegative.max = Math.round(jsonQuadTree.material.uniforms.realativeHeight.value);
            sliderHeightPositive.min = Math.round(jsonQuadTree.material.uniforms.negativeRelaHeight.value);
            sliderHeightNegative.min = Math.round(jsonQuadTree.material.uniforms.negativeRelaHeight.value);
            sliderHeightPositive.value = Math.round(jsonQuadTree.material.uniforms.realativeHeight.value);
            outputHeight.innerHTML = Math.round(jsonQuadTree.material.uniforms.realativeHeight.value);
            outputNegativeHeight.innerHTML = Math.round(jsonQuadTree.material.uniforms.negativeRelaHeight.value);
        }


    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    return (
        <div className="off-screen-menu" style={{ overflowY: "scroll" }}>
            <div className="menu-container"><h1>Configuración de puntos</h1></div>
            <div className="content">
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p style={{ style: 380 + 'px' }}>Suelta los archivos aquí.</p> :
                            <p style={{ style: 380 + 'px' }}>Haz click aquí o arrastra un fichero
                                LAS un QuadTree para cargarlo.</p>
                    }
                </div>
                <br></br>
                <div className="menu-container" id="pointsAppearence"><h3>Apariencia de puntos</h3>
                </div>
                <div className="menu-container-body" class="hidden" id="aparienciaContainer">
                    <div className="slidecontainer">
                        <h3>Tamaño de punto: <span id="pointSizeValue"></span></h3>
                        <input type="range" min="0" max="10" defaultValue="1" className="slider" id="pointSize" />
                    </div>
                    <div>
                        <label htmlFor="sectorBox">Mostrar bordes </label>
                        <input type="checkbox" id="borderBox" value="false" />
                    </div>
                </div>
                <br></br>


                <div className="menu-container" id="pointsColor"><h3>Colores y estilos de puntos</h3>
                </div>
                <div className="menu-container-body" id="colorContainer" class="hidden">
                    <br></br>
                    <div className="dropdown">
                        <select id="colorDropDown" className="dropbtn">
                            <span className="caret"></span>
                            <option value="rango">Rango de altura</option>
                            <option value="clasificacion">Clasificación</option>
                            <option value="intensidad">Intensidad</option>
                            <option value="rgb">RGB</option>
                        </select>
                    </div>
                    <br></br>
                    <br></br>
                    <div id="ranges">
                        <h3>Control de colores según altura</h3>
                        <div className="slidecontainer">
                            <p>Límite positivo: <span id="pointHeightPositiveValue"></span></p>
                            <input type="range" min="0" max="100" defaultValue="100" className="slider" id="pointHeightPositive" />
                        </div>
                        <div className="slidecontainer">
                            <p>Límite negativo: <span id="pointHeightNegativeValue"></span></p>
                            <input type="range" min="0" max="100" defaultValue="0" className="slider" id="pointHeightNegative" />
                        </div>
                        <br></br>
                        <h3>Color primario</h3>
                        <input type="color" id="colorPrimario" name="colorPrimario" />
                        <h3>Color secundario</h3>
                        <input type="color" id="colorSecundario" name="colorSecundario" />

                    </div>
                    <div id="classificationValues" className="hidden">
                        <div class="grid-container">
                            <div class="grid-item">
                                <p>No clasificado</p>
                                <input type="color" id="colorClasifNoClass" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>No asignado</p>
                                <input type="color" id="colorClasifNoAsig" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Terreno</p>
                                <input type="color" id="colorClasifTerreno" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Vegetación baja</p>
                                <input type="color" id="colorClasifVegB" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Vegetación media</p>
                                <input type="color" id="colorClasifVegM" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Vegetación alta</p>
                                <input type="color" id="colorClasifVegA" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Edificio</p>
                                <input type="color" id="colorClasifEdificio" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Punto bajo </p>
                                <input type="color" id="colorClasifPuntoB" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Reservado</p>
                                <input type="color" id="colorClasifReservado" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Agua</p>
                                <input type="color" id="colorClasifAgua" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Ferrocarril</p>
                                <input type="color" id="colorClasifFerrocarril" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Superficie de carrtera</p>
                                <input type="color" id="colorClasifCarretera" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Reservado</p>
                                <input type="color" id="colorClasifReservado2" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Protector de cable(señal)</p>
                                <input type="color" id="colorClasifProtCable" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Conductor de cable</p>
                                <input type="color" id="colorClasifCondCable" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Torre de transmisión</p>
                                <input type="color" id="colorClasifTorreTran" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Conector de la estructura de cables</p>
                                <input type="color" id="colorClasifCondEst" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Plataforma del puente</p>
                                <input type="color" id="colorClasifPuente" onInput={classificationColorChange} /></div>
                            <div class="grid-item">
                                <p>Ruido alto</p>
                                <input type="color" id="colorClasifRuidoAlto" onInput={classificationColorChange} /></div>
                        </div>
                    </div>

                    <div id="intensitySliders" className="hidden">
                        <div className="slidecontainer">
                            <p>Rango dinámico del sensor: <span id="pointIntensityRangeValue"></span></p>
                            <input type="range" min="0" max="16" defaultValue="16" className="slider" id="pointIntensityRange" />
                        </div>
                    </div>
                </div>
                <br></br>

                <div className="menu-container" id="visualizacion"><h3>Visualización del mapa</h3>
                </div>
                <div className="menu-container-body" id="visualContainer" class="hidden">
                    <h3>Distancia de renderizado</h3>
                    <div className="slidecontainer">
                        <input type="range" min="1" max="10" defaultValue="1" className="slider" step="0.01" id="renderDistance" />
                    </div>
                    <br></br>
                    <div>
                        <label htmlFor="sectorBox">Mostrar sectores </label>
                        <input type="checkbox" id="sectorBox" value="false" />
                    </div>
                    <br></br>
                    <h3>Color de fondo</h3>
                    <div className="btn-group btn-group-justified" id="bgColor">
                        <label className="btn btn-default btn-sm">
                            <img src="colors/blanco.png" width="100%" htmlFor="radioBlanco" height="10" />
                            <input type="radio" id="radioBlanco" name="color" onClick={colorChange} value="0xFFFFFF" style={{ display: "none" }} />
                        </label>
                        <label className="btn btn-default btn-sm">
                            <input type="radio" name="color" onClick={colorChange} value="0x7393B3" className="btn btn-default btn-sm" style={{ display: "none" }} />
                            <img src="colors/celeste.png" width="100%" height="10" />
                        </label>
                        <label className="btn btn-default btn-sm">
                            <input type="radio" name="color" onClick={colorChange} value="0x000000" className="btn btn-default btn-sm" style={{ display: "none" }} />
                            <img src="colors/negro.png" width="100%" height="10" />
                        </label>
                        <label className="btn btn-default btn-sm"> Skybox
                            <input type="radio" name="color" onClick={colorChange} value="skybox" className="btn btn-default btn-sm" style={{ display: "none" }} />
                        </label>
                    </div>
                    <br></br>
                    <br></br>
                    <h3>Perspectiva de cámara</h3>
                    <div>
                        <label className="btn btn-default-transparent btn-sm">
                            <input type="button" onClick={seleccionCamara} name="tipo" value="left" style={{ display: "none" }} defaultChecked />
                            <img src="colors/left.svg" width="100%" />
                        </label>
                        <label id="multiple" className="btn btn-default-transparent btn-sm">
                            <input type="button" onClick={seleccionCamara} name="tipo" value="right" style={{ display: "none" }} />
                            <img src="colors/right.svg" width="100%" />
                        </label>
                        <label className="btn btn-default-transparent btn-sm">
                            <input type="button" onClick={seleccionCamara} name="tipo" value="top" style={{ display: "none" }} defaultChecked />
                            <img src="colors/top.svg" width="100%" />
                        </label>
                        <label id="multiple" className="btn btn-default-transparent btn-sm">
                            <input type="button" onClick={seleccionCamara} name="tipo" value="bottom" style={{ display: "none" }} />
                            <img src="colors/bottom.svg" width="100%" />
                        </label>
                        <label className="btn btn-default-transparent btn-sm">
                            <input type="button" onClick={seleccionCamara} name="tipo" value="front" style={{ display: "none" }} defaultChecked />
                            <img src="colors/front.svg" width="100%" />
                        </label>
                        <label id="multiple" className="btn btn-default-transparent btn-sm">
                            <input type="button" onClick={seleccionCamara} name="tipo" value="back" style={{ display: "none" }} />
                            <img src="colors/back.svg" width="100%" />
                        </label>
                    </div>
                </div>
                <br></br>
                <div className="menu-container" id="selectPuntos"><h3>Selección de puntos</h3>
                </div>
                <div className="menu-container-body hidden" id="selectPuntosContainer" >
                    <h3>Tipo de selección: <span id="pointType"></span></h3>
                    <br></br>
                    <div onChange={seleccionTipoPunto}>
                        <label className="btn btn-default-grey selected btn-sm" id="buttonPuntoUnico">
                            <input type="radio" name="tipo" value="true" style={{ display: "none" }} defaultChecked />
                            <img src="colors/singlePoint.png" width="100%" />
                        </label>
                        <label className="btn btn-default-grey btn-sm" id="buttonPuntoGrupo">
                            <input type="radio" name="tipo" value="false" style={{ display: "none" }} />
                            <img src="colors/multipleSelect.png" width="100%" />
                        </label>
                    </div>
                </div>
                <br></br>
                <div className="menu-container hidden" id="puntoGroupSelect">
                    <h3 id="singleGroupTitle">Grupo de puntos seleccionados</h3>
                </div>
                <br></br>
                <div className="menu-container-body hidden" id="puntoGroupSelectContainer">
                    <div className="grid-container">
                        <h3 className="grid-title">
                            Clasificación:
                            <hr class="dashed"></hr>
                        </h3>
                        <div className="color-holder">
                            <h4>Color resultante</h4>
                            <div className="colored-div" id="groupColorClasificacionSelect"></div>
                        </div>
                        <div className="input-holder">
                            <h4>Clasificación del punto: </h4>
                            <span>
                                <select id="groupColorClassDrop" className="dropbtn">
                                    <span className="caret"></span>
                                </select>
                            </span>
                        </div>
                        <h3 className="grid-title">
                            Intensidad:
                            <hr class="dashed"></hr>
                        </h3>
                        <div className="color-holder">
                            <h4>Color resultante</h4>
                            <div className="colored-div" id="groupColorIntensidadIndicator"></div>
                        </div>
                        <div className="input-holder">
                            <h4>Intensidad del punto: </h4>
                            <input type="range" id="colorIntensidadSlider" min="0" max="1" step="0.01" defaultValue="0" className="slider adaptive" />
                        </div>
                        <h3 className="grid-title">
                            RGBA:
                            <hr class="dashed"></hr>
                        </h3>
                        <div className="color-holder">
                            <h4>Color resultante</h4>
                            <div className="colored-div" id="rgbaIndicator"></div>
                        </div>
                        <div className="input-holder">
                            <h4>Seleccione RGB: </h4>
                            <input type="color" onChange={rgbaColorChange} id="groupColorRGBSelect" name="colorRGBSelect" />
                            <h4>Rango Alpha: </h4>
                            <input type="range" onChange={rgbaColorChange} id="groupColorRGBalpha" min="0" max="1" step="0.1" defaultValue="1" className="slider adaptive" />
                        </div>
                        <br></br>
                        <button onClick={asignarValoresGrupoPuntos}>Asignar valores</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MenuContent;