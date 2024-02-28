import React from "react";
import './menu_content.css';
import { returnedDots, realativeHeight, negativeRelaHeight, maxHeight } from '../../container/threeJs/ThreeJs';


window.addEventListener("load", function (e) {
    var slider = document.getElementById("pointSize");
    var sliderHeightPositive = document.getElementById("pointHeightPositive");
    var sliderHeightNegative = document.getElementById("pointHeightNegative");
    var classificationFilter = document.getElementById("clasificacion");
    var intesfFilter = document.getElementById("intesf");

    sliderHeightPositive.max = maxHeight;
    sliderHeightNegative.max = maxHeight;

    var output = document.getElementById("pointSizeValue");
    var outputHeight = document.getElementById("pointHeightPositiveValue");
    var outputNegativeHeight = document.getElementById("pointHeightNegativeValue");

    output.innerHTML = slider.value;
    outputHeight.innerHTML = sliderHeightPositive.value;
    outputNegativeHeight.innerHTML = sliderHeightNegative.value;

    slider.oninput = function () {
        output.innerHTML = this.value;
        returnedDots.material.uniforms.pointSize.value = this.value;
    }
    sliderHeightPositive.oninput = function () {
        outputHeight.innerHTML = this.value;
        returnedDots.material.uniforms.realativeHeight.value = this.value;
        returnedDots.material.uniforms.negativeRelaHeight.needsUpdate = true;
    }
    sliderHeightNegative.oninput = function () {
        outputNegativeHeight.innerHTML = this.value;
        returnedDots.material.uniforms.negativeRelaHeight.value = this.value;
        returnedDots.material.uniforms.negativeRelaHeight.needsUpdate = true;
    }

    classificationFilter.onchange = function () {
        if (this.checked == false) {
            returnedDots.material.uniforms.isClassification.value = false;
        } else {
            returnedDots.material.uniforms.isClassification.value = true;
        }
        returnedDots.material.uniforms.isClassification.needsUpdate = true;
    }
    intesfFilter.onchange = function () {
        if (this.checked == false) {
            returnedDots.material.uniforms.isIntensity.value = false;
        } else {
            returnedDots.material.uniforms.isIntensity.value = true;
        }
        returnedDots.material.uniforms.isIntensity.needsUpdate = true;
    }



});

const MenuContent = () => {
    return (
        <div className="off-screen-menu">
            <div className="content">
                <h1>Configuración de puntos</h1>
                <br></br>
                <div className="slidecontainer">
                    <h3>Tamaño de punto: <span id="pointSizeValue"></span></h3>
                    <input type="range" min="0" max="10" defaultValue="1" className="slider" id="pointSize" />
                </div>

                <br></br>

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
                <h3>Color según Clasificación</h3>
                <div>
                    <label htmlFor="clasificacion">Clasificación </label>
                    <input type="checkbox" id="clasificacion" value="false" />
                </div>
                
                <br></br>
                <h3>Color según intensidad del punto</h3>
                <div>
                    <label htmlFor="intesf">Intensidad </label>
                    <input type="checkbox" id="intesf" value="false" />
                </div>
            </div>
        </div>
    )
}

export default MenuContent;