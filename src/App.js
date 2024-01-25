import logo from './logo.svg';
import './App.css';
import { MyDiagram } from './MyDiagram';
import { Example } from './Example'
function App() {
  return (
    <div className="App" style={{height: "100%", width: "100%"}}>
      <Example width={1000} height={1000}></Example>
      {/* <MyDiagram></MyDiagram>  test */}
    </div>
  );
}

export default App;
