import './App.css';
import { React } from 'react';


import { Header , Menu} from './component/index.js';
import { ThreeJs } from './container/index.js';
import MenuContent from './component/menu_content/menu_content.jsx';


function App() {

  return (
    <div className="App" >
      <MenuContent/>
      <Menu/>
      <ThreeJs/>
    </div>

  );

}

export default App;
