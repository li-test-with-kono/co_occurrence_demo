import logo from './logo.svg';
import './App.css';
import { MyDiagram } from './MyDiagram';
function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div style={{height: "100%", "width": "100%"}}>
        <MyDiagram></MyDiagram>
      </div>
      
    </div>
  );
}

export default App;
