import React from "react";
import './menu.css';

window.addEventListener("load", function(e){
        const menu = document.querySelector('.hamburger-menu');
        const menuContent = document.querySelector('.off-screen-menu');
        menu.addEventListener('click', ()=>{
            menu.classList.toggle('active');
            menuContent.classList.toggle('active');
        });
  });




const Menu = () =>{
    return (
        <nav>
            <div className="hamburger-menu">
                <div className="menu menu-top">
                </div>
                <div className="menu menu-mid">
                </div>
                <div className="menu menu-bottom"> 
                </div>
            </div>
        </nav>
    )
}

export default Menu