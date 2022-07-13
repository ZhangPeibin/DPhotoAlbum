import Home from "./home3";

function App() {
  return (
    <div className="App">
        <h1  style={{marginTop:"64px",marginBottom:"0",paddingBottom:"0"}} className="text-center">
            Build your own decentralized  photo album.</h1>
        <h4  style={{marginBottom:"0",paddingBottom:"0"}} className="text-center">
            Fully decentralized own photo album.</h4>
        <div className='d-flex justify-content-center' style={{marginTop:"24px"}}>
            <span onClick={()=> window.open("#", "_self")} className="btn-main inline lead">Connect with Metamask</span>
        </div>
        <Home />
    </div>
  );
}

export default App;
